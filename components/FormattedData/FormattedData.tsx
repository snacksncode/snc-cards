import { MathJax } from "better-react-mathjax";
import { FC, useState } from "react";

interface Props {
  data: string;
  type?: ClassString;
  className?: string;
}

const FormattedData: FC<Props> = ({ data, type, className }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {/* <div className={styles.answer}> */}
      <div className={className}>
        {type !== "math" ? (
          <span>{data}</span>
        ) : (
          <>
            {!loaded && <span>Loading...</span>}
            <span style={{ display: loaded ? "block" : "none", fontSize: "1.5rem" }}>
              <MathJax onInitTypeset={() => setLoaded(true)}>{String.raw`${data}`}</MathJax>
            </span>
          </>
        )}
      </div>
    </>
  );
};

export default FormattedData;
