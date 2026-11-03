import readerUrl from "@jose.espana/docstream/dist/officeparser.browser.js?url";

type WordReader = {
  parseOffice(data: ArrayBuffer): Promise<{ toText(): string }>;
};

// The browser distribution exposes officeParser as a classic-script global.
let loading: Promise<WordReader> | undefined;
function loadReader() {
  return loading ??= new Promise<WordReader>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = readerUrl;
    script.onload = () => {
      const reader = (window as Window & { officeParser?: WordReader }).officeParser;
      if (reader?.parseOffice) resolve(reader);
      else reject(new Error("The Word reader could not start. Please retry."));
    };
    script.onerror = () => reject(new Error("The Word reader could not load. Please retry."));
    document.head.append(script);
  }).catch(error => {
    loading = undefined;
    throw error;
  });
}

export async function readWord(file: File): Promise<string> {
  const reader = await loadReader();
  try {
    const document = await reader.parseOffice(await file.arrayBuffer());
    return document.toText();
  } catch {
    throw new Error("Could not read this Word document. Try saving an unprotected .docx copy or pasting the text.");
  }
}
