import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "PlanZ Insurance Tools | 保险工具站",
  description: "香港保险工具站 - 生日回溯计算器、复利对比、汇率盈亏、重疾条款对比",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-background text-foreground">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
