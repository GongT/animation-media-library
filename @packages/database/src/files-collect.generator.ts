import type { FileBuilder, GenerateContext } from "@build-script/codegen";
import { relativePath } from "@idlebox/common";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { Project, SourceFile } from "ts-morph";

const tscfg = resolve(__dirname, "tsconfig.json");
const outputDir = resolve(__dirname, "g");
logger.info(`Using tsconfig at ${tscfg}`);

const tsExt = /\.ts$/;

export async function generate(builder: GenerateContext) {
	const project = new Project({
		tsConfigFilePath: tscfg,
	});

	const files = project.getSourceFiles();

	await mkdir(outputDir, { recursive: true });

	await generateEntities(
		files.filter(source_filter("schemas")),
		builder.file("./g/schemas.ts"),
	);
	await generateMigrations(
		files.filter(source_filter("migrations")),
		builder.file("./g/migrations.ts"),
	);
	await generateSubscribers(
		files.filter(source_filter("subscribers")),
		builder.file("./g/subscribers.ts"),
	);
}

function source_filter(dirname: string) {
	return (file: SourceFile) => {
		return file.getFilePath().includes(`${__dirname}/${dirname}/`);
	};
}

async function generateEntities(files: SourceFile[], output: FileBuilder) {
	const all_classes = [];
	for (const file of files) {
		const fileRel = calcRel(file.getFilePath());
		logger.log(`processing file ${fileRel}`);

		const classes = [];
		for (const cls of file.getClasses()) {
			if (!cls.isExported() || !cls.getDecorator("Entity")) {
				continue;
			}

			logger.success(` +++ ${cls.getName()}`);
			classes.push(cls.getName());
		}

		if (classes.length === 0) logger.warn(`No entities exported`);

		output.import(classes, fileRel);
		all_classes.push(...classes);
		logger.log("");
	}

	exportArray(output, all_classes);
}

async function generateMigrations(files: SourceFile[], output: FileBuilder) {
	const all_classes = [];
	for (const file of files) {
		const fileRel = calcRel(file.getFilePath());
		logger.log(`processing file ${fileRel}`);

		const classes = [];
		for (const cls of file.getClasses()) {
			if (!cls.isExported()) {
				continue;
			}

			const isImplemented = cls.getImplements().some((e) => {
				return e.getType().getText().includes("MigrationInterface");
			});
			if (!isImplemented) {
				continue;
			}

			logger.success(` +++ ${cls.getName()}`);

			classes.push(cls.getName());
		}

		if (classes.length === 0) logger.warn(`No migrations exported`);

		output.import(classes, fileRel);
		all_classes.push(...classes);
		logger.log("");
	}

	exportArray(output, all_classes);
}

async function generateSubscribers(files: SourceFile[], output: FileBuilder) {
	const all_classes = [];
	for (const file of files) {
		const fileRel = calcRel(file.getFilePath());
		logger.log(`processing file ${fileRel}`);

		const classes = [];
		for (const cls of file.getClasses()) {
			if (!cls.isExported() || !cls.getDecorator("EventSubscriber")) {
				continue;
			}

			logger.success(` +++ ${cls.getName()}`);
			classes.push(cls.getName());
		}

		if (classes.length === 0) logger.warn(`No subscribers exported`);

		output.import(classes, fileRel);
		all_classes.push(...classes);
		logger.log("");
	}

	exportArray(output, all_classes);
}

function exportArray(output: FileBuilder, identifiers: string[]) {
	output.append(`export default [\n\t${identifiers.join(",\n\t")}\n];`);
}

function calcRel(abs: string) {
	return relativePath(outputDir, abs).replace(tsExt, ".js");
}
