import fs from "node:fs/promises";
import path from "node:path";

import { loadCvDataFromText } from "../src/generator/load-cv.js";
import { validateCvData, formatValidationErrors } from "../src/generator/validate-cv.js";
import { resolveCv } from "../src/generator/resolve-cv.js";
import { renderMarkdown } from "../src/generator/render-markdown.js";
import { renderHtml } from "../src/generator/render-html.js";

function readArg(name, fallback = null) {
  const prefix = `--${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));

  return value ? value.slice(prefix.length) : fallback;
}

function requireArg(name) {
  const value = readArg(name);

  if (!value) {
    throw new Error(`Missing required argument --${name}=...`);
  }

  return value;
}

async function main() {
  const inputPath = path.resolve(requireArg("input"));
  const outputPath = path.resolve(requireArg("output"));
  const langArg = readArg("lang", "en");
  const format = readArg("format", "html");

  const schemaPath = path.resolve("./schema/cv.schema.json");
  const templatePath = path.resolve("./src/templates/cv.html");
  const stylePath = path.resolve("./src/styles/cv.css");

  const dataText = await fs.readFile(inputPath, "utf8");
  const cvData = loadCvDataFromText(dataText, inputPath);
  const validation = await validateCvData(cvData, schemaPath);

  if (!validation.valid) {
    throw new Error(`CV data is invalid:\n${formatValidationErrors(validation.errors)}`);
  }

  const lang = langArg === "auto" ? undefined : langArg;
  const cv = resolveCv(cvData, { lang });
  let outputText;

  if (format === "markdown") {
    outputText = renderMarkdown(cv);
  } else if (format === "html") {
    const styles = await fs.readFile(stylePath, "utf8");

    outputText = await renderHtml(cv, {
      templatePath,
      inlineStyles: styles
    });
  } else {
    throw new Error(`Unsupported format: ${format}. Supported formats: html, markdown.`);
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, outputText, "utf8");

  console.log(`Generated ${format} CV: ${outputPath}`);
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}