import { NextPage } from "next";
import Link from "next/link";
import React from "react";
import allData from "./api/data/files";

interface Props {
  data: any[];
}

const Home: NextPage<Props> = ({ data }) => {
  if (!data) return <p>Loading...</p>;
  return (
    <p>
      {data.map((d: any) => {
        return (
          <Link key={d.id} href={`card/${d.id}`}>
            <a style={{ display: "block" }}>Go to: {d.id}</a>
          </Link>
        );
      })}
    </p>
  );
};

export async function getStaticProps() {
  const data = allData;
  return {
    props: {
      data,
    },
  };
}

export default Home;
