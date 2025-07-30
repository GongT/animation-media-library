import type { FileBuilder, GenerateContext } from '@build-script/codegen';
import { objectPath } from '@idlebox/common';
import { execa } from 'execa';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const optional_field = /(\S+)\?:/g;
const never_field = /^\s*\S+\?: never;$/gm;
const empty_object = /^\s*\S+:\s*{[\s\n\r]*}[;,]?$/gm;
const multiple_newline = /\n{2,}/g;

const tempDir = resolve(import.meta.dirname, '../temp');
const openApiFile = resolve(tempDir, 'dist.json');
const tsDefineInput = resolve(tempDir, 'bangumi-api.ts');
const outputDir = resolve(import.meta.dirname, 'g');

export async function generate(context: GenerateContext) {
	mkdirSync(outputDir, { recursive: true });

	const data = await downloadOpenApi();
	await executeOpenApiConvert();

	makeLowLevelApiFile(context.file('g/openapi.ts'));
	makeClient(context.file('g/client.ts'), data);
}

function makeLowLevelApiFile(output: FileBuilder) {
	const original = readFileSync(tsDefineInput, 'utf-8');

	let content = original;
	content = content.replace(never_field, '');
	content = content.replace(optional_field, '$1:');
	content = content.replace(empty_object, '\n');

	// UserSubjectCollectionModifyPayload 所有字段改为可选
	content = content.replace(/UserSubjectCollectionModifyPayload: {[\s\S]+?}/, (e) => {
		return e.replace(/(\s+\S+): /g, '$1?: ');
	});

	content = content.replace(multiple_newline, '\n');
	output.append(content);
}

async function executeOpenApiConvert() {
	const cmds = [
		'openapi-typescript',
		openApiFile,
		'--output',
		tsDefineInput,
		'--properties-required-by-default',
		'--enum',
		'--enum-values',
		'--dedupe-enums',
		'--exclude-deprecated',
		'--make-paths-enum',
	];
	await execa('pnpm', ['exec', ...cmds], { stdio: 'inherit' });
}

async function downloadOpenApi() {
	const url = 'https://bangumi.github.io/api/dist.json';
	const output = resolve(tempDir, 'dist.json');
	if (existsSync(output)) {
		console.log('OpenAPI data cached.');

		return JSON.parse(readFileSync(output, 'utf-8'));
	}

	const response = await fetch(url, {
		method: 'GET',
		headers: { 'User-Agent': 'GongT (https://github.com/gongt)' },
	});

	if (!response.ok) {
		throw new Error(`Failed to download OpenAPI: ${response.statusText}`);
	}
	const data = await response.json();

	console.log('OpenAPI data downloaded successfully.');

	mkdirSync(dirname(output), { recursive: true });
	writeFileSync(output, JSON.stringify(data, null, 2));
	return data;
}

type OpenApi = typeof import('../temp/dist.json');

function makeClient(output: FileBuilder, data: OpenApi) {
	output.import(['AbstractClient'], '../common/abstract.js');
	output.import(['BangumiError', 'maybeUnknownError'], '../common/errors.js');
	output.import(['ApiPaths', 'type operations'], './openapi.generated.js');
	output.append('export class BangumiApiClient extends AbstractClient {');

	for (const [path, def] of Object.entries(data.paths)) {
		for (const [method, operation] of Object.entries(def)) {
			if (!operation.operationId) {
				throw new Error(`Operation ID is missing for path: ${path}`);
			}

			try {
				// 添加注释
				output.append(`\t/**`);
				output.append(`\t * ${firstLine(operation.description || operation.summary || '')}`);
				output.append(`\t * ${path}`);
				output.append(`\t */`);

				makeMethod(output, method, operation, data);
			} catch (e: any) {
				e.message += ` (${operation.operationId})`;
				throw e;
			}
		}
	}

	output.append('}');
}
function makeMethod(output: FileBuilder, method: string, operation: any, data: OpenApi) {
	const operationId = operation.operationId;
	const request_p = [];
	const params = readParams(data, operation);

	// 方法名称
	output.append(`\tpublic async ${operationId}(`);

	// 路径参数，分别添加到请求参数中
	const paramsRecreated = params
		.map((param) => {
			if (param.in !== 'path') {
				return;
			}
			output.append(`\t\t${param.name}: operations['${operationId}']['parameters']['path']['${param.name}'],`);
			return param.name;
		})
		.filter((e) => !!e);
	if (paramsRecreated.length) {
		request_p.push(`path: { ${paramsRecreated.join(', ')} }`);
	}

	// 所有query string是一个对象参数
	const haveQuery = params.some((p) => p.in === 'query');
	if (haveQuery) {
		output.append(`\t\tquery: operations['${operationId}']['parameters']['query'],`);
		request_p.push('query');
	}

	// 添加请求体
	const haveRequestBody = !!operation.requestBody?.content?.['application/json']?.schema;
	if (haveRequestBody) {
		output.append(`\t\tbody: operations['${operationId}']['requestBody']['content']['application/json'],`);
	}

	// 结束参数列表
	const haveResult = !!operation.responses['200']?.content?.['application/json']?.schema;
	const returnType = haveResult
		? `operations['${operationId}']['responses']['200']['content']['application/json']`
		: 'void';
	output.append(`\t): Promise<${returnType}> {`);

	// 登录检查
	const requireToken = operation.security?.[0]?.HTTPBearer;
	if (requireToken) {
		output.append(`\t\tthis.requireAccessToken();`);
	}

	// 构造请求参数对象
	const request = [];
	if (haveRequestBody || request_p.length) {
		request.push(`{`);
		if (haveRequestBody) {
			request.push(`\t\t\tbody,`);
		}
		if (request_p.length) {
			request.push(`\t\t\tparams: {`);
			for (const part of request_p) {
				request.push(`\t\t\t\t${part},`);
			}
			request.push(`\t\t\t},`);
		}
		request.push(`\t\t}`);
	}

	// 调用API
	output.append(
		`\t\tconst result = await this.client.${method.toUpperCase()}(ApiPaths.${operationId}${request.length ? `, ${request.join('\n')}` : ''});`
	);

	const haveAbnormalResponse = Object.keys(operation.responses).some((sName) => sName !== '200');

	if (haveAbnormalResponse) {
		output.append(`\t\tif (result.error) {`);
		output.append(`\t\t\tthrow new BangumiError(result.error);`);
		output.append(`\t\t}`);
	} else {
		output.append(`\t\tif (result.error) {`);
		output.append(`\t\t\tmaybeUnknownError((result as any).error);`);
		output.append(`\t\t}\n`);
	}

	if (haveResult) {
		output.append(`\t\treturn result.data;`);
	}
	output.append(`\t}\n`);
}
function readParams(data: OpenApi, operation: any) {
	const params: any[] = [];
	for (let param of operation.parameters || []) {
		if (param.$ref) {
			param = get_ref(data, param.$ref);
		}

		if (param.in === 'path') {
		} else if (param.in === 'query') {
		} else {
			throw new Error(`unsupported parameter location: ${param.in}`);
		}

		params.push(param);
	}
	return params;
}
function get_ref(data: OpenApi, ref: string) {
	if (!ref.startsWith('#')) {
		throw new Error(`Invalid ref: ${ref}`);
	}

	const path = ref.replace('#/', '').replaceAll('/', '.');
	const r = objectPath(data, path);

	if (!r) {
		throw new Error(`reference "${path}" not found`);
	}

	return r;
}

function firstLine(text: string) {
	const first = text.split('\n', 1)[0].trim();
	return first.replace(/^#+/, '').trim();
}
