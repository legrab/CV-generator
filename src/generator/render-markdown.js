function formatList(items = []) {
  return items.map((item) => `- ${item}`).join("\n");
}

function formatTechnologies(technologies = []) {
  if (!technologies.length) {
    return "";
  }

  return `\nCore technologies:\n${technologies.join(" | ")}\n`;
}

function renderExperienceItem(item) {
  const lines = [];

  lines.push(`### ${item.company}`);
  lines.push("");
  lines.push(`**${item.title}**`);
  lines.push("");
  lines.push(item.period + (item.location ? ` | ${item.location}` : ""));
  lines.push("");

  if (item.intro) {
    lines.push(item.intro);
    lines.push("");
  }

  if (item.bullets?.length) {
    lines.push(formatList(item.bullets));
    lines.push("");
  }

  const technologies = formatTechnologies(item.technologies);
  if (technologies) {
    lines.push(technologies.trim());
    lines.push("");
  }

  return lines.join("\n");
}

function renderProjectItem(item) {
  const lines = [];

  lines.push(`### ${item.name}`);
  lines.push("");

  if (item.period) {
    lines.push(item.period);
    lines.push("");
  }

  if (item.associatedWith) {
    lines.push(`Associated with ${item.associatedWith}`);
    lines.push("");
  }

  if (item.intro) {
    lines.push(item.intro);
    lines.push("");
  }

  if (item.bullets?.length) {
    lines.push(formatList(item.bullets));
    lines.push("");
  }

  const technologies = formatTechnologies(item.technologies);
  if (technologies) {
    lines.push(technologies.trim());
    lines.push("");
  }

  return lines.join("\n");
}

function renderEducationItem(item) {
  const lines = [];

  lines.push(`### ${item.institution}`);
  lines.push("");
  lines.push(`**${item.degree}**`);
  lines.push("");
  lines.push(item.period + (item.location ? ` | ${item.location}` : ""));
  lines.push("");

  if (item.description) {
    lines.push(item.description);
    lines.push("");
  }

  if (item.areas?.length) {
    lines.push(`Core areas:\n${item.areas.join(" | ")}`);
    lines.push("");
  }

  return lines.join("\n");
}

function renderSimpleSection(title, items = []) {
  if (!items.length) {
    return "";
  }

  const values = items.map((item) => {
    if (typeof item === "string") {
      return item;
    }

    const suffix = item.description ? `: ${item.description}` : "";
    return `${item.name}${suffix}`;
  });

  return `## ${title}\n\n${formatList(values)}\n`;
}

export function renderMarkdown(cv) {
  const lines = [];

  lines.push(`# ${cv.profile.name}`);
  lines.push("");
  lines.push(cv.profile.headline);
  lines.push("");

  if (cv.profile.location) {
    lines.push(cv.profile.location);
  }

  if (cv.profile.contact?.email) {
    lines.push(cv.profile.contact.email);
  }

  if (cv.profile.contact?.linkedin) {
    lines.push(cv.profile.contact.linkedin);
  }

  if (cv.profile.contact?.github) {
    lines.push(cv.profile.contact.github);
  }

  lines.push("");

  if (cv.summary.length) {
    lines.push("## Summary");
    lines.push("");
    lines.push(cv.summary.join("\n\n"));
    lines.push("");
  }

  if (cv.sidebar?.sections?.length) {
    for (const section of cv.sidebar.sections) {
      lines.push(`## ${section.title}`);
      lines.push("");
      lines.push(formatList(section.items));
      lines.push("");
    }
  }

  if (cv.experience.length) {
    lines.push("## Experience");
    lines.push("");
    lines.push(cv.experience.map(renderExperienceItem).join("\n"));
  }

  if (cv.projects.length) {
    lines.push("## Projects");
    lines.push("");
    lines.push(cv.projects.map(renderProjectItem).join("\n"));
  }

  if (cv.education.length) {
    lines.push("## Education");
    lines.push("");
    lines.push(cv.education.map(renderEducationItem).join("\n"));
  }

  const certifications = renderSimpleSection("Certifications", cv.certifications);
  if (certifications) {
    lines.push(certifications);
  }

  const languages = renderSimpleSection("Languages", cv.languages);
  if (languages) {
    lines.push(languages);
  }

  const publications = renderSimpleSection("Publications", cv.publications);
  if (publications) {
    lines.push(publications);
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}