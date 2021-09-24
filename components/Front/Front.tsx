import React from "react";

interface Props {
  data: string;
}

const Front = ({ data }: Props) => {
  return <div>{data}</div>;
};

export default Front;
