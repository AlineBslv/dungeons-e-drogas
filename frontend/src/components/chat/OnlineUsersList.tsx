/**
 * OnlineUsersList Component - Dungeons e Drogas
 * Exibe lista de usuários online na campanha com estilo aprimorado
 */

import { motion, AnimatePresence } from 'framer-motion';
import { FaCircle, FaCrown } from 'react-icons/fa';
import { GiCheckedShield } from 'react-icons/gi';
import { OnlineUser } from '@/hooks/useSocket';
import { Card } from '@/components/ui/card';

interface OnlineUsersListProps {
  users: OnlineUser[];
}

export default function OnlineUsersList({ users }: OnlineUsersListProps) {
  if (users.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 border-gold-500/30 bg-card/60 backdrop-blur-sm">
      <h3 className="text-sm font-bold text-metallic-gold mb-3 font-medieval flex items-center gap-2">
        <FaCircle className="w-2 h-2 text-green-500 animate-pulse" />
        Participantes Online ({users.length})
      </h3>
      <div className="space-y-2">
        <AnimatePresence>
          {users.map((user, index) => (
            <motion.div
              key={user.userId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 px-3 py-2 rounded-md bg-background/40 border border-border/50 hover:border-primary/50 transition-colors"
            >
              {/* Ícone de role */}
              {user.role === 'mestre' ? (
                <div className="flex-shrink-0" title="Mestre da Campanha">
                  <FaCrown className="w-4 h-4 text-metallic-gold drop-shadow-glow" />
                </div>
              ) : (
                <div className="flex-shrink-0" title="Jogador">
                  <GiCheckedShield className="w-4 h-4 text-foreground/60" />
                </div>
              )}

              {/* Nome do usuário */}
              <span className="flex-1 font-lore text-sm text-foreground truncate">
                {user.userName}
              </span>

              {/* Indicador de online */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
                className="flex-shrink-0"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Estatística adicional */}
      <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground font-lore">
        <span>
          {users.filter(u => u.role === 'mestre').length} Mestre
          {users.filter(u => u.role === 'mestre').length !== 1 ? 's' : ''}
        </span>
        <span>
          {users.filter(u => u.role === 'jogador').length} Jogador
          {users.filter(u => u.role === 'jogador').length !== 1 ? 'es' : ''}
        </span>
      </div>
    </Card>
  );
}
