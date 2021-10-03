import Viewer from "@components/Viewer";
import React, { useEffect, useState } from "react";
import { getData } from "@data/exporter";
import shuffle from "utils/shuffle";

interface Props {
  data: any[];
}

export default function CardId({ data }: Props) {
  const [shuffledData, setShuffledData] = useState(data);
  useEffect(() => {
    setShuffledData((data) => shuffle(data));
  }, [data]);
  return <Viewer data={shuffledData} />;
}

export async function getStaticPaths() {
  const paths = (await getData()).map((d) => ({
    params: { id: d.id },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }: any) {
  const data = (await getData()).find((d) => d.id === params.id)?.data;
  return {
    props: { data: data },
  };
}
