import { NextApiRequest, NextApiResponse } from "next";
import allData from "./files";

export default async function getAllData(_req: NextApiRequest, res: NextApiResponse) {
  const ids = allData.map((d) => d.id);
  res.status(200).json({ ids });
}
