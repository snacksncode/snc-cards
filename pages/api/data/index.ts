import { NextApiRequest, NextApiResponse } from "next";
import allData from "./files";

export default async function getAllData(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ data: allData });
}
