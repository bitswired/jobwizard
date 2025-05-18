// @ts-nocheck

import fs from "node:fs";
import openapiTS, { astToString } from "openapi-typescript";
import ts from "typescript";
if (process.argv.length === 3) {
	console.error("Expected at least two argument!");
	process.exit(1);
}
const BLOB = ts.factory.createTypeReferenceNode(
	ts.factory.createIdentifier("Blob"),
);
const NULL = ts.factory.createLiteralTypeNode(ts.factory.createNull());
const input = fs.readFileSync(process.argv[2], "utf-8");

const ast = await openapiTS(input, {
	transform(schemaObject, metadata) {
		if (schemaObject.format === "binary") {
			return schemaObject.nullable
				? ts.factory.createUnionTypeNode([BLOB, NULL])
				: BLOB;
		}
	},
});
const output = astToString(ast);
fs.writeFileSync(process.argv[3], output);
