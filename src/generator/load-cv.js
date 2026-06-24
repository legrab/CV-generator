import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

function parseCvYaml(raw, sourceLabel) {
  try {
    return YAML.parse(raw);
  } catch (error) {
    throw new Error(`Could not parse YAML file: ${sourceLabel}\n${error.message}`);
  }
}

export async function loadCvData(filePath) {
  if (!filePath) {
    throw new Error("Missing data file path.");
  }

  const absolutePath = path.resolve(filePath);
  const raw = await fs.readFile(absolutePath, "utf8");

  return parseCvYaml(raw, absolutePath);
}

export function loadCvDataFromText(raw, sourceLabel = "input") {
  if (typeof raw !== "string") {
    throw new Error("Missing CV data text.");
  }

  return parseCvYaml(raw, sourceLabel);
}
