import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { ConfigProvider, App } from "antd";
import "./globals.css";
import DynamicTitle from "./components/DynamicTitle";
import DarkModeBody from "./components/DarkModeBody";
import GlobalOverlayGuard from "./components/GlobalOverlayGuard";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "School Management System",
  description: "School Management System Dashboard",
  icons: {
    icon: "/render.png",
    shortcut: "/render.png",
    apple: "/render.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased bg-white transition-colors duration-300`}
        suppressHydrationWarning
      >
        <DarkModeBody>
          <ConfigProvider>
            <App>
              <DynamicTitle />
              <GlobalOverlayGuard />
              {children}
            </App>
          </ConfigProvider>
        </DarkModeBody>
      </body>
    </html>
  );
}
