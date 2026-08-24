import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");

function normalizeProjectSlug(value = "") {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "project";
}

const projectsDataPath = path.join(process.cwd(), "src/lib/projects.json");
const projectsData = JSON.parse(fs.readFileSync(projectsDataPath, "utf8"));
const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const projectRedirects = Object.entries(projectsData)
  .filter(([, project]) => project.disabled !== true)
  .map(([projectId, project]) => {
    const canonicalSlug = normalizeProjectSlug(project.slug || projectId);
    const legacyPath = `/projects/${projectId}`;
    const canonicalPath = `/projects/${canonicalSlug}`;

    if (legacyPath === canonicalPath) return null;

    return {
      source: legacyPath,
      destination: canonicalPath,
      permanent: true,
    };
  })
  .filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: projectRoot,
  },
  async redirects() {
    return projectRedirects;
  },
};

export default withNextIntl(nextConfig);
