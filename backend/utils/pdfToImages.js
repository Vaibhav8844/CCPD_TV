import { fromPath } from "pdf2pic";
import fs from "fs-extra";
import path from "path";

export async function pdfToImages(pdfPath, outDir) {
  await fs.ensureDir(outDir);

  const options = {
    density: 150,
    saveFilename: "page",
    savePath: outDir,
    format: "png",
    width: 1654,
    height: 2339
  };

  const converter = fromPath(pdfPath, options);

  const results = await converter.bulk(-1); // all pages

  const files = results
    .map(r => r.path)
    .filter(Boolean)
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)?.[0] || "0", 10);
      const nb = parseInt(b.match(/\d+/)?.[0] || "0", 10);
      return na - nb;
    });

  if (files.length === 0) {
    throw new Error("No images generated from PDF");
  }

  return files.map(f => path.resolve(f));
}
