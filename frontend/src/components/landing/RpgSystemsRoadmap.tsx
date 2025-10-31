'use client';

import { motion } from "framer-motion";
import { GiDragonHead, GiCyberEye, GiBat, GiScrollUnfurled, GiSpellBook } from "react-icons/gi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

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

export default function RpgSystemsRoadmap() {
  const systems = [
    {
      name: "D&D 5e",
      icon: <GiDragonHead className="w-16 h-16" />,
      status: "available",
      badge: "DISPONÍVEL AGORA",
      badgeColor: "bg-emerald text-background",
      release: "Lançado",
      description: "Dungeons & Dragons 5ª Edição - O clássico sistema de RPG medieval",
      features: [
        "Base cognitiva completa (PHB, DMG, MM via SRD)",
        "Busca semântica de regras oficiais",
        "Geração automática de NPCs e encontros",
        "Fichas de personagem com cálculos automáticos",
        "Biblioteca de magias e equipamentos"
      ],
      cta: "Começar Aventura",
      ctaLink: "/auth/register",
      highlighted: true
    },
    {
      name: "Cyberpunk RED",
      icon: <GiCyberEye className="w-16 h-16" />,
      status: "coming-soon",
      badge: "EM BREVE",
      badgeColor: "bg-accent text-foreground",
      release: "Q3 2025",
      description: "RPG cyberpunk de ação: netrunning, implantes e Night City",
      features: [
        "Sistema de netrunning e hacking",
        "Implantes cibernéticos e humanity",
        "Combate urbano tático",
        "Geração de fixers e corporações",
        "Cenário Night City completo"
      ],
      cta: "Notificar Quando Lançar",
      ctaLink: "/auth/register",
      highlighted: false
    },
    {
      name: "Vampire: The Masquerade 5e",
      icon: <GiBat className="w-16 h-16" />,
      status: "coming-soon",
      badge: "EM BREVE",
      badgeColor: "bg-destructive/80 text-foreground",
      release: "Q4 2025",
      description: "RPG vampírico de intrigas políticas e horror pessoal",
      features: [
        "Sistema de clãs e disciplinas",
        "Mecânicas de humanidade e fome",
        "Intrigas entre Camarilla e Anarquistas",
        "Geração de NPCs vampíricos",
        "Cenários urbanos góticos"
      ],
      cta: "Notificar Quando Lançar",
      ctaLink: "/auth/register",
      highlighted: false
    },
    {
      name: "Outros Sistemas",
      icon: <GiScrollUnfurled className="w-16 h-16" />,
      status: "future",
      badge: "VOTE AGORA",
      badgeColor: "bg-primary/20 text-primary border-2 border-primary/50",
      release: "2026+",
      description: "Ajude a escolher os próximos sistemas RPG da plataforma",
      features: [
        "Call of Cthulhu 7e - Horror lovecraftiano",
        "Tormenta 20 - RPG brasileiro",
        "Shadowrun 6e - Fantasia cyberpunk",
        "Pathfinder 2e - D&D avançado",
        "Outros? Sugira na comunidade!"
      ],
      cta: "Votar na Comunidade",
      ctaLink: "/auth/register",
      highlighted: false
    }
  ];

  return (
    <section className="py-24 px-4 bg-muted/20 border-y border-border">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-medieval font-bold mb-6 text-metallic-gold">
            Um Sistema, Múltiplos Universos
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl font-lore max-w-3xl mx-auto leading-relaxed">
            Dungeons e Drogas é uma <strong className="text-primary">plataforma multi-RPG</strong>.
            Comece com D&D 5e e expanda para Cyberpunk, Vampire e outros sistemas conforme lançamos.
          </p>
          <p className="text-emerald text-base font-bold mt-6 font-lore">
            Todos os sistemas são 100% gratuitos, para sempre
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {systems.map((system, index) => (
            <motion.div key={index} variants={fadeInUp} className="relative">
              <Card
                className={`h-full transition-all hover-lift relative overflow-hidden group ${
                  system.highlighted
                    ? "bg-grimoire border-ornate-gold shadow-glow-intense"
                    : system.status === "available"
                    ? "bg-grimoire border-primary/50"
                    : "bg-card/30 border-border opacity-90 hover:opacity-100"
                }`}
              >
                {/* Corner ornaments */}
                <div className="absolute top-2 left-2 w-10 h-10 border-t-2 border-l-2 border-primary/40 rounded-tl-lg"></div>
                <div className="absolute top-2 right-2 w-10 h-10 border-t-2 border-r-2 border-primary/40 rounded-tr-lg"></div>
                <div className="absolute bottom-2 left-2 w-10 h-10 border-b-2 border-l-2 border-primary/40 rounded-bl-lg"></div>
                <div className="absolute bottom-2 right-2 w-10 h-10 border-b-2 border-r-2 border-primary/40 rounded-br-lg"></div>

                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${
                    system.highlighted
                      ? "from-primary/15 via-transparent to-primary/10"
                      : "from-primary/5 via-transparent to-transparent"
                  } opacity-0 group-hover:opacity-100 transition-opacity`}
                ></div>

                {/* Badge */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className={`${system.badgeColor} px-4 py-1 rounded-full text-xs font-bold shadow-lg`}>
                    {system.badge}
                  </div>
                </div>

                <CardHeader className="text-center relative z-10 pt-14">
                  <div className={`flex justify-center mb-4 ${
                    system.status === "available"
                      ? "text-primary group-hover:animate-float"
                      : "text-muted-foreground"
                  } transition-all`}>
                    {system.icon}
                  </div>
                  <CardTitle className="text-2xl font-medieval text-primary mb-2">{system.name}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground font-semibold mb-2">
                    {system.release}
                  </CardDescription>
                  <CardDescription className="text-sm font-lore">
                    {system.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10">
                  <ul className="space-y-2 mb-6">
                    {system.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className={`mt-0.5 ${
                          system.status === "available" ? "text-primary" : "text-muted-foreground"
                        }`}>•</span>
                        <span className={
                          system.status === "available"
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="lg"
                    className={`w-full font-bold transition-all ${
                      system.highlighted
                        ? "shadow-glow-intense hover:scale-105 active:scale-95 bg-shimmer-gold text-background"
                        : system.status === "available"
                        ? "hover:scale-105 active:scale-95"
                        : "opacity-80"
                    }`}
                    variant={system.status === "available" ? "default" : "outline"}
                    asChild
                  >
                    <Link href={system.ctaLink}>{system.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Timeline Roadmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16"
        >
          <h3 className="text-2xl font-medieval font-bold text-center mb-8 text-primary">
            Roadmap de Lançamentos
          </h3>

          <div className="relative max-w-4xl mx-auto">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-0 right-0 top-8 h-1 bg-gradient-to-r from-primary via-secondary to-muted"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {/* D&D 5e */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center shadow-glow-intense">
                  <GiSpellBook className="w-8 h-8 text-background" />
                </div>
                <h4 className="font-medieval font-bold text-primary mb-2">Agora</h4>
                <p className="text-sm text-foreground font-lore">D&D 5e - Base cognitiva completa</p>
              </div>

              {/* Cyberpunk */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center shadow-lg">
                  <GiCyberEye className="w-8 h-8 text-accent-foreground" />
                </div>
                <h4 className="font-medieval font-bold text-accent-foreground mb-2">Q3 2025</h4>
                <p className="text-sm text-muted-foreground font-lore">Cyberpunk RED - Netrunning e implantes</p>
              </div>

              {/* Vampire */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/80 flex items-center justify-center shadow-lg">
                  <GiBat className="w-8 h-8 text-destructive-foreground" />
                </div>
                <h4 className="font-medieval font-bold text-destructive-foreground mb-2">Q4 2025</h4>
                <p className="text-sm text-muted-foreground font-lore">Vampire 5e - Intrigas vampíricas</p>
              </div>

              {/* Future */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted border-2 border-primary/30 flex items-center justify-center">
                  <GiScrollUnfurled className="w-8 h-8 text-muted-foreground" />
                </div>
                <h4 className="font-medieval font-bold text-muted-foreground mb-2">2026+</h4>
                <p className="text-sm text-muted-foreground font-lore">Call of Cthulhu, Tormenta, Shadowrun...</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Community Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground text-sm font-lore max-w-2xl mx-auto">
            <strong>Quer outro sistema?</strong> Entre na comunidade e vote nos próximos lançamentos.
            Tormenta 20, Pathfinder 2e, Call of Cthulhu e outros estão na fila de espera!
          </p>
        </motion.div>
      </div>
    </section>
  );
}
