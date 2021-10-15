import Viewer from "@components/Viewer";
import React, { useEffect, useState } from "react";
import { getData } from "@data/exporter";
import shuffle from "utils/shuffle";

interface Props {
  data: WordData[];
  dataClass: Data["class"];
}

// TODO: Re-Shuffle upon restart

export default function CardId({ data, dataClass }: Props) {
  const [shuffledData, setShuffledData] = useState(data);
  useEffect(() => {
    setShuffledData((data) => shuffle(data));
  }, [data]);
  return <Viewer dataClass={dataClass} data={shuffledData} />;
}

export async function getStaticPaths() {
  const paths = (await getData()).map((d) => ({
    params: { id: d.id },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }: any) {
  const data = (await getData()).find((d) => d.id === params.id);
  return {
    props: { data: data?.data, dataClass: data?.class },
  };
}
