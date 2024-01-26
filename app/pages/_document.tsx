import { Html, Head, Main, NextScript } from "next/document";
import React from "react";

export default function Document() {
  return (
    <Html>
      <NextScript />
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          // @ts-ignore
          crossOrigin="true"
        />
      </Head>
      <body>
        <Main />
      </body>
    </Html>
  );
}
