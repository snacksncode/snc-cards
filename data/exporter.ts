import fg from "fast-glob";
import { importNewFiles } from "./handleImports";

// this is used for faster convertion from .txt inside of /import to a .data.ts file
// env variable is only set locally within dev enviroment
const shouldImportNewFiles = process.env.IMPORT_NEW_FILES === "1";
if (shouldImportNewFiles) importNewFiles();

const FILE_PATTERN = "**/*.data.*";

export async function getData() {
  const paths = await fg(FILE_PATTERN, { objectMode: true });
  const data = await loadData(paths.map((p) => p.name));
  return data;
}

let loadedData: Data[] | null = null;

async function loadData(paths: string[]) {
  if (loadedData != null) return loadedData;
  loadedData = [];
  for (const path of paths) {
    const importedData: Data = (await import(`./${path}`)).default;
    const dataObject = {
      id: importedData.id,
      data: importedData.data,
      class: importedData.class,
      tags: importedData.tags,
    };
    loadedData.push(dataObject);
  }
  return loadedData;
}
