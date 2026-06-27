import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const themeScript = `
(function () {
  try {
    var savedTheme = localStorage.getItem("diagnosehub-theme");

    if (savedTheme === "light") {
      document.documentElement.classList.add("diagnosehub-light");
    } else {
      document.documentElement.classList.remove("diagnosehub-light");
    }
  } catch (error) {
    document.documentElement.classList.remove("diagnosehub-light");
  }
})();
`;

export const metadata: Metadata = {
  title: "DiagnoseHUB",
  description: "KI-Diagnose, Prüfprotokolle und Lernplattform für Kfz-Werkstätten.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>

      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}