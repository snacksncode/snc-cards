// import { convertFileData } from "@utils/convertFileData";
// import fs from "fs";

// function _getPathData(path: string) {
//   const fileNameWithoutExt: string = new RegExp(/(.*)\.import\.txt/g).exec(path)?.[1] as string;
//   const newFileName = `${fileNameWithoutExt}.data.ts`;
//   return {
//     newName: newFileName,
//     withoutExt: fileNameWithoutExt,
//   };
// }

// export async function importNewFiles() {
//   for (const file of files) {
//     const path = `./import/${file}`;
//     const fileData = fs.readFileSync(path, { encoding: "utf-8" });
//     const stringData = convertFileData(fileData);
//     const { newName, withoutExt } = _getPathData(path);
//     fs.writeFileSync(
//       `data/${newName}`,
//       `const wordsData = ${stringData}
//       const exported = {
//         id: "${withoutExt}",
//         data: wordsData,
//         lang: "lang",
//         tags: ["tag"],
//       };
//       export default exported;`
//     );
//     fs.unlinkSync(path);
//   }
// }
export {};
