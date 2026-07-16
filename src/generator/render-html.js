import fs from "node:fs/promises";
import path from "node:path";
import nunjucks from "nunjucks";

function layoutClass(item) {
  const classes = [];

  if (item?.layout?.avoidBreakInside !== false) {
    classes.push("avoid-break");
  }

  if (item?.layout?.pageBreakBefore) {
    classes.push("page-break-before");
  }

  return classes.join(" ");
}

function splitHeadline(headline = "") {
  return headline.split("|").map((part) => part.trim());
}

export async function renderHtml(cv, options = {}) {
  const templatePath = path.resolve(options.templatePath ?? "./src/templates/cv.html");
  const template = await fs.readFile(templatePath, "utf8");

  const environment = new nunjucks.Environment(null, {
    autoescape: true,
    trimBlocks: true,
    lstripBlocks: true
  });

  environment.addFilter("joinTech", (items = []) => items.join(" | "));
  environment.addFilter("layoutClass", layoutClass);
  environment.addFilter("splitHeadline", splitHeadline);

  return environment.renderString(template, {
    cv,
    generatedAt: new Date().toISOString(),
    inlineStyles: options.inlineStyles ?? "",
    stylesheetHref: options.stylesheetHref ?? "./cv.css"
  });
}
