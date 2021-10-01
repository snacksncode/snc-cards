import Viewer from "@components/Viewer";
import { NextPage } from "next";
import { useRouter } from "next/dist/client/router";
import React, { useEffect, useState } from "react";

const API_PATH = "/api/data";

const Home: NextPage = () => {
  const { id } = useRouter().query;
  const [data, setData] = useState<null | any[]>(null);
  useEffect(() => {
    if (!id) return;
    fetch(`${API_PATH}/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Data fetching failed");
        return res.json();
      })
      .then((d) => {
        setData(d.data);
      });
  }, [id]);
  if (!data) return <p>Loading...</p>;
  return <Viewer data={data} />;
};

export default Home;
