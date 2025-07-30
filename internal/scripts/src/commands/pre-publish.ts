import { loadJsonFile, writeJsonFileBack } from "@idlebox/json-edit";
import { cpSync, existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { projectRoot } from "../tools/paths.js";

console.log("pre-publish script running...");
console.log("cwd:", process.cwd());

function writeFile(filePath: string, content: string) {
	if (existsSync(filePath)) {
		throw new Error(`文件不应存在: ${filePath}`);
	}
	writeFileSync(filePath, content, "utf-8");
}

const npmrcContent = `
registry=https://registry.npmjs.org/
git-checks=false
access=public
`;

writeFile(".npmrc", npmrcContent);

const npmignoreContent = `
**/.*
**/test/
config/
temp/
*.tgz
`;

writeFile(".npmignore", npmignoreContent);

cpSync(resolve(projectRoot, "LICENSE"), "LICENSE");

const pkgJson = await loadJsonFile("package.json");
delete pkgJson.publishConfig;

pkgJson.license = "MIT";
pkgJson.repository = {
	type: "git",
	url: "https://github.com/gongt/animation-media-library",
};

for (const [name, version] of Object.entries(pkgJson.devDependencies ?? {})) {
	if (name.startsWith("@internal/") || version === "") {
		delete pkgJson.devDependencies[name];
	}
}

writeJsonFileBack(pkgJson);
