# CV Builder

A small, maintainable CV generator that turns structured profile data into clean HTML, Markdown, and PDF outputs.

The goal is not to replace design tools. The goal is to keep CV content versioned, reusable, multilingual, and easy to regenerate.

<p>
  <a href="https://project-un4g5.vercel.app/" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#0f766e;color:#ffffff;text-decoration:none;font-weight:700;line-height:1;">
    Open the live Vercel deployment
  </a>
</p>

## Quick Start

```bash
npm install
npx playwright install chromium
npm run validate -- --data ./data/example.cv.yml
npm run example:html
npm run example:markdown
npm run example:pdf
```

The example commands write generated files into `./output`.

## What It Does

CV Builder reads a structured YAML data file and generates one or more CV outputs.

Input format:

```text
YAML
```

Supported outputs:

```text
HTML
PDF
Markdown
```

The default workflow is:

```text
cv.yml -> HTML -> optional PDF
```

HTML is generated first so the result can be reviewed, adjusted, printed manually, or converted into PDF by the tool.

## Why This Exists

CVs are usually hard to maintain because the content and layout are mixed together.

This project separates:

```text
data       -> who you are, what you did, what to show
templates  -> how the CV is structured
styles     -> how the CV looks
outputs    -> generated files
```

That makes it easier to:

```text
- maintain one source of truth
- generate CVs in multiple languages
- adjust styling without rewriting content
- keep consistent HTML, Markdown, and PDF outputs
- version changes in Git
```

## Local Usage

Validate your own CV source:

```bash
npm run validate -- --data ./path/to/your.cv.yml
```

Generate a single output:

```bash
npm run generate -- --data ./path/to/your.cv.yml --format html
npm run generate -- --data ./path/to/your.cv.yml --format markdown
npm run generate -- --data ./path/to/your.cv.yml --format pdf
```

Generate all outputs for all languages defined in the source file:

```bash
npm run example:all
```

## Schema Expectations

At minimum, your YAML source needs:

```text
- profile.name
- profile.headline
- profile.contact.email
- content
```

The `content` object must contain at least one language key, such as `en` or `de`.

If `settings.defaultLanguage` is omitted, the first language key in `content` becomes the default.

Each language block can include:

```text
- summary
- sidebar
- experience
- projects
- education
- certifications
- languages
- publications
```

Download the current example source and schema here:

```text
data/example.cv.yml
schema/cv.schema.json
```

## AI Prompt Suggestion

If you want an AI to help convert an existing CV into the required source file, keep the prompt short and strict:

```text
Rewrite the attached CV into valid YAML for the attached schema. Keep only factual content from the source CV, preserve dates and employers, keep the result concise, and return YAML only.
```

## Vercel Deployment

This repository is Vercel-compatible with a small static frontend and Node.js API routes.

The deployed app provides:

```text
- a browser UI for uploading/pasting CV YAML
- HTML and Markdown generation
- downloadable example data
- downloadable schema documentation
```

Use the browser's print dialog on the generated HTML if you want a PDF from the deployment.

After connecting the repo to Vercel, the root page at `/` serves the browser UI and the API routes provide the generated downloads.

## Example Usage

```bash
cv-builder generate --data ./data/cv.yml --lang en --out ./output --format html
cv-builder generate --data ./data/cv.yml --lang en --out ./output --format pdf
cv-builder generate --data ./data/cv.yml --lang all --out ./output --format all
```

## Suggested Project Structure

```text
cv-builder/
  api/
  data/
    example.cv.yml
  public/
  schema/
    cv.schema.json
  src/
    cli/
    generator/
    templates/
    styles/
  output/
  README.md
  package.json
  vercel.json
```

## Data Concept

The CV data file should support:

```text
- shared profile data
- multiple languages
- summary sections
- sidebar sections
- work experience
- projects
- education
- certifications
- languages
- publications
- configurable visibility per output
```

A single CV data file can generate different language versions from the same source.

## Output Strategy

The first supported output is HTML.

PDF generation uses the same HTML and CSS through a browser-based renderer.

This keeps styling predictable and makes manual review easy before final export.

## License

MIT
