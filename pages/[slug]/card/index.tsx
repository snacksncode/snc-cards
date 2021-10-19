import Viewer from "@components/Viewer";
import React, { useEffect, useState } from "react";
import shuffle from "utils/shuffle";
import { IEntryFields, IQuestion, Class } from "contentful-types";
import { createClient, EntryCollection } from "contentful";
import { GetStaticPropsContext } from "next";

// TODO: Re-Shuffle upon restart

interface Props {
  data: IQuestion[] | null;
  dataClass: Class | null;
}

const client = createClient({
  space: process.env.CF_SPACE_ID || "",
  accessToken: process.env.CF_ACCESS_TOKEN || "",
});

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  const { items } = (await client.getEntries({
    content_type: "entryData",
    "fields.slug": params?.slug,
  })) as EntryCollection<IEntryFields>;

  if (!items.length) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const rawData = items[0].fields;
  return {
    props: {
      data: rawData.data,
      dataClass: rawData.class,
    },
    revalidate: 60,
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

  return { paths, fallback: true };
}

export default function CardId({ data, dataClass }: Props) {
  console.log(`[DEBUG TIME]`);
  console.log(`Data`, data);
  console.log(`Data Class`, dataClass);
  const [shuffledData, setShuffledData] = useState(data);
  useEffect(() => {
    if (data == null) return;
    const shuffled = shuffle(data);
    setShuffledData(shuffled);
  }, [data]);
  if (!data) return <div>Building...</div>;
  console.log(`Is past check`);
  return <Viewer dataClass={dataClass as Class} data={shuffledData as IQuestion[]} />;
}
