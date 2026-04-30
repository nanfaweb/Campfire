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
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;900&family=Be+Vietnam+Pro:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased min-h-screen"
        style={{
          background: "#FFF8F2",
          fontFamily: "'Be Vietnam Pro', sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
