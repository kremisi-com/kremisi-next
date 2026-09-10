import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";

// Small static previews avoid dozens of cold /_next/image transformations
// during the first visit. Originals remain untouched for portfolio pages.
const root = process.cwd();
const projects = JSON.parse(await fs.readFile(path.join(root, "src/lib/projects.json"), "utf8"));
const output = path.join(root, "public/slider-previews");
await fs.mkdir(output, { recursive: true });
const manifest = {};
let bytes = 0;
for (const [id, project] of Object.entries(projects)) {
  if (project.disabled === true) continue;
  for (const filename of project.images || ["main.webp"]) {
    const src = `/projects/${project.assetFolder || id}/${filename}`;
    if (path.extname(filename).toLowerCase() === ".svg") continue;
    const source = await fs.readFile(path.join(root, "public", src));
    const hash = createHash("sha256").update(source).update("slider-preview-v1-480-q60").digest("hex").slice(0, 16);
    const name = `${hash}.webp`;
    const target = path.join(output, name);
    try { await fs.access(target); } catch {
      await sharp(source).rotate().resize({ width: 480, height: 480, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 60, effort: 5 }).toFile(target);
    }
    bytes += (await fs.stat(target)).size;
    manifest[src] = `/slider-previews/${name}`;
  }
}
await fs.writeFile(path.join(root, "src/components/main-slider/preview-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${Object.keys(manifest).length} slider previews: ${(bytes / 1024).toFixed(0)} KiB`);
