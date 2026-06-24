import fs from "node:fs/promises";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";

export async function validateCvData(cvData, schemaPath = "./schema/cv.schema.json") {
  const absoluteSchemaPath = path.resolve(schemaPath);
  const rawSchema = await fs.readFile(absoluteSchemaPath, "utf8");
  const schema = JSON.parse(rawSchema);

  const ajv = new Ajv2020({
    allErrors: true,
    strict: false
  });

  const validate = ajv.compile(schema);
  const isValid = validate(cvData);

  if (isValid) {
    return {
      valid: true,
      errors: []
    };
  }

  return {
    valid: false,
    errors: validate.errors ?? []
  };
}

export function formatValidationErrors(errors) {
  if (!errors?.length) {
    return "";
  }

  return errors
    .map((error) => {
      const location = error.instancePath || "/";
      return `${location}: ${error.message}`;
    })
    .join("\n");
}