import type { Metadata } from "next";
import { Cinzel_Decorative, Libre_Baskerville, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CampaignProvider } from "@/contexts/CampaignContext";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { ThemeContextProvider } from "@/contexts/ThemeContext";
import { Navbar } from "@/components/app/navbar";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/app/theme-provider";

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
  title: "Dungeons e Drogas - RPG Narrativo com IA | Mestre Drogon",
  description: "Sistema narrativo interativo de RPG com IA. Mestres e Jogadores criam histórias épicas com o Mestre Drogon, narrador inteligente baseado em D&D 5e. Grátis para começar!",
  keywords: [
    "RPG",
    "D&D",
    "Dungeons and Dragons",
    "IA",
    "Inteligência Artificial",
    "Narrativa",
    "Gemini",
    "Mestre",
    "Jogador",
    "Campanha",
    "RPG Online",
    "Mestre Digital",
    "D&D 5e",
    "Fichas de Personagem",
    "Chat RPG",
    "Narração Automática"
  ],
  authors: [{ name: "Dungeons e Drogas" }],
  creator: "Dungeons e Drogas",
  publisher: "Dungeons e Drogas",
  metadataBase: new URL("https://dungeons-e-drogas.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    title: "Dungeons e Drogas - RPG Narrativo com IA | Mestre Drogon",
    description: "Crie histórias épicas de RPG com o poder da IA. Mestre Drogon narra aventuras dinâmicas e imersivas em um grimório medieval sombrio.",
    siteName: "Dungeons e Drogas",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dungeons e Drogas - Sistema de RPG com IA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dungeons e Drogas - RPG Narrativo com IA",
    description: "Sistema de RPG com narrador IA. Comece sua aventura épica gratuitamente!",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CampaignProvider>
        <ThemeContextProvider>
          <ThemeProvider>
            <NavigationProvider>
              <Navbar />
              <main>{children}</main>
              <Toaster />
            </NavigationProvider>
          </ThemeProvider>
        </ThemeContextProvider>
      </CampaignProvider>
    </AuthProvider>
  );
}

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
        <ThemeWrapper>{children}</ThemeWrapper>
      </body>
    </html>
  );
}
