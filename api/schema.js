import fs from "node:fs/promises";
import path from "node:path";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.end("Method not allowed.");
    return;
  }

  const schemaPath = path.resolve("./schema/cv.schema.json");
  const schema = await fs.readFile(schemaPath, "utf8");

  res.setHeader("Content-Type", "application/schema+json; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="cv.schema.json"');
  res.end(schema);
}
