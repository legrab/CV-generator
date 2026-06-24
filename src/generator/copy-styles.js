import fs from "node:fs/promises";
import path from "node:path";

export async function copyStyles(options = {}) {
  const sourcePath = path.resolve(options.stylePath ?? "./src/styles/cv.css");
  const outputDirectory = path.resolve(options.outDir ?? "./output");
  const targetPath = path.join(outputDirectory, "cv.css");

  await fs.mkdir(outputDirectory, {
    recursive: true
  });

  await fs.copyFile(sourcePath, targetPath);

  return targetPath;
}