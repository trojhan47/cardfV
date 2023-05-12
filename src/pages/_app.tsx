import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { api } from "../utils/api";
import "../styles/globals.css";
import { RecoilRoot } from "recoil";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Script from "next/script";
import { env } from "@/env.mjs";
import NextNProgress from "nextjs-progressbar";

declare global {
  interface Window {
    VGSShow: any;
  }
}

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <RecoilRoot>
      <NextNProgress color="#F5C045" options={{ showSpinner: false }} />
      <SessionProvider session={session}>
        <Script strategy="beforeInteractive" src={env.NEXT_PUBLIC_VGS_URL} />
        <Script
          strategy="beforeInteractive"
          src="https://userlike-cdn-widgets.s3-eu-west-1.amazonaws.com/3133a99969a0408cb49467e6c26b4fb596592ac7b768475588368fa9c8725b1f.js"
        />
        <Component {...pageProps} />
        <ToastContainer />
      </SessionProvider>
    </RecoilRoot>
  );
};

export default api.withTRPC(MyApp);
