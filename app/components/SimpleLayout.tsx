"use client";

import { Layout, ConfigProvider, theme, App } from "antd";
import React, { ReactNode } from "react";
import { useDarkMode } from "@/app/lib/useDarkMode";

const { Content } = Layout;

interface SimpleLayoutProps {
  children: ReactNode;
}

export default function SimpleLayout({ children }: SimpleLayoutProps) {
  const { isDarkMode } = useDarkMode();

  const bgColor = isDarkMode ? "#141414" : "#f0f2f5";
  const contentBgColor = isDarkMode ? "#1f1f1f" : "#fff";
  const textColor = isDarkMode ? "#ffffff" : undefined;

  const antdTheme = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorBgContainer: contentBgColor,
      colorBgElevated: isDarkMode ? "#262626" : "#fff",
      colorText: textColor,
      colorBorder: isDarkMode ? "#303030" : undefined,
    },
  };

  return (
    <ConfigProvider theme={antdTheme}>
      <App>
        <Layout suppressHydrationWarning style={{ minHeight: "100vh", background: bgColor }}>
          <Content
            suppressHydrationWarning
            style={{
              margin: "16px",
              padding: 24,
              background: contentBgColor,
              borderRadius: "8px",
              minHeight: "calc(100vh - 32px)",
              ...(textColor && { color: textColor }),
            }}
          >
            {children}
          </Content>
        </Layout>
      </App>
    </ConfigProvider>
  );
}
