import React, { useEffect, useRef, useState } from "react";
import shoetest from "shoetest";
import { getData } from "@data/exporter";
import shuffle from "utils/shuffle";
interface Props {
  data: any[];
}

export default function CardId({ data }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [shuffledData, setShuffledData] = useState(data);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [showResult, setShowResult] = useState(false);
  const selectedData = shuffledData[selectedIndex];

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  const check = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowResult(true);
  };
  const verdict = () => {
    if (!inputRef.current) return "bruh";
    const match = shoetest.test(selectedData.answer.toLowerCase(), input.toLowerCase()) as boolean;
    const result = match === true ? "Correct" : "Nahhh";
    inputRef.current.value = "";
    return result;
  };
  const next = () => {
    setShowResult(false);
    setSelectedIndex((i) => i + 1);
  };
  useEffect(() => {
    setShuffledData((data) => shuffle(data));
  }, [data]);

  return (
    <>
      <h1>Question: {selectedData.question}</h1>
      <form onSubmit={check}>
        <input ref={inputRef} type="text" onChange={handleInput} />
        <button type="submit">Check</button>
      </form>
      {showResult && (
        <>
          <p>
            Answer: {selectedData.answer} | Your input: {input}
          </p>
          {verdict()}
          <br />
          <button onClick={next}>Go next</button>
        </>
      )}
    </>
  );
}

export async function getStaticPaths() {
  const paths = (await getData()).map((d) => ({
    params: { id: d.id },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }: any) {
  const data = (await getData()).find((d) => d.id === params.id)?.data;
  return {
    props: { data: data },
  };
}
