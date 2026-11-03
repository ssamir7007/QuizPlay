export async function readNotes(file: File): Promise<string> {
  if (/\.(txt|md)$/i.test(file.name)) return file.text();
  if (/\.docx?$/i.test(file.name)) {
    const { readWord } = await import("./readWord");
    return readWord(file);
  }
  if (!/\.pdf$/i.test(file.name))
    throw new Error("Choose a TXT, MD, PDF, DOC, or DOCX file.");
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = (
    await import("pdfjs-dist/build/pdf.worker.min.mjs?url")
  ).default;
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() })
    .promise;
  try {
    const pages: string[] = [];
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      pages.push(
        (await page.getTextContent()).items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" "),
      );
    }
    return pages.join("\n");
  } finally {
    await doc.destroy();
  }
}
