import fs from "node:fs/promises";
import path from "node:path";

export async function writeOutput(outputPath, content) {
  const absolutePath = path.resolve(outputPath);
  const directory = path.dirname(absolutePath);

  await fs.mkdir(directory, {
    recursive: true
  });

  await fs.writeFile(absolutePath, content, "utf8");

  return absolutePath;
}