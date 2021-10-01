import { NextApiRequest, NextApiResponse } from "next";
import allData from "./files";

export default async function getDataById(req: NextApiRequest, res: NextApiResponse) {
  const requestedId = req.query.id;
  const found = allData.filter((d) => {
    return d.id === requestedId;
  })[0];
  if (!found) return res.status(404).json({ message: "Not Found" });
  res.status(200).json({ id: found.id, data: found.data });
}
