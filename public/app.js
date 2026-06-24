const form = document.getElementById("cv-form");
const fileInput = document.getElementById("cv-file");
const dataInput = document.getElementById("cv-data");
const langInput = document.getElementById("cv-lang");
const formatInput = document.getElementById("cv-format");
const statusEl = document.getElementById("status");
const downloadLink = document.getElementById("download-link");
const generateBtn = document.getElementById("generate-btn");

let lastObjectUrl = null;
let pendingDownload = null;

function setStatus(message, tone = "") {
  statusEl.textContent = message;
  statusEl.dataset.tone = tone;
}

function clearDownloadLink() {
  if (lastObjectUrl) {
    URL.revokeObjectURL(lastObjectUrl);
    lastObjectUrl = null;
  }

  pendingDownload = null;

  downloadLink.hidden = true;
  downloadLink.removeAttribute("href");
  downloadLink.removeAttribute("download");
  downloadLink.setAttribute("aria-disabled", "true");
}

function inferFilename(format, lang) {
  return `cv-${lang}.${format}`;
}

function setLanguageOptions(languages, defaultLanguage) {
  langInput.innerHTML = "";

  for (const language of languages) {
    const option = document.createElement("option");
    option.value = language;
    option.textContent = language;
    langInput.appendChild(option);
  }

  if (defaultLanguage && languages.includes(defaultLanguage)) {
    langInput.value = defaultLanguage;
  } else if (languages.length) {
    langInput.value = languages[0];
  }

  langInput.disabled = !languages.length;
}

function parseFilename(contentDisposition, fallback) {
  if (!contentDisposition) {
    return fallback;
  }

  const match = /filename="?(?<name>[^";]+)"?/i.exec(contentDisposition);
  return match?.groups?.name ?? fallback;
}

async function loadFileText(file) {
  if (!file) {
    return "";
  }

  return file.text();
}

async function loadLanguages(dataText) {
  const response = await fetch("/api/languages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ data: dataText })
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? "Could not read languages from uploaded CV.");
  }

  return response.json();
}

function prepareDownload(blob, filename) {
  lastObjectUrl = URL.createObjectURL(blob);
  pendingDownload = {
    url: lastObjectUrl,
    filename
  };

  downloadLink.href = lastObjectUrl;
  downloadLink.download = filename;
  downloadLink.hidden = false;
  downloadLink.textContent = `Download ${filename}`;
  downloadLink.removeAttribute("aria-disabled");
}

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];

  if (!file) {
    return;
  }

  const dataText = await loadFileText(file);
  dataInput.value = dataText;

  try {
    const payload = await loadLanguages(dataText);
    setLanguageOptions(payload.languages ?? [], payload.defaultLanguage);
    setStatus(`Loaded ${file.name}.`, "info");
  } catch (error) {
    langInput.disabled = true;
    setStatus(error.message, "error");
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearDownloadLink();

  const file = fileInput.files?.[0];
  const dataText = dataInput.value.trim() || (await loadFileText(file)).trim();

  if (!dataText) {
    setStatus("Add a CV YAML file or paste the YAML source first.", "error");
    return;
  }

  generateBtn.disabled = true;
  setStatus("Generating your file...", "info");

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        data: dataText,
        lang: langInput.value,
        format: formatInput.value
      })
    });

    const contentType = response.headers.get("content-type") ?? "";

    if (!response.ok) {
      if (contentType.includes("application/json")) {
        const payload = await response.json();
        throw new Error(payload.details ? `${payload.error}\n${payload.details}` : payload.error);
      }

      throw new Error(await response.text());
    }

    const blob = await response.blob();
    const filename = parseFilename(
      response.headers.get("content-disposition"),
      inferFilename(formatInput.value, langInput.value === "auto" ? "auto" : langInput.value)
    );

    prepareDownload(blob, filename);
    setStatus(`Generated ${filename}.`, "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    generateBtn.disabled = false;
  }
});

downloadLink.addEventListener("click", (event) => {
  if (!pendingDownload?.url) {
    event.preventDefault();
    setStatus("Generate a file first.", "info");
    return;
  }

  if (downloadLink.getAttribute("aria-disabled") === "true") {
    event.preventDefault();
  }
});
