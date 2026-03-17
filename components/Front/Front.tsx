import Watermark from "@components/Watermark";
import { cn } from "@lib/cn";
import React from "react";

interface Props {
  data: string;
  isMobile: boolean | undefined;
}

const Front = ({ data, isMobile }: Props) => {
  return (
    <div className="cursor-pointer absolute overflow-hidden w-full flex h-full backface-hidden bg-bg-400 rounded-lg border-[3px] border-accent-blue isolate">
      <Watermark size="lg" text="question" />
      <div className="m-auto relative">
        <p className={cn("font-medium m-0 text-accent-blue", isMobile ? "text-2xl px-4" : "text-[2.25rem] px-8")}>
          {data}
        </p>
      </div>
    </div>
  );
};

export default Front;
