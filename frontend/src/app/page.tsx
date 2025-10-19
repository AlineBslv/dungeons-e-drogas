'use client';
import { motion } from "framer-motion";
import { GiDragonHead, GiScrollQuill, GiCrystalBall, GiSwordman, GiDiceTwentyFacesTwenty, GiMagicSwirl } from "react-icons/gi";
import { FaUserShield, FaUsers, FaRobot } from "react-icons/fa";
import Link from "next/link";

export default function LandingPage() {
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
      title: "⚙️ Inteligência IA",
      subtitle: "Mestre Drogon",
      description: "Narrador e árbitro de regras com compreensão contextual de RPG"
    },
    {
      icon: <GiDiceTwentyFacesTwenty className="w-12 h-12" />,
      title: "🎲 Jogador Interativo",
      description: "Participação em sessões compartilhadas com ações, rolagens de dado e roleplay"
    },
    {
      icon: <GiScrollQuill className="w-12 h-12" />,
      title: "📜 Ambiente Narrativo",
      description: "UI responsiva dark medieval com estética de grimório"
    },
    {
      icon: <GiMagicSwirl className="w-12 h-12" />,
      title: "🧠 Base Cognitiva",
      description: "IA fundamentada em regras e lore oficial de D&D"
    },
    {
      icon: <FaUsers className="w-12 h-12" />,
      title: "🕹️ Multiplayer Leve",
      description: "Conexão Mestre ↔ Jogadores dentro de campanhas"
    },
    {
      icon: <GiSwordman className="w-12 h-12" />,
      title: "👤 Gestão Completa",
      description: "Usuários, fichas, contextos, histórico e persistência"
    }
  ];

  const personas = [
    {
      icon: <FaUserShield className="w-16 h-16" />,
      title: "🧙 Mestre",
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
      title: "🛡️ Jogador",
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
      title: "🤖 Mestre Drogon",
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
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <motion.div
          className="max-w-5xl w-full text-center space-y-8 relative z-10"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="flex justify-center mb-8">
            <GiDragonHead className="w-32 h-32 text-purple-400 drop-shadow-2xl animate-pulse" />
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600"
          >
            Dungeons e Drogas
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-2xl md:text-3xl text-gray-300 font-light"
          >
            Sistema Narrativo Interativo de RPG com IA
          </motion.p>

          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
          >
            Mestres e Jogadores interagem através do narrador IA <span className="text-purple-400 font-semibold">Mestre Drogon</span>,
            criando histórias dinâmicas, imersivas e cooperativas numa interface moderna inspirada em grimórios medievais sombrios.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
            <Link href="/auth/register">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-lg hover:scale-105 transition-transform shadow-2xl">
                Começar Aventura
              </button>
            </Link>
            <Link href="/auth/login">
              <button className="px-8 py-4 bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg font-semibold text-lg hover:bg-gray-800/70 transition-colors">
                Fazer Login
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Pilares Estratégicos */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Pilares Estratégicos
            </h2>
            <p className="text-gray-400 text-lg">Seis fundamentos que tornam a experiência única</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {pillars.map((pillar, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/60 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
              >
                <div className="text-purple-400 mb-4">{pillar.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{pillar.title}</h3>
                {pillar.subtitle && <p className="text-sm text-purple-300 mb-2">{pillar.subtitle}</p>}
                <p className="text-gray-400 text-sm leading-relaxed">{pillar.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Personas */}
      <section className="py-20 px-4 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Quem Participa da Aventura?
            </h2>
            <p className="text-gray-400 text-lg">Três papéis, uma história épica</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {personas.map((persona, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-purple-500/30 rounded-lg p-8 hover:border-purple-500/60 transition-all hover:scale-105"
              >
                <div className="flex justify-center text-purple-400 mb-6">{persona.icon}</div>
                <h3 className="text-2xl font-bold text-center mb-2">{persona.title}</h3>
                <p className="text-purple-300 text-center text-sm mb-6">{persona.role}</p>
                <ul className="space-y-3 text-sm text-gray-300">
                  {persona.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 px-4 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Como Funciona?
            </h2>
            <p className="text-gray-400 text-lg">3 passos simples para começar sua aventura</p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-purple-500 to-pink-500"></div>

            <div className="space-y-12">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row items-center gap-8"
              >
                <div className="flex-1 text-right">
                  <h3 className="text-2xl font-bold mb-2 text-purple-300">1. Crie sua Campanha</h3>
                  <p className="text-gray-400">
                    Configure o tom narrativo, nível de detalhe e estilo da sua aventura.
                    O Mestre define o cenário e contexto inicial.
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl font-bold z-10 shadow-lg">
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
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl font-bold z-10 shadow-lg">
                  2
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-2xl font-bold mb-2 text-purple-300">2. Convide Jogadores</h3>
                  <p className="text-gray-400">
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
                  <h3 className="text-2xl font-bold mb-2 text-purple-300">3. Deixe a Magia Acontecer</h3>
                  <p className="text-gray-400">
                    Interaja com o Mestre Drogon, role dados, tome decisões épicas.
                    A IA narra, arbitra regras e cria uma história única.
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl font-bold z-10 shadow-lg">
                  3
                </div>
                <div className="flex-1"></div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Perguntas Frequentes
            </h2>
            <p className="text-gray-400 text-lg">Tire suas dúvidas sobre o sistema</p>
          </motion.div>

          <motion.div
            className="space-y-4"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                q: "O que é Dungeons e Drogas?",
                a: "É um sistema narrativo de RPG que usa inteligência artificial (Mestre Drogon) para facilitar e enriquecer sessões de D&D, tornando a experiência mais acessível e imersiva."
              },
              {
                q: "Preciso conhecer D&D para jogar?",
                a: "Não! O sistema foi projetado para iniciantes. O Mestre Drogon explica as regras conforme necessário e simplifica mecânicas complexas."
              },
              {
                q: "É gratuito?",
                a: "Sim! O plano básico é 100% gratuito e permite criar 1 campanha com até 5 jogadores e chat ilimitado com o Drogon."
              },
              {
                q: "Como a IA funciona?",
                a: "Usamos a API Gemini do Google para processar contexto narrativo, interpretar regras de D&D 5e e gerar respostas coerentes e criativas baseadas na sua campanha."
              },
              {
                q: "Posso exportar minhas sessões?",
                a: "Sim! Você pode exportar o histórico completo das suas sessões em formato Markdown ou texto simples."
              },
              {
                q: "Funciona em mobile?",
                a: "Sim! A interface é totalmente responsiva e funciona em smartphones, tablets e desktops."
              }
            ].map((faq, index) => (
              <motion.details
                key={index}
                variants={fadeInUp}
                className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/60 transition-all group"
              >
                <summary className="cursor-pointer font-semibold text-lg flex justify-between items-center">
                  {faq.q}
                  <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-gray-400 leading-relaxed">{faq.a}</p>
              </motion.details>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-black/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-12 text-center"
        >
          <GiDragonHead className="w-20 h-20 text-purple-400 mx-auto mb-6 animate-pulse" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Pronto para Aventurar-se?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Junte-se aos mestres e jogadores que estão criando histórias inesquecíveis com o poder da inteligência artificial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <button className="px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold text-xl hover:scale-105 transition-transform shadow-2xl">
                🎲 Iniciar Jornada Grátis
              </button>
            </Link>
            <Link href="/auth/login">
              <button className="px-10 py-5 bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg font-bold text-xl hover:bg-gray-800/70 transition-colors">
                Já tenho conta
              </button>
            </Link>
          </div>
          <p className="text-sm text-green-400 mt-6 font-semibold">
            ✨ 100% Gratuito • Sem Cartão de Crédito
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-purple-500/20 bg-black/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <GiDragonHead className="w-8 h-8 text-purple-400" />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                  D&D
                </span>
              </div>
              <p className="text-gray-500 text-sm">
                Sistema narrativo de RPG com inteligência artificial para mestres e jogadores.
              </p>
            </div>

            {/* Produto */}
            <div>
              <h4 className="font-semibold text-white mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/auth/register" className="hover:text-purple-400 transition-colors">Começar Grátis</Link></li>
                <li><Link href="/auth/login" className="hover:text-purple-400 transition-colors">Login</Link></li>
                <li><Link href="/dashboard" className="hover:text-purple-400 transition-colors">Dashboard</Link></li>
                <li><Link href="/chat" className="hover:text-purple-400 transition-colors">Chat com Drogon</Link></li>
              </ul>
            </div>

            {/* Recursos */}
            <div>
              <h4 className="font-semibold text-white mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><span className="cursor-not-allowed opacity-50">Documentação (em breve)</span></li>
                <li><span className="cursor-not-allowed opacity-50">Guia de Mestres (em breve)</span></li>
                <li><span className="cursor-not-allowed opacity-50">API (em breve)</span></li>
                <li><span className="cursor-not-allowed opacity-50">Blog (em breve)</span></li>
              </ul>
            </div>

            {/* Comunidade */}
            <div>
              <h4 className="font-semibold text-white mb-4">Comunidade</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><span className="cursor-not-allowed opacity-50">Discord (em breve)</span></li>
                <li><span className="cursor-not-allowed opacity-50">Twitter (em breve)</span></li>
                <li><span className="cursor-not-allowed opacity-50">GitHub (em breve)</span></li>
                <li><span className="cursor-not-allowed opacity-50">Suporte (em breve)</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-purple-500/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © 2025 Dungeons e Drogas • Feito com 💜 e magia • MVP em desenvolvimento
            </p>
            <div className="flex gap-4 text-xs text-gray-600">
              <span className="cursor-not-allowed">Termos de Uso</span>
              <span className="cursor-not-allowed">Privacidade</span>
              <span className="cursor-not-allowed">Cookies</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-600">
              🎲 Powered by Gemini AI • Built with Next.js & Firebase
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
