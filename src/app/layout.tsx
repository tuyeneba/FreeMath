import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { LangProvider } from "@/context/LangContext";
import { UserProvider } from "@/context/UserContext";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "FreeMath - Toán Trí Tuệ Superbrain",
  description: "Học toán trí tuệ (Fingermath & Soroban) trực tuyến hiệu quả với giao diện sạch sẽ, tập trung.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" data-theme="light">
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <ThemeProvider>
          <LangProvider>
            <UserProvider>
              <Navbar />
              <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {children}
              </main>
            </UserProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
