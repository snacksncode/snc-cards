import React from "react";

interface Props {
  data: string;
}

const Back = ({ data }: Props) => {
  return <div>{data}</div>;
};

export default Back;
