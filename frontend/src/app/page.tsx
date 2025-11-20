'use client';

import { motion } from "framer-motion";
import { GiDragonHead, GiScrollQuill, GiCrystalBall, GiSwordman, GiDiceTwentyFacesTwenty, GiMagicSwirl } from "react-icons/gi";
import { FaUserShield, FaUsers, FaRobot, FaCheck } from "react-icons/fa";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DemoPreview from "@/components/landing/DemoPreview";
import RpgSystemsRoadmap from "@/components/landing/RpgSystemsRoadmap";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return null;
  }

  if (user) {
    return null;
  }
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const pillars = [
    {
      icon: <GiCrystalBall className="w-12 h-12" />,
      title: "Inteligência IA",
      subtitle: "Mestre Drogon",
      description: "Narrador e árbitro de regras com compreensão contextual de RPG"
    },
    {
      icon: <GiDiceTwentyFacesTwenty className="w-12 h-12" />,
      title: "Jogador Interativo",
      description: "Participação em sessões compartilhadas com ações, rolagens de dado e roleplay"
    },
    {
      icon: <GiScrollQuill className="w-12 h-12" />,
      title: "Ambiente Narrativo",
      description: "UI responsiva dark medieval com estética de grimório"
    },
    {
      icon: <GiMagicSwirl className="w-12 h-12" />,
      title: "Base Cognitiva",
      description: "IA fundamentada em regras e lore oficial de D&D"
    },
    {
      icon: <FaUsers className="w-12 h-12" />,
      title: "Multiplayer Leve",
      description: "Conexão Mestre ↔ Jogadores dentro de campanhas"
    },
    {
      icon: <GiSwordman className="w-12 h-12" />,
      title: "Gestão Completa",
      description: "Usuários, fichas, contextos, histórico e persistência"
    }
  ];

  const personas = [
    {
      icon: <FaUserShield className="w-16 h-16" />,
      title: "Mestre",
      role: "Game Master",
      features: [
        "Chat com Drogon para narração e dúvidas",
        "Define tom, idioma e nível de detalhe",
        "Cria/edita sessões e parâmetros",
        "Adiciona/remove jogadores",
        "Exporta logs em PDF"
      ]
    },
    {
      icon: <GiSwordman className="w-16 h-16" />,
      title: "Jogador",
      role: "Player",
      features: [
        "Interage com Mestre e Drogon",
        "Ficha D&D simplificada",
        "Rolagens de dado virtuais",
        "Botões de ação rápida",
        "Histórico da jornada"
      ]
    },
    {
      icon: <FaRobot className="w-16 h-16" />,
      title: "Mestre Drogon",
      role: "Narrador IA",
      features: [
        "Descreve cenas e reage a ações",
        "Interpreta mecânicas D&D 5e",
        "Ajusta tom e vocabulário",
        "Gera resumos de sessão"
      ]
    }
  ];

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <motion.div
          className="max-w-5xl w-full text-center space-y-6 relative z-10"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="flex justify-center mb-8">
            <GiDragonHead className="w-32 h-32 text-primary drop-shadow-2xl animate-pulse text-glow-gold animate-float" />
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-6xl md:text-8xl font-medieval font-bold text-metallic-gold"
          >
            Dungeons e Drogas
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-2xl md:text-3xl text-foreground font-lore"
          >
            Plataforma Multi-RPG com Narrador IA
          </motion.p>

          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-lore"
          >
            Jogue <strong className="text-primary">D&D 5e</strong> agora. Em breve: <strong className="text-accent-foreground">Cyberpunk, Vampire</strong> e mais.
            O <span className="text-primary font-semibold">Mestre Drogon</span> narra suas aventuras em qualquer universo RPG,
            numa interface dark medieval de grimório.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 justify-center items-center mt-8">
            <div className="bg-emerald/30 border-2 border-emerald/70 text-emerald px-5 py-2.5 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm hover:bg-emerald/40 transition-all">
              D&D 5e Disponível
            </div>
            <div className="bg-accent/30 border-2 border-accent/70 text-accent-foreground px-5 py-2.5 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm hover:bg-accent/40 transition-all">
              Cyberpunk Q3 2025
            </div>
            <div className="bg-primary/30 border-2 border-primary/70 text-primary px-5 py-2.5 rounded-full text-sm font-bold shadow-glow-intense backdrop-blur-sm animate-pulse hover:bg-primary/40 transition-all">
              100% Gratuito Sempre
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
            <Button size="lg" className="px-10 py-7 text-xl font-bold shadow-glow-intense hover:scale-105 active:scale-95 transition-all bg-shimmer-gold hover:shadow-[0_0_30px_rgba(197,167,91,0.5)]" asChild>
              <Link href="/auth/register">
                Começar Aventura Grátis
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-10 py-7 text-lg font-semibold border-2 border-primary/60 hover:bg-primary/20 hover:border-primary active:scale-95 transition-all" asChild>
              <Link href="/auth/login">
                Fazer Login
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Pilares Estratégicos */}
      <section className="py-24 px-4 relative border-t border-border">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-medieval font-bold mb-4 text-metallic-gold">
              Pilares Estratégicos
            </h2>
            <p className="text-muted-foreground text-lg font-lore">Seis fundamentos que tornam a experiência única</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {pillars.map((pillar, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full bg-card/50 backdrop-blur border-border hover:border-glow-gold transition-all hover-lift relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <CardHeader>
                    <div className="text-primary mb-4 group-hover:animate-sparkle transition-all">{pillar.icon}</div>
                    <CardTitle className="text-xl font-medieval text-primary">{pillar.title}</CardTitle>
                    {pillar.subtitle && (
                      <CardDescription className="text-sm text-primary/80 font-semibold">{pillar.subtitle}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">{pillar.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Personas */}
      <section className="py-24 px-4 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-medieval font-bold mb-4 text-metallic-gold">
              Quem Participa da Aventura?
            </h2>
            <p className="text-muted-foreground text-lg font-lore">Três papéis, uma história épica</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {personas.map((persona, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full bg-grimoire border-primary/30 hover:border-ornate-gold transition-all hover-lift relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-primary/40 rounded-tr-lg"></div>
                  <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-primary/40 rounded-bl-lg"></div>
                  <CardHeader className="text-center relative z-10">
                    <div className="flex justify-center text-primary mb-6 group-hover:text-glow-gold transition-all">{persona.icon}</div>
                    <CardTitle className="text-2xl font-medieval text-primary">{persona.title}</CardTitle>
                    <CardDescription className="text-primary/80 font-semibold">{persona.role}</CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      {persona.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-primary mr-2 text-lg">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Demo Preview */}
      <DemoPreview />

      {/* Como Funciona */}
      <section className="py-24 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-medieval font-bold mb-4 text-metallic-gold">
              Como Funciona?
            </h2>
            <p className="text-muted-foreground text-lg font-lore">3 passos simples para começar sua aventura</p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary to-secondary"></div>

            <div className="space-y-12">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row items-center gap-8"
              >
                <div className="flex-1 text-right">
                  <h3 className="text-2xl font-medieval font-bold mb-2 text-primary">1. Crie sua Campanha</h3>
                  <p className="text-muted-foreground font-lore">
                    Configure o tom narrativo, nível de detalhe e estilo da sua aventura.
                    O Mestre define o cenário e contexto inicial.
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full bg-shimmer-gold flex items-center justify-center text-2xl font-bold z-10 shadow-glow-intense text-background border-2 border-primary/50">
                  1
                </div>
                <div className="flex-1"></div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row items-center gap-8"
              >
                <div className="flex-1"></div>
                <div className="w-16 h-16 rounded-full bg-shimmer-gold flex items-center justify-center text-2xl font-bold z-10 shadow-glow-intense text-background border-2 border-primary/50">
                  2
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-2xl font-medieval font-bold mb-2 text-primary">2. Convide Jogadores</h3>
                  <p className="text-muted-foreground font-lore">
                    Compartilhe o link da campanha com seus amigos.
                    Jogadores entram, criam fichas e se preparam para a aventura.
                  </p>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row items-center gap-8"
              >
                <div className="flex-1 text-right">
                  <h3 className="text-2xl font-medieval font-bold mb-2 text-primary">3. Deixe a Magia Acontecer</h3>
                  <p className="text-muted-foreground font-lore">
                    Interaja com o Mestre Drogon, role dados, tome decisões épicas.
                    A IA narra, arbitra regras e cria uma história única.
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full bg-shimmer-gold flex items-center justify-center text-2xl font-bold z-10 shadow-glow-intense text-background border-2 border-primary/50">
                  3
                </div>
                <div className="flex-1"></div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* RPG Systems Roadmap */}
      <RpgSystemsRoadmap />

      {/* FAQ */}
      <section className="py-24 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-medieval font-bold mb-4 text-metallic-gold">
              Perguntas Frequentes
            </h2>
            <p className="text-muted-foreground text-lg font-lore">Tire suas dúvidas sobre o sistema</p>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-4">
            {[
              {
                q: "O que é Dungeons e Drogas?",
                a: "É uma plataforma multi-RPG que usa inteligência artificial (Mestre Drogon) para narrar aventuras em múltiplos sistemas: D&D 5e (disponível agora), Cyberpunk, Vampire: The Masquerade e outros (em breve). Tudo 100% gratuito."
              },
              {
                q: "É realmente 100% gratuito?",
                a: "Sim! Dungeons e Drogas é e sempre será completamente gratuito. Sem pegadinhas, sem planos premium, sem limites artificiais. Crie campanhas ilimitadas, convide quantos jogadores quiser, chat sem limites com o Drogon."
              },
              {
                q: "Preciso conhecer D&D para jogar?",
                a: "Não! O Mestre Drogon foi projetado para iniciantes. Ele explica as regras conforme necessário e simplifica mecânicas complexas de qualquer sistema RPG."
              },
              {
                q: "Quais sistemas de RPG são suportados?",
                a: "Atualmente: D&D 5e completo. Em breve: Cyberpunk 2020/Red (Q3 2025), Vampire: The Masquerade 5e (Q4 2025). Futuros: Call of Cthulhu, Tormenta 20, Shadowrun. Entre na comunidade para votar nos próximos!"
              },
              {
                q: "Como a IA funciona?",
                a: "Usamos a API Gemini do Google com uma base cognitiva treinada em regras oficiais (via SRD), lore e exemplos narrativos de cada sistema RPG suportado. O Mestre Drogon adapta tom, idioma e estilo à sua campanha."
              },
              {
                q: "Posso criar campanhas ilimitadas?",
                a: "Sim! Crie quantas campanhas quiser, com quantos jogadores precisar, em qualquer sistema disponível. Sem limites, sem custos. Tudo gratuito."
              },
              {
                q: "Funciona em português?",
                a: "Sim! O Mestre Drogon narra fluentemente em português brasileiro, com opções futuras para inglês, espanhol e outros idiomas."
              },
              {
                q: "Posso exportar minhas sessões?",
                a: "Sim! Exporte o histórico completo em Markdown, TXT ou copie para clipboard. Exportação PDF estilizada (grimório) em breve."
              },
              {
                q: "Como vocês se sustentam sendo gratuito?",
                a: "Dungeons e Drogas é um projeto de paixão. No futuro, podemos explorar recursos opcionais (arte customizada, vozes TTS premium), mas o núcleo sempre será 100% gratuito."
              },
              {
                q: "Posso jogar com amigos online?",
                a: "Sim! O sistema suporta campanhas multiplayer em tempo real onde o Mestre convida jogadores para participar da sessão simultaneamente."
              }
            ].map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-card/50 backdrop-blur hover:border-primary/50">
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Por Que Gratuito? */}
      <section className="py-24 px-4 bg-card/30 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-medieval font-bold mb-4 text-metallic-gold">
              Por Que 100% Gratuito?
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6 text-center"
          >
            <Card className="bg-grimoire border-primary/30 p-8">
              <p className="text-lg text-muted-foreground leading-relaxed font-lore mb-6">
                Acreditamos que <strong className="text-primary">RPG é para todos</strong>.
                Nosso objetivo é tornar a narrativa interativa assistida por IA acessível globalmente,
                sem barreiras financeiras.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed font-lore mb-6">
                Dungeons e Drogas é sustentado por <strong className="text-primary">paixão, comunidade</strong> e
                parcerias futuras com editoras de RPG. O núcleo sempre será gratuito.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="p-4 bg-card/50 rounded-lg border border-border">
                  <GiDiceTwentyFacesTwenty className="w-8 h-8 text-primary mb-2 mx-auto" />
                  <h4 className="font-medieval font-bold text-primary mb-2">Campanhas Ilimitadas</h4>
                  <p className="text-sm text-muted-foreground">Crie quantas quiser, sem custos</p>
                </div>
                <div className="p-4 bg-card/50 rounded-lg border border-border">
                  <FaUsers className="w-8 h-8 text-primary mb-2 mx-auto" />
                  <h4 className="font-medieval font-bold text-primary mb-2">Jogadores Ilimitados</h4>
                  <p className="text-sm text-muted-foreground">Convide toda sua mesa</p>
                </div>
                <div className="p-4 bg-card/50 rounded-lg border border-border">
                  <FaRobot className="w-8 h-8 text-primary mb-2 mx-auto" />
                  <h4 className="font-medieval font-bold text-primary mb-2">IA Sem Limites</h4>
                  <p className="text-sm text-muted-foreground">Chat ilimitado com Drogon</p>
                </div>
              </div>
              <p className="text-sm text-emerald font-bold mt-6">
                Transparência: No futuro, podemos oferecer recursos opcionais
                (arte customizada, vozes TTS premium), mas tudo que existe hoje permanecerá gratuito.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-4 bg-muted/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-grimoire border-primary/30 p-12 text-center shadow-arcane relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10 opacity-50"></div>
            <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-primary/60 rounded-tl-lg"></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-primary/60 rounded-br-lg"></div>
            <div className="relative z-10">
              <GiDragonHead className="w-20 h-20 text-primary mx-auto mb-6 animate-pulse text-glow-gold animate-float" />
              <h2 className="text-4xl md:text-5xl font-medieval font-bold mb-6 text-metallic-gold">Pronto para Aventurar-se?</h2>
            <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto font-lore">
              Crie campanhas ilimitadas, convide quantos jogadores quiser, explore múltiplos sistemas de RPG.
            </p>
            <p className="text-2xl text-primary font-bold mb-8 font-medieval">
              Tudo GRÁTIS, para sempre.
            </p>

            {/* Value Props Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8 max-w-3xl mx-auto">
              <div className="bg-card/50 backdrop-blur p-3 rounded-lg border border-primary/30">
                <FaCheck className="w-6 h-6 text-primary mb-1 mx-auto" />
                <p className="text-xs font-bold text-primary">100% Gratuito</p>
              </div>
              <div className="bg-card/50 backdrop-blur p-3 rounded-lg border border-primary/30">
                <GiDiceTwentyFacesTwenty className="w-6 h-6 text-primary mb-1 mx-auto" />
                <p className="text-xs font-bold text-primary">Campanhas Ilimitadas</p>
              </div>
              <div className="bg-card/50 backdrop-blur p-3 rounded-lg border border-primary/30">
                <FaUsers className="w-6 h-6 text-primary mb-1 mx-auto" />
                <p className="text-xs font-bold text-primary">Jogadores Ilimitados</p>
              </div>
              <div className="bg-card/50 backdrop-blur p-3 rounded-lg border border-primary/30">
                <FaRobot className="w-6 h-6 text-primary mb-1 mx-auto" />
                <p className="text-xs font-bold text-primary">IA Sem Limites</p>
              </div>
              <div className="bg-card/50 backdrop-blur p-3 rounded-lg border border-primary/30">
                <GiScrollQuill className="w-6 h-6 text-primary mb-1 mx-auto" />
                <p className="text-xs font-bold text-primary">Multi-Sistema RPG</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-10 py-6 text-xl font-bold shadow-glow-intense hover:scale-105 active:scale-95 transition-all bg-shimmer-gold" asChild>
                <Link href="/auth/register">
                  Começar Jornada Grátis
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-10 py-6 text-xl font-bold border-primary/50 hover:bg-primary/10 active:scale-95 transition-all" asChild>
                <Link href="/auth/login">
                  Já tenho conta
                </Link>
              </Button>
            </div>
            <p className="text-sm text-emerald mt-6 font-semibold">
              Sem cartão de crédito • Sem pegadinhas • Sem limites
            </p>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border bg-card/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <GiDragonHead className="w-8 h-8 text-primary" />
                <span className="text-xl font-medieval font-bold text-primary">
                  D&D
                </span>
              </div>
              <p className="text-muted-foreground text-sm font-lore">
                Sistema narrativo de RPG com inteligência artificial para mestres e jogadores.
              </p>
            </div>

            {/* Produto */}
            <div>
              <h4 className="font-medieval font-semibold text-foreground mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/auth/register" className="hover:text-primary active:text-primary/80 transition-colors">Começar Grátis</Link></li>
                <li><Link href="/auth/login" className="hover:text-primary active:text-primary/80 transition-colors">Login</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary active:text-primary/80 transition-colors">Dashboard</Link></li>
                <li><Link href="/chat" className="hover:text-primary active:text-primary/80 transition-colors">Chat com Drogon</Link></li>
              </ul>
            </div>

            {/* Recursos */}
            <div>
              <h4 className="font-medieval font-semibold text-foreground mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="cursor-not-allowed opacity-50">Documentação (em breve)</span></li>
                <li><span className="cursor-not-allowed opacity-50">Guia de Mestres (em breve)</span></li>
                <li><span className="cursor-not-allowed opacity-50">API (em breve)</span></li>
                <li><span className="cursor-not-allowed opacity-50">Blog (em breve)</span></li>
              </ul>
            </div>

            {/* Comunidade */}
            <div>
              <h4 className="font-medieval font-semibold text-foreground mb-4">Comunidade</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="cursor-not-allowed opacity-50">Discord (em breve)</span></li>
                <li><span className="cursor-not-allowed opacity-50">Twitter (em breve)</span></li>
                <li><span className="cursor-not-allowed opacity-50">GitHub (em breve)</span></li>
                <li><span className="cursor-not-allowed opacity-50">Suporte (em breve)</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm text-center md:text-left font-lore">
              © 2025 Dungeons e Drogas • Feito com amor e magia • MVP em desenvolvimento
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="cursor-not-allowed">Termos de Uso</span>
              <span className="cursor-not-allowed">Privacidade</span>
              <span className="cursor-not-allowed">Cookies</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground font-lore">
              Powered by Gemini AI • Built with Next.js & Firebase
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
