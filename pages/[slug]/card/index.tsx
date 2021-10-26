import Viewer from "@components/Viewer";
import React from "react";
import { GetStaticPropsContext } from "next";
import FlipCard from "@components/FlipCard";

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
  if (!data) return <div>Building...</div>;
  return <Viewer shouldShuffle={true} Component={FlipCard} dataClass={dataClass as ClassString} rawData={data} />;
}
