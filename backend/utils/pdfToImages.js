import { pdf } from "pdf-to-img";
import fs from "fs-extra";
import path from "path";

export async function pdfToImages(pdfPath, outDir) {
  await fs.ensureDir(outDir);

  try {
    console.log(`Converting PDF: ${pdfPath}`);
    console.log(`Output directory: ${outDir}`);
    
    // Read the PDF file as buffer
    const pdfBuffer = await fs.readFile(pdfPath);
    console.log(`PDF buffer size: ${pdfBuffer.length} bytes`);
    
    const document = await pdf(pdfBuffer, { scale: 1.5 });
    console.log(`PDF document created, starting page iteration...`);
    
    const savePromises = [];
    let pageNum = 1;
    
    for await (const image of document) {
      const currentPage = pageNum;
      const outputPath = path.join(outDir, `page_${currentPage}.png`);
      console.log(`Processing page ${currentPage}...`);
      
      // Save files in parallel
      savePromises.push(
        fs.writeFile(outputPath, image).then(() => {
          console.log(`✓ Saved page ${currentPage}`);
          return outputPath;
        })
      );
      pageNum++;
    }
    
    console.log(`Waiting for all ${savePromises.length} pages to save...`);
    const imagePaths = await Promise.all(savePromises);
    console.log(`PDF conversion complete: ${imagePaths.length} pages`);
    
    if (imagePaths.length === 0) {
      throw new Error("No images generated from PDF");
    }
    
    return imagePaths;
  } catch (error) {
    console.error("PDF conversion error:", error);
    throw new Error(`Failed to convert PDF: ${error.message}`);
  }
}