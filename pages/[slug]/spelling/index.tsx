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
  rawData: QuestionData[] | undefined;
  dataClass: ClassString;
}

const getKeyFromData = (d: QuestionData) => {
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

  const onAnswer = (answeredRight: boolean, input: string, expected: string, data: QuestionData) => {
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
                data={selectedItem as QuestionData}
                onAnswer={onAnswer}
                key={getKeyFromData(selectedItem as QuestionData)}
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
      rawData: rawData.questionData,
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

export default CardId;
