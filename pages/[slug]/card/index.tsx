import Viewer from "@components/Viewer";
import React, { useEffect, useState } from "react";
import shuffle from "utils/shuffle";
import { IEntryFields, IQuestion } from "contentful-types";
import { createClient, EntryCollection } from "contentful";
import { GetStaticPropsContext, InferGetStaticPropsType } from "next";

// TODO: Re-Shuffle upon restart

const client = createClient({
  space: process.env.CF_SPACE_ID || "",
  accessToken: process.env.CF_ACCESS_TOKEN || "",
});

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  const res = (await client.getEntries({
    content_type: "entryData",
  })) as EntryCollection<IEntryFields>;
  const rawData = res.items.find((i) => i.fields.slug === params?.slug)?.fields;
  return {
    props: {
      data: rawData?.data,
      classData: rawData?.class,
    },
  };
};

export async function getStaticPaths() {
  const res = (await client.getEntries({
    content_type: "entryData",
  })) as EntryCollection<IEntryFields>;

  const paths = res.items.map((i) => {
    return {
      params: { slug: i.fields.slug },
    };
  });

  return { paths, fallback: false };
}

export default function CardId({ data, classData }: InferGetStaticPropsType<typeof getStaticProps>) {
  const [shuffledData, setShuffledData] = useState(data);
  useEffect(() => {
    setShuffledData((data) => shuffle(data as IQuestion[]));
  }, [data]);
  if (shuffledData == null || classData == null) return;
  return <Viewer classData={classData} data={shuffledData} />;
}
