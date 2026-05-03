import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "CampFire",
  description: "Gather around. Your people are here.",
};

export default function SignupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen selection:bg-primary-fixed selection:text-on-primary-fixed">
      {children}
    </div>
  );
}
