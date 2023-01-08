import React, { useState } from "react";
import { GetStaticPropsContext } from "next";
import FlipCard from "@components/FlipCard";
import EndCard from "@components/EndCard";
import ProgressBar from "@components/ProgressBar";
import useIndexSelectedData from "@hooks/useIndexSelectedData";
import useShuffledData from "@hooks/useShuffledData";
import { AnimatePresence, motion } from "framer-motion";
import styles from "@styles/Card.module.scss";
import useStreak from "@hooks/useStreak";

interface Props {
  rawData: Question[];
  dataClass: ClassString;
}

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  const apiData = await fetch(`${process.env.API_URL}/cards?filters[slug][$eq]=${params?.slug}&populate=questions`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.API_TOKEN}`,
      "content-type": "application/json",
    },
  });
  let dataArray: ApiResponse = await apiData.json();

  if (!dataArray.data.length) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const {
    attributes: { questions, class: classString },
  } = dataArray.data[0];
  return {
    props: {
      rawData: questions,
      dataClass: classString,
    },
    revalidate: 60,
  };
};

export async function getStaticPaths() {
  const rawData = await fetch(`${process.env.API_URL}/cards`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.API_TOKEN}`,
      "content-type": "application/json",
    },
  });
  let data: ApiResponse = await rawData.json();

  const paths = data.data.map((d) => {
    return {
      params: { slug: d.attributes.slug },
    };
  });

  return { paths, fallback: "blocking" };
}

export default function CardId({ rawData, dataClass }: Props) {
  const [incorrectAnswers, setIncorrectAnswers] = useState<Question[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<Question[]>([]);
  const [streak, setStreak, maxStreak, resetStreak] = useStreak();
  const { data, isShuffled, reshuffle } = useShuffledData(rawData);
  const {
    selectedItem,
    selectedIndex,
    nextItem,
    resetIndex,
    amountOfItems,
    progress: { isDone },
  } = useIndexSelectedData(data);

  const onAnswer = (rightAnswer: boolean, data: Question) => {
    const stateUpdater = rightAnswer ? setCorrectAnswers : setIncorrectAnswers;
    stateUpdater((prevState) => {
      if (prevState == null) return [data];
      return [...prevState, data];
    });
    if (rightAnswer === true) {
      setStreak((c) => c + 1);
    }
    if (rightAnswer === false) {
      setStreak(0);
    }
    nextItem();
  };

  const handleRestart = (newData: Question[] | null = null) => {
    resetIndex();
    setIncorrectAnswers([]);
    setCorrectAnswers([]);
    reshuffle(newData);
    resetStreak();
  };

  const getKeyFromData = (d: Question) => {
    return `${d.id}_${d.question}_${d.answer}`;
  };

  if (!rawData || !isShuffled || selectedItem == null) return null;
  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {!isDone ? (
          <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProgressBar currentAmount={selectedIndex} maxAmount={amountOfItems} streak={streak} />
            <AnimatePresence>
              <FlipCard
                key={getKeyFromData(selectedItem)}
                dataClass={dataClass}
                onAnswer={onAnswer}
                data={selectedItem}
              />
            </AnimatePresence>
          </motion.div>
        ) : (
          <EndCard
            key="endcard"
            mode="cards"
            data={{ correct: correctAnswers, incorrect: incorrectAnswers }}
            dataClass={dataClass}
            amount={rawData.length}
            onRestart={handleRestart}
            streak={maxStreak}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
