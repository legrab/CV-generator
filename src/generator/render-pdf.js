import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium as playwrightChromium } from "playwright";
import { chromium as playwrightCoreChromium } from "playwright-core";

let sparticuzChromium;

async function getBrowserLaunchOptions(options = {}) {
  if (process.env.VERCEL) {
    sparticuzChromium ??= (await import("@sparticuz/chromium")).default;

    return {
      args: sparticuzChromium.args,
      executablePath: await sparticuzChromium.executablePath(),
      headless: true,
      ...options,
      args: options.args ?? sparticuzChromium.args
    };
  }

  return options;
}

export async function renderPdfFromHtml(htmlPath, pdfPath) {
  const absoluteHtmlPath = path.resolve(htmlPath);
  const absolutePdfPath = path.resolve(pdfPath);

  const browser = await playwrightChromium.launch();
  const page = await browser.newPage();

  await page.goto(pathToFileURL(absoluteHtmlPath).href, {
    waitUntil: "networkidle"
  });

  await page.pdf({
    path: absolutePdfPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true
  });

  await browser.close();

  return absolutePdfPath;
}

export async function renderPdfBufferFromHtml(html, options = {}) {
  const launchOptions = await getBrowserLaunchOptions(options.launchOptions);
  const chromium = process.env.VERCEL ? playwrightCoreChromium : playwrightChromium;
  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage();

  try {
    await page.setContent(html, {
      waitUntil: "networkidle"
    });

    return await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      ...options.pdfOptions
    });
  } finally {
    await browser.close();
  }
}

export async function renderPdfFromHtmlContent(htmlPath, pdfPath, options = {}) {
  const absoluteHtmlPath = path.resolve(htmlPath);
  const absolutePdfPath = path.resolve(pdfPath);
  const html = await fs.readFile(absoluteHtmlPath, "utf8");
  const pdf = await renderPdfBufferFromHtml(html, options);

  await fs.writeFile(absolutePdfPath, pdf);

  return absolutePdfPath;
}
