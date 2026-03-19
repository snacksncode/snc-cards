import ExpandingBlob from "@components/ExpandingBlob";
import Watermark from "@components/Watermark";
import { cn } from "@lib/cn";
import type { ClassString } from "@/types";

interface Props {
  data: string;
  isMobile: boolean | undefined;
  dataClass: ClassString;
  answeredRight: boolean | null;
  forwardAnswer: () => void;
}

const Back = ({ data, isMobile, answeredRight, forwardAnswer }: Props) => {
  return (
    <div
      className={cn(
        "cursor-pointer absolute overflow-hidden w-full flex h-full backface-hidden bg-bg-400 rounded-lg rotate-x-180 border-[3px] border-accent-peachy transition-[border-color] duration-[250ms] ease-in-out",
        {
          "border-accent-green": answeredRight === true,
          "border-accent-red": answeredRight === false,
        }
      )}
    >
      {answeredRight != null && (
        <ExpandingBlob type={answeredRight === true ? "correct" : "wrong"} onAnimationComplete={forwardAnswer} />
      )}
      <Watermark size="lg" text="answer" />
      <div className="m-auto">
        <div
          className={cn("font-medium m-0 px-8 text-accent-peachy", isMobile ? "text-2xl" : "text-[2.25rem]")}
        >
          {data}
        </div>
      </div>
    </div>
  );
};

export default Back;
