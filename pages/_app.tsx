import "@styles/globals.scss";
import type { AppProps } from "next/app";
// import { useEffect } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  // useEffect(() => {
  //   document.body.classList.add("dark");
  // });
  return <Component {...pageProps} />;
}
export default MyApp;
