import { FC } from "react";

interface Props {
  text: string;
  size: "lg" | "md";
}

const sizeMap = {
  lg: "text-[8rem]",
  md: "text-[6rem]",
};

const Watermark: FC<Props> = ({ text, size }) => {
  return (
    <div
      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[15deg] font-bold opacity-[0.03] text-text-muted pointer-events-none -z-[1] leading-none select-none ${sizeMap[size]}`}
      aria-hidden="true"
    >
      <span className="absolute left-0 -top-full">{text}</span>
      {text}
      <span className="absolute left-0 top-full">{text}</span>
    </div>
  );
};

export default Watermark;
