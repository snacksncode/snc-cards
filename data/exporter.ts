import fg from "fast-glob";
import { importFiles } from "./handleImports";

// this is used for faster convertion from .txt inside of /import to a .data.ts file
// env variable is only set locally within dev enviroment
const importNewFiles = process.env.IMPORT_NEW_FILES === "1";
if (importNewFiles) importFiles();

const FILE_PATTERN = "**/*.data.*";

export async function getData() {
  const paths = await fg(FILE_PATTERN, { objectMode: true });
  const data = await loadData(paths.map((p) => p.name));
  return data;
}

let loadedData: any[] | null = null;

async function loadData(paths: string[]): Promise<any[]> {
  if (loadedData != null) return loadedData;
  loadedData = [];
  for (const path of paths) {
    const importedData = (await import(`./${path}`)).default;
    const dataObject = {
      id: importedData.id,
      data: importedData.data,
      lang: importedData.lang,
      tags: importedData.tags,
    };
    loadedData.push(dataObject);
  }
  return loadedData;
}
