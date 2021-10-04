import { NextPage } from "next";
import Link from "next/link";
import Fuse from "fuse.js";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { getData } from "@data/exporter";

interface Props {
  dataObject: {
    data: any[];
    id: string;
    tags: string[];
    lang: string;
  }[];
}

const Home: NextPage<Props> = ({ dataObject }) => {
  const [filteredData, setFilteredData] = useState(dataObject);
  const fuse = useRef(
    new Fuse(dataObject, {
      keys: [
        {
          name: "id",
          weight: 0.5,
        },
        {
          name: "tags",
          weight: 0.5,
        },
        {
          name: "lang",
          weight: 0.25,
        },
      ],
    })
  );
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    filter(e.target.value);
  };

  const filter = (filterString: string) => {
    if (!filterString) {
      setFilteredData(dataObject);
      return;
    }
    const data = fuse.current.search(filterString);
    setFilteredData(data as any);
  };

  return (
    <main>
      <input type="text" value={inputValue} onChange={handleInputChange} />
      {filteredData.map((d: any) => {
        if (!d.item) {
          return (
            <Link key={d.id} href={`card/${d.id}`}>
              <a style={{ display: "block" }}>Go to: {d.id}</a>
            </Link>
          );
        }
        return (
          <Link key={d.item.id} href={`card/${d.item.id}`}>
            <a style={{ display: "block" }}>Go to: {d.item.id}</a>
          </Link>
        );
      })}
    </main>
  );
};

export async function getStaticProps() {
  const data = await getData();
  return {
    props: {
      dataObject: data,
    },
  };
}

export default Home;
