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
  const [shuffledData, setShuffledData] = useState(data);
  const [magicNumber, setMagicNumber] = useState(Math.random()); //uhmmm fancier far of re-triggering useEffect lmao
  const onRestart = () => {
    setMagicNumber(Math.random());
  };
  useEffect(() => {
    if (data == null) return;
    const shuffled = shuffle(data);
    setShuffledData(shuffled);
  }, [data, magicNumber]);
  if (!data) return <div>Building...</div>;
  return <Viewer dataClass={dataClass as ClassString} onRestart={onRestart} data={shuffledData as QuestionData[]} />;
}
