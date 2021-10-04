import fg from "fast-glob";
import fs from "fs";

export async function importFiles() {
  const found = await fg("**/*.import.txt", { objectMode: true });
  for (const file of found) {
    const fileData = fs.readFileSync(file.path, { encoding: "utf-8" });
    const fileLines = fileData.split("\n");
    const fileNameWithoutExt: string = new RegExp(/(.*)\.import\.txt/g).exec(file.name)?.[1] as string;
    const newFileName = `${fileNameWithoutExt}.data.ts`;
    const data = [];
    for (const line of fileLines) {
      const [answer, question] = line.split(" - ");
      data.push({ question, answer });
    }
    const dataAsString = JSON.stringify(data, null, 2);
    fs.writeFileSync(
      `data/${newFileName}`,
      `const wordsData = ${dataAsString}

const exported = {
  id: "${fileNameWithoutExt}",
  data: wordsData,
  lang: "lang",
  tags: ["tag"],
};

export default exported;`
    );
    fs.unlinkSync(file.path);
  }
}
