'use client';

import { motion } from "framer-motion";
import { GiScrollQuill, GiDiceTwentyFacesTwenty, GiMagicSwirl } from "react-icons/gi";
import { Card } from "@/components/ui/card";

export default function DemoPreview() {
  const features = [
    {
      icon: <GiScrollQuill className="w-8 h-8" />,
      title: "Chat Narrativo Imersivo",
      description: "Interface de grimório medieval com narração fluida e contexto dinâmico"
    },
    {
      icon: <GiDiceTwentyFacesTwenty className="w-8 h-8" />,
      title: "Fichas D&D Simplificadas",
      description: "Gestão completa de personagens com cálculos automáticos de modificadores"
    },
    {
      icon: <GiMagicSwirl className="w-8 h-8" />,
      title: "IA Contextual Adaptativa",
      description: "Mestre Drogon se adapta ao tom, idioma e estilo da sua campanha"
    }
  ];

  return (
    <section className="py-24 px-4 bg-card/20 border-y border-border">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-medieval font-bold mb-4 text-metallic-gold">
            Veja o Sistema em Ação
          </h2>
          <p className="text-muted-foreground text-lg font-lore max-w-2xl mx-auto">
            Uma experiência visual única que combina tecnologia e fantasia medieval
          </p>
        </motion.div>

        {/* Demo Screenshot Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Card className="bg-grimoire border-primary/30 p-2 shadow-arcane overflow-hidden">
            <div className="relative aspect-video bg-gradient-to-br from-background via-muted/20 to-background rounded-lg border border-border flex items-center justify-center">
              {/* Decorative corners */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-primary/40 rounded-tl-lg"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-primary/40 rounded-tr-lg"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-primary/40 rounded-bl-lg"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-primary/40 rounded-br-lg"></div>

              {/* Mock UI Elements */}
              <div className="absolute inset-8 flex flex-col gap-3 opacity-60">
                {/* Header */}
                <div className="h-12 bg-card/80 backdrop-blur rounded-lg border border-primary/20"></div>

                {/* Main content area */}
                <div className="flex-1 flex gap-3">
                  {/* Sidebar */}
                  <div className="w-1/4 bg-card/80 backdrop-blur rounded-lg border border-primary/20"></div>

                  {/* Chat area */}
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex-1 bg-card/80 backdrop-blur rounded-lg border border-primary/20 p-4 space-y-2">
                      <div className="h-3 bg-primary/20 rounded w-3/4"></div>
                      <div className="h-3 bg-primary/20 rounded w-full"></div>
                      <div className="h-3 bg-primary/20 rounded w-5/6"></div>
                      <div className="h-3 bg-secondary/20 rounded w-2/3 ml-auto"></div>
                      <div className="h-3 bg-primary/20 rounded w-4/5"></div>
                    </div>
                    <div className="h-12 bg-card/80 backdrop-blur rounded-lg border border-primary/20"></div>
                  </div>

                  {/* Context panel */}
                  <div className="w-1/5 bg-card/80 backdrop-blur rounded-lg border border-primary/20"></div>
                </div>
              </div>

              {/* Center badge */}
              <div className="relative z-10 bg-shimmer-gold text-background px-8 py-4 rounded-lg shadow-glow-intense">
                <p className="text-lg font-bold font-medieval">🎮 Screenshot em Breve</p>
                <p className="text-sm opacity-80 font-lore">Sistema em desenvolvimento ativo</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-all p-6 h-full hover-lift">
                <div className="text-primary mb-4">{feature.icon}</div>
                <h3 className="text-lg font-medieval font-bold text-primary mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm font-lore">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
