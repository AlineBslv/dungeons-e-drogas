import type { Metadata } from "next";
import { Cinzel_Decorative, Libre_Baskerville, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CampaignProvider } from "@/contexts/CampaignContext";

// Fonte Display - Títulos e cabeçalhos
const cinzelDecorative = Cinzel_Decorative({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-medieval",
  display: "swap",
});

// Fonte Narrativa - Mensagens IA e textos
const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-lore",
  display: "swap",
});

// Fonte UI - Interface e botões
const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dungeons e Drogas - RPG Narrativo com IA",
  description: "Sistema narrativo interativo de RPG com Mestre Drogon, IA poderosa que narra aventuras épicas em um grimório medieval sombrio.",
  keywords: ["RPG", "D&D", "Dungeons and Dragons", "IA", "Narrativa", "Gemini", "Mestre", "Jogador"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${cinzelDecorative.variable} ${libreBaskerville.variable} ${inter.variable} antialiased font-ui`}
      >
        <AuthProvider>
          <CampaignProvider>
            {children}
          </CampaignProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
