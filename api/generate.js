import fs from "node:fs/promises";
import path from "node:path";

import { loadCvDataFromText } from "../src/generator/load-cv.js";
import { validateCvData, formatValidationErrors } from "../src/generator/validate-cv.js";
import { resolveCv } from "../src/generator/resolve-cv.js";
import { renderMarkdown } from "../src/generator/render-markdown.js";
import { renderHtml } from "../src/generator/render-html.js";

const schemaPath = path.resolve("./schema/cv.schema.json");
const templatePath = path.resolve("./src/templates/cv.html");
const stylePath = path.resolve("./src/styles/cv.css");

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function toDownloadName(lang, format) {
  const extension = format === "markdown" ? "md" : format;
  return `cv-${lang}.${extension}`;
}

function readRequestBody(req) {
  if (typeof req.body === "string" || Buffer.isBuffer(req.body) || typeof req.body === "object") {
    return req.body;
  }

  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });

    req.on("error", reject);
  });
}

function parsePayload(body) {
  if (!body) {
    return {};
  }

  if (typeof body === "object" && !Buffer.isBuffer(body)) {
    return body;
  }

  const raw = Buffer.isBuffer(body) ? body.toString("utf8") : body;

  try {
    return JSON.parse(raw);
  } catch {
    return { data: raw };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  try {
    const body = parsePayload(await readRequestBody(req));
    const dataText = body.data ?? body.yaml ?? body.content;

    if (typeof dataText !== "string" || !dataText.trim()) {
      sendJson(res, 400, { error: "Missing CV data text." });
      return;
    }

    const cvData = loadCvDataFromText(dataText, "request body");
    const validation = await validateCvData(cvData, schemaPath);

    if (!validation.valid) {
      sendJson(res, 422, {
        error: "CV data is invalid.",
        details: formatValidationErrors(validation.errors)
      });
      return;
    }

    const lang = body.lang === "auto" ? undefined : body.lang;
    const format = body.format ?? "html";
    const cv = resolveCv(cvData, { lang });
    const styles = await fs.readFile(stylePath, "utf8");
    const filename = toDownloadName(cv.lang, format);

    if (format === "markdown") {
      const markdown = renderMarkdown(cv);
      res.setHeader("Content-Type", "text/markdown; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.end(markdown);
      return;
    }

    const html = await renderHtml(cv, {
      templatePath,
      inlineStyles: styles
    });

    if (format === "html") {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.end(html);
      return;
    }

    sendJson(res, 400, {
      error: "Unsupported format.",
      supportedFormats: ["html", "markdown"]
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error.message
    });
  }
}
