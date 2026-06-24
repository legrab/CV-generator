import { loadCvDataFromText } from "../src/generator/load-cv.js";

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
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
    const languages = body.languages?.length
      ? body.languages
      : Object.keys(cvData.content ?? {});
    const defaultLanguage = cvData.settings?.defaultLanguage ?? languages[0] ?? "en";

    sendJson(res, 200, {
      languages,
      defaultLanguage
    });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
}
