export function convertFileData(data: string) {
  const fileLines = data.split("\n");
  const convertedData = [];
  for (const line of fileLines) {
    const [answer, question] = line.split(" - ");
    convertedData.push({ question, answer });
  }
  const dataAsString = JSON.stringify(convertedData, null, 2);
  return dataAsString;
}
