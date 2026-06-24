function isVisible(item) {
  const layout = item?.layout;

  if (!layout) {
    return true;
  }

  if (layout.visible === false) {
    return false;
  }

  return true;
}

function filterItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.filter((item) => isVisible(item));
}

function normalizeExperienceItem(item) {
  return {
    ...item,
    bullets: item.bullets ?? [],
    technologies: item.technologies ?? []
  };
}

function normalizeProjectItem(item) {
  return {
    ...item,
    bullets: item.bullets ?? [],
    technologies: item.technologies ?? [],
    links: item.links ?? []
  };
}

function normalizeEducationItem(item) {
  return {
    ...item,
    areas: item.areas ?? []
  };
}

export function resolveCv(cvData, options = {}) {
  const defaultLanguage = cvData.settings?.defaultLanguage ?? Object.keys(cvData.content ?? {})[0] ?? "en";
  const lang = options.lang ?? defaultLanguage;

  const localizedContent = cvData.content?.[lang];

  if (!localizedContent) {
    const availableLanguages = Object.keys(cvData.content ?? {}).join(", ");
    throw new Error(`Language "${lang}" was not found. Available languages: ${availableLanguages}`);
  }

  return {
    profile: cvData.profile,
    lang,
    summary: localizedContent.summary ?? [],
    sidebar: localizedContent.sidebar ?? { sections: [] },
    experience: filterItems(localizedContent.experience).map(normalizeExperienceItem),
    projects: filterItems(localizedContent.projects).map(normalizeProjectItem),
    education: filterItems(localizedContent.education).map(normalizeEducationItem),
    certifications: filterItems(localizedContent.certifications),
    languages: filterItems(localizedContent.languages),
    publications: filterItems(localizedContent.publications)
  };
}
