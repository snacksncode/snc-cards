import { GetServerSidePropsContext } from "next";

export default function Redirect() {
  return null;
}

export async function getServerSideProps(_context: GetServerSidePropsContext) {
  return {
    redirect: {
      destination: "/",
      permanent: true,
    },
  };
}
