import { pdf } from "pdf-to-img";
import fs from "fs-extra";
import path from "path";

export async function pdfToImages(pdfPath, outDir) {
  await fs.ensureDir(outDir);

  try {
    // Read the PDF file as buffer
    const pdfBuffer = await fs.readFile(pdfPath);
    
    const document = await pdf(pdfBuffer, { scale: 1.5 });
    
    const savePromises = [];
    let pageNum = 1;
    
    for await (const image of document) {
      const currentPage = pageNum;
      const outputPath = path.join(outDir, `page_${currentPage}.png`);
      
      // Save files in parallel
      savePromises.push(
        fs.writeFile(outputPath, image).then(() => {
          return outputPath;
        })
      );
      pageNum++;
    }
    
    const imagePaths = await Promise.all(savePromises);
    
    if (imagePaths.length === 0) {
      throw new Error("No images generated from PDF");
    }
    
    return imagePaths;
  } catch (error) {
    throw new Error(`Failed to convert PDF: ${error.message}`);
  }
}