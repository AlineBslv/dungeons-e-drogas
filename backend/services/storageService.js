import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadPDF = async (file) => {
  const pdfDir = path.join(__dirname, "..", "pdfs");
  const filename = `${Date.now()}_${file.originalname}`;
  const destination = path.join(pdfDir, filename);

  // Move arquivo temporário para pasta pdfs
  await fs.rename(file.path, destination);

  return {
    path: destination,
    filename: filename,
    relativePath: `pdfs/${filename}`
  };
};
