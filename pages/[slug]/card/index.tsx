import Viewer from "@components/Viewer";
import React, { useEffect, useState } from "react";
import shuffle from "utils/shuffle";
import { GetStaticPropsContext } from "next";

// TODO: Re-Shuffle upon restart

interface Props {
  data: QuestionData[] | null;
  dataClass: ClassString | null;
}

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  const apiData = await fetch(`${apiUrl}/entries?slug=${params?.slug}`);
  let dataArray: APIData[] = await apiData.json();

  if (!dataArray.length) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const rawData = dataArray[0];
  return {
    props: {
      data: rawData.questionData,
      dataClass: rawData.class,
    },
    revalidate: 60,
  };
};

export async function getStaticPaths() {
  const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  const rawData = await fetch(`${apiUrl}/entries`);
  let data: APIData[] = await rawData.json();

  const paths = data.map((d) => {
    return {
      params: { slug: d.slug },
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
  return <Viewer dataClass={dataClass as ClassString} data={shuffledData as QuestionData[]} />;
}
