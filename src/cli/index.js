#!/usr/bin/env node

import path from "node:path";
import { Command } from "commander";

import { loadCvData } from "../generator/load-cv.js";
import { validateCvData, formatValidationErrors } from "../generator/validate-cv.js";
import { resolveCv } from "../generator/resolve-cv.js";
import { renderMarkdown } from "../generator/render-markdown.js";
import { renderHtml } from "../generator/render-html.js";
import { renderPdfFromHtml } from "../generator/render-pdf.js";
import { writeOutput } from "../generator/write-output.js";
import { copyStyles } from "../generator/copy-styles.js";

const program = new Command();

program
  .name("cv-builder")
  .description("Generate multilingual CV outputs from structured YAML data.")
  .version("0.1.0");

program
  .command("validate")
  .description("Validate a CV data file against the schema.")
  .requiredOption("--data <path>", "Path to the CV YAML file.")
  .option("--schema <path>", "Path to the JSON schema.", "./schema/cv.schema.json")
  .action(async (options) => {
    try {
      const cvData = await loadCvData(options.data);
      const result = await validateCvData(cvData, options.schema);

      if (!result.valid) {
        console.error("CV data is invalid:");
        console.error(formatValidationErrors(result.errors));
        process.exitCode = 1;
        return;
      }

      console.log("CV data is valid.");
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  });

program
  .command("generate")
  .description("Generate CV output files.")
  .requiredOption("--data <path>", "Path to the CV YAML file.")
  .option("--lang <lang>", "Language to generate, or 'all'.")
  .option("--format <format>", "Output format: html, markdown, pdf, or all.", "html")
  .option("--out <path>", "Output directory.", "./output")
  .option("--schema <path>", "Path to the JSON schema.", "./schema/cv.schema.json")
  .option("--template <path>", "Path to the HTML template.", "./src/templates/cv.html")
  .option("--style <path>", "Path to the CSS file.", "./src/styles/cv.css")
  .action(async (options) => {
    try {
      const cvData = await loadCvData(options.data);
      const validation = await validateCvData(cvData, options.schema);

      if (!validation.valid) {
        console.error("CV data is invalid:");
        console.error(formatValidationErrors(validation.errors));
        process.exitCode = 1;
        return;
      }

      const defaultLanguage = cvData.settings?.defaultLanguage ?? Object.keys(cvData.content ?? {})[0] ?? "en";
      const languages =
        options.lang === "all"
          ? cvData.settings?.languages ?? Object.keys(cvData.content ?? {})
          : [options.lang ?? defaultLanguage];

      await copyStyles({
        stylePath: options.style,
        outDir: options.out
      });

      for (const lang of languages) {
        const cv = resolveCv(cvData, {
          lang
        });

        const baseName = `cv-${lang}`;
        const htmlPath = path.join(options.out, `${baseName}.html`);
        const markdownPath = path.join(options.out, `${baseName}.md`);
        const pdfPath = path.join(options.out, `${baseName}.pdf`);

        const shouldWriteHtml = options.format === "html" || options.format === "pdf" || options.format === "all";
        const shouldWriteMarkdown = options.format === "markdown" || options.format === "all";
        const shouldWritePdf = options.format === "pdf" || options.format === "all";

        if (shouldWriteHtml || shouldWritePdf) {
          const html = await renderHtml(cv, {
            templatePath: options.template
          });

          await writeOutput(htmlPath, html);
          console.log(`Generated ${htmlPath}`);
        }

        if (shouldWriteMarkdown) {
          const markdown = renderMarkdown(cv);
          await writeOutput(markdownPath, markdown);
          console.log(`Generated ${markdownPath}`);
        }

        if (shouldWritePdf) {
          await renderPdfFromHtml(htmlPath, pdfPath);
          console.log(`Generated ${pdfPath}`);
        }
      }
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  });

program.parseAsync();
