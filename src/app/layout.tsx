import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "سیستم مدیریت KPI",
  description: "پلتفرم ارزیابی عملکرد تیم محتوا",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
