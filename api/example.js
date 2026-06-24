import fs from "node:fs/promises";
import path from "node:path";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.end("Method not allowed.");
    return;
  }

  const examplePath = path.resolve("./data/example.cv.yml");
  const example = await fs.readFile(examplePath, "utf8");

  res.setHeader("Content-Type", "text/yaml; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="example.cv.yml"');
  res.end(example);
}
