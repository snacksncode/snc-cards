import { NextPage } from "next";
import Link from "next/link";
import React from "react";
import { getData } from "@data/exporter";

interface Props {
  data: any[];
}

const Home: NextPage<Props> = ({ data }) => {
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
  const data = await getData();
  return {
    props: {
      data,
    },
  };
}

export default Home;
