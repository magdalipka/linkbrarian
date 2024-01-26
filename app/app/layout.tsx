import { IBM_Plex_Mono } from "next/font/google";
import "../styles/globals.css";
import NextLink from "next/link";
import { COLORS } from "@/common/colors";

const plexMono = IBM_Plex_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plexMono.variable}>
      <body style={{
        backgroundColor: COLORS.grey,
        color: COLORS.white,
      }}>
        <div
          style={{
            height: "2em",
            backgroundColor: COLORS.pink,
            alignItems: "center",
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            padding: "1em",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "1em",
            }}
          >
            <NextLink replace passHref href="/">
              About
            </NextLink>
            <NextLink replace passHref href="/about-registration">
              Registration
            </NextLink>
          </div>
          <NextLink replace passHref href="/dashboard">
            Go to App
          </NextLink>
        </div>
        {children}
      </body>
    </html>
  );
}
