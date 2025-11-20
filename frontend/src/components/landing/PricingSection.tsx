'use client';

import { motion } from "framer-motion";
import { GiDragonHead, GiCrown, GiTwoCoins } from "react-icons/gi";
import { FaCheck } from "react-icons/fa";
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

export default function PricingSection() {
  const plans = [
    {
      name: "Aventureiro",
      icon: <GiTwoCoins className="w-12 h-12" />,
      price: "Grátis",
      period: "para sempre",
      description: "Perfeito para mestres iniciantes e jogadores casuais",
      features: [
        "1 campanha ativa",
        "Até 5 jogadores por campanha",
        "Chat ilimitado com Mestre Drogon",
        "Fichas de personagem simplificadas",
        "Exportação de sessões (TXT/Markdown)",
        "Suporte comunitário",
        "Tema dark medieval"
      ],
      cta: "Começar Grátis",
      highlighted: false,
      popular: false
    },
    {
      name: "Mestre Épico",
      icon: <GiDragonHead className="w-12 h-12" />,
      price: "R$ 19,90",
      period: "/mês",
      description: "Para mestres dedicados que buscam campanhas épicas",
      features: [
        "Campanhas ilimitadas",
        "Até 10 jogadores por campanha",
        "IA com contexto expandido",
        "Busca semântica D&D (regras oficiais)",
        "Exportação PDF estilizada",
        "Histórico de sessões ilimitado",
        "NPCs automáticos",
        "Geração de encontros",
        "Suporte prioritário",
        "Acesso antecipado a novas features"
      ],
      cta: "Em Breve",
      highlighted: true,
      popular: true
    },
    {
      name: "Guilda",
      icon: <GiCrown className="w-12 h-12" />,
      price: "R$ 49,90",
      period: "/mês",
      description: "Para grupos e comunidades de RPG",
      features: [
        "Tudo do plano Mestre Épico",
        "Até 5 mestres por conta",
        "Campanhas simultâneas ilimitadas",
        "Dashboard de gestão de grupo",
        "API customizada",
        "Webhooks para Discord/Slack",
        "Branding personalizado",
        "Suporte dedicado 24/7"
      ],
      cta: "Em Breve",
      highlighted: false,
      popular: false
    }
  ];

  return (
    <section className="py-20 px-4 bg-muted/20 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-medieval font-bold mb-4 text-metallic-gold">
            Escolha Seu Plano de Aventura
          </h2>
          <p className="text-muted-foreground text-lg font-lore max-w-2xl mx-auto">
            Comece gratuitamente e evolua conforme sua jornada épica se expande
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {plans.map((plan, index) => (
            <motion.div key={index} variants={fadeInUp} className="relative">
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-shimmer-gold text-background px-4 py-1 rounded-full text-sm font-bold shadow-glow-intense">
                    MAIS POPULAR
                  </div>
                </div>
              )}
              <Card
                className={`h-full bg-grimoire transition-all hover-lift relative overflow-hidden group ${
                  plan.highlighted
                    ? "border-ornate-gold shadow-glow-intense scale-105 md:scale-110"
                    : "border-primary/30 hover:border-primary/50"
                }`}
              >
                {/* Corner ornaments */}
                <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-primary/40 rounded-tl-lg"></div>
                <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-primary/40 rounded-tr-lg"></div>
                <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-primary/40 rounded-bl-lg"></div>
                <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-primary/40 rounded-br-lg"></div>

                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${
                    plan.highlighted
                      ? "from-primary/15 via-transparent to-primary/10"
                      : "from-primary/5 via-transparent to-transparent"
                  } opacity-0 group-hover:opacity-100 transition-opacity`}
                ></div>

                <CardHeader className="text-center relative z-10 pb-4">
                  <div className="flex justify-center text-primary mb-4 group-hover:animate-float transition-all">
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl font-medieval text-primary mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm mb-4 font-lore">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span
                        className={`text-4xl font-bold ${
                          plan.highlighted ? "text-metallic-gold" : "text-foreground"
                        }`}
                      >
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <FaCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="lg"
                    className={`w-full font-bold transition-all ${
                      plan.highlighted
                        ? "shadow-glow-intense hover:scale-105 active:scale-95 bg-shimmer-gold text-background"
                        : "hover:scale-105 active:scale-95"
                    }`}
                    variant={plan.highlighted ? "default" : "outline"}
                    disabled={plan.cta === "Em Breve"}
                    asChild={plan.cta !== "Em Breve"}
                  >
                    {plan.cta === "Em Breve" ? (
                      <span>{plan.cta}</span>
                    ) : (
                      <Link href="/auth/register">{plan.cta}</Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Garantia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground text-sm font-lore">
            <strong>Sem cartão de crédito necessário</strong> para o plano gratuito •{" "}
            <strong>Cancele quando quiser</strong> nos planos pagos
          </p>
          <p className="text-muted-foreground text-xs mt-2 font-lore">
            Os planos pagos estarão disponíveis em breve. Cadastre-se gratuitamente e seja notificado!
          </p>
        </motion.div>
      </div>
    </section>
  );
}
