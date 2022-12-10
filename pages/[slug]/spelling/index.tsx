import React, { FC, useState } from "react";
import styles from "@styles/Spelling.module.scss";
import { GetStaticPropsContext } from "next";
import { AnimatePresence, motion } from "framer-motion";
import useShuffledData from "@hooks/useShuffledData";
import useIndexSelectedData from "@hooks/useIndexSelectedData";
import EndCard from "@components/EndCard";
import ProgressBar from "@components/ProgressBar";
import SpellingByWord from "@components/SpellingByWord";
import useStreak from "@hooks/useStreak";

interface Props {
  rawData: Question[];
  dataClass: ClassString;
}

const getKeyFromQuestion = (d: Question) => {
  return `${d.id}_${d.question}_${d.answer}`;
};

const CardId: FC<Props> = ({ rawData, dataClass }) => {
  const { data, isShuffled, reshuffle } = useShuffledData(rawData);
  const { selectedItem, selectedIndex, nextItem, resetIndex, progress } = useIndexSelectedData(data);
  const [incorrectAnswers, setIncorrectAnswers] = useState<SpellingData[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<SpellingData[]>([]);
  const [streak, setStreak, maxStreak, resetStreak] = useStreak();

  const onRestart = () => {
    resetIndex();
    setIncorrectAnswers([]);
    setCorrectAnswers([]);
    reshuffle();
    resetStreak();
  };

  const onAnswer = (answeredRight: boolean, input: string, expected: string, data: Question) => {
    const stateUpdater = answeredRight ? setCorrectAnswers : setIncorrectAnswers;
    const answerData: SpellingData = {
      input,
      expected,
      data,
    };
    stateUpdater((prevState) => {
      return [...prevState, answerData];
    });
    if (answeredRight === true) {
      setStreak((c) => c + 1);
    }
    if (answeredRight === false) {
      setStreak(0);
    }
    nextItem();
  };

  if (!rawData || !isShuffled) return <div>Building...</div>;
  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {!progress.isDone ? (
          <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProgressBar currentAmount={selectedIndex} maxAmount={rawData.length} streak={streak} />
            <AnimatePresence>
              <SpellingByWord
                data={selectedItem as Question}
                onAnswer={onAnswer}
                key={getKeyFromQuestion(selectedItem as Question)}
              />
            </AnimatePresence>
          </motion.div>
        ) : (
          <EndCard
            key="endcard"
            mode="spelling"
            dataClass={dataClass}
            data={{ incorrect: incorrectAnswers, correct: correctAnswers }}
            amount={rawData.length}
            onRestart={onRestart}
            streak={maxStreak}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

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

  return { paths, fallback: false };
}

export default CardId;
