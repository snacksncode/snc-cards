import React, { FC, useState } from "react";
import styles from "@styles/Spelling.module.scss";
import { GetStaticPropsContext } from "next";
import { AnimatePresence, motion } from "framer-motion";
import useShuffledData from "@hooks/useShuffledData";
import useIndexSelectedData from "@hooks/useIndexSelectedData";
import EndCard from "@components/EndCard";
import ProgressBar from "@components/ProgressBar";
import Spelling from "@components/Spelling";

interface Props {
  rawData: QuestionData[] | undefined;
}

const getKeyFromData = (d: QuestionData) => {
  return `${d.id}_${d.question}_${d.answer}`;
};

const CardId: FC<Props> = ({ rawData }) => {
  const { data, isShuffled, reshuffle } = useShuffledData(rawData);
  const { selectedItem, selectedIndex, nextItem, resetIndex, progress } = useIndexSelectedData(data);
  const [incorrectAnswers, setIncorrectAnswers] = useState<QuestionData[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<QuestionData[]>([]);

  const onRestart = () => {
    resetIndex();
    setIncorrectAnswers([]);
    setCorrectAnswers([]);
    reshuffle();
  };

  const onAnswer = (rightAnswer: boolean, data: QuestionData) => {
    const stateUpdater = rightAnswer ? setCorrectAnswers : setIncorrectAnswers;
    stateUpdater((prevState) => {
      if (prevState == null) return [data];
      return [...prevState, data];
    });
    nextItem();
  };

  if (!rawData || !isShuffled) return <div>Building...</div>;
  return (
    <div key="container" className={styles.container}>
      <AnimatePresence exitBeforeEnter>
        {!progress.isDone ? (
          <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProgressBar currentAmount={selectedIndex} maxAmount={rawData.length} />
            <AnimatePresence>
              <Spelling
                data={selectedItem as QuestionData}
                onAnswer={onAnswer}
                key={getKeyFromData(selectedItem as QuestionData)}
              />
            </AnimatePresence>
          </motion.div>
        ) : (
          <EndCard
            key="endcard"
            incorrect={incorrectAnswers}
            correct={correctAnswers}
            amount={rawData.length}
            onRestart={onRestart}
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
