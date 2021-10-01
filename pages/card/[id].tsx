import Viewer from "@components/Viewer";
import React from "react";
import allData from "@data/exporter";

interface Props {
  data: any[];
}

export default function CardId({ data }: Props) {
  return <Viewer data={data} />;
}

export async function getStaticPaths() {
  const paths = allData.map((d) => ({
    params: { id: d.id },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }: any) {
  const data = allData.find((d) => d.id === params.id)?.data;
  return {
    props: { data: data },
  };
}
