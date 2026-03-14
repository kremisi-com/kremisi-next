import fs from "node:fs";
import path from "node:path";

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
  async redirects() {
    return projectRedirects;
  },
};

export default nextConfig;
