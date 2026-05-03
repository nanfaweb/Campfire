import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "CampFire — Home",
  description:
    "Your CampFire feed — stories, posts, and friends all in one warm place.",
};

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
