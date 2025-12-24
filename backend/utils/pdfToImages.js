import pdf from "pdf-poppler";
import fs from "fs-extra";
import path from "path";

export async function pdfToImages(pdfPath, outDir) {
  await fs.ensureDir(outDir);

  const opts = {
    format: "png",
    out_dir: outDir,
    out_prefix: "page",
    page: null
  };

  await pdf.convert(pdfPath, opts);

  const files = await fs.readdir(outDir);
  return files
    .filter(f => f.endsWith(".png"))
    .sort()
    .map(f => path.join(outDir, f));
}
