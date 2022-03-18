import React, { PropsWithChildren, useState } from "react";
import { GetStaticPropsContext } from "next";
import FlipCard from "@components/FlipCard";
import EndCard from "@components/EndCard";
import ProgressBar from "@components/ProgressBar";
import useIndexSelectedData from "@hooks/useIndexSelectedData";
import useShuffledData from "@hooks/useShuffledData";
import { AnimatePresence, motion } from "framer-motion";
import { MathJaxContext } from "better-react-mathjax";
import styles from "@styles/Card.module.scss";
import useStreak from "@hooks/useStreak";

interface Props {
  rawData: QuestionData[];
  dataClass: ClassString;
}

const DataWrapper = ({ type, children }: PropsWithChildren<{ type?: ClassString }>) => {
  if (type === "math") return <MathJaxContext config={{ options: { enableMenu: false } }}>{children} </MathJaxContext>;
  return <>{children}</>;
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

export default function CardId({ rawData, dataClass }: Props) {
  const [incorrectAnswers, setIncorrectAnswers] = useState<QuestionData[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<QuestionData[]>([]);
  const [streak, setStreak, maxStreak, resetStreak] = useStreak();
  const { data, reshuffle } = useShuffledData(rawData);
  const {
    selectedItem,
    selectedIndex,
    nextItem,
    resetIndex,
    progress: { isDone },
  } = useIndexSelectedData(data);

  const onAnswer = (rightAnswer: boolean, data: QuestionData) => {
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

  const handleRestart = () => {
    resetIndex();
    setIncorrectAnswers([]);
    setCorrectAnswers([]);
    reshuffle();
    resetStreak();
  };

  const getKeyFromData = (d: QuestionData) => {
    return `${d.id}_${d.question}_${d.answer}`;
  };

  if (!rawData) return <div>Building...</div>;
  if (selectedItem == null) return;
  return (
    <DataWrapper type={dataClass}>
      <div className={styles.container}>
        <AnimatePresence exitBeforeEnter>
          {!isDone ? (
            <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProgressBar currentAmount={selectedIndex} maxAmount={rawData.length} streak={streak} />
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
    </DataWrapper>
  );
}
