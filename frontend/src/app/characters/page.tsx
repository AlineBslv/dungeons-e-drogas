"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  CharacterSheet,
  getPlayerCharacterSheets,
  createCharacterSheet,
  updateCharacterSheet,
  deleteCharacterSheet,
} from "@/lib/firestore-helpers";
import { CharacterForm } from "@/components/character/CharacterForm";
import { CharacterSheetView } from "@/components/character/CharacterSheet";
import { CharacterCardSkeleton } from "@/components/ui/character-card-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Loader2 } from "lucide-react";
import { GiScrollQuill } from "react-icons/gi";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion-presets";
import GlobalDiceButton from "@/components/dice/GlobalDiceButton";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";

type ViewMode = "list" | "create" | "edit" | "view";

export default function CharactersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [characters, setCharacters] = useState<(CharacterSheet & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedCharacter, setSelectedCharacter] = useState<
    (CharacterSheet & { id: string }) | null
  >(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadCharacters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadCharacters = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const sheets = await getPlayerCharacterSheets(user.uid);
      setCharacters(sheets);
    } catch (error) {
      console.error("Erro ao carregar fichas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCharacter = async (data: Partial<CharacterSheet>) => {
    console.log("📝 handleCreateCharacter chamado!");
    console.log("User:", user?.uid);
    console.log("Data recebida:", data);

    if (!user) {
      console.error("❌ Usuário não está logado!");
      toast.error("Erro: Você precisa estar logado para criar um personagem.");
      return;
    }

    try {
      console.log("Chamando createCharacterSheet...");
      const sheetId = await createCharacterSheet(user.uid, data);
      console.log("✅ Personagem criado com ID:", sheetId);

      console.log("Recarregando lista de personagens...");
      await loadCharacters();

      console.log("Voltando para lista...");
      setViewMode("list");

      toast.success("Personagem criado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao criar personagem:", error);
      throw error;
    }
  };

  const handleUpdateCharacter = async (data: Partial<CharacterSheet>) => {
    if (!selectedCharacter) return;

    try {
      await updateCharacterSheet(selectedCharacter.id, data);
      await loadCharacters();
      setViewMode("list");
      setSelectedCharacter(null);
    } catch (error) {
      console.error("Erro ao atualizar personagem:", error);
      throw error;
    }
  };

  const handleDeleteCharacterClick = (characterId: string) => {
    setCharacterToDelete(characterId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDeleteCharacter = async () => {
    if (!characterToDelete) return;

    try {
      await deleteCharacterSheet(characterToDelete);
      await loadCharacters();
      setViewMode("list");
      setSelectedCharacter(null);
      setShowDeleteDialog(false);
      setCharacterToDelete(null);
      toast.success("Personagem excluído com sucesso");
    } catch (error) {
      console.error("Erro ao deletar personagem:", error);
      toast.error("Erro ao deletar personagem. Tente novamente.");
    }
  };

  const handleViewCharacter = (character: CharacterSheet & { id: string }) => {
    setSelectedCharacter(character);
    setViewMode("view");
  };

  const handleEditCharacter = (character: CharacterSheet & { id: string }) => {
    setSelectedCharacter(character);
    setViewMode("edit");
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-dark-700 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-700 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-medieval text-gold-500 mb-2">
                Meus Personagens
              </h1>
              <p className="text-text-secondary">
                Gerencie suas fichas de personagem D&D 5e
              </p>
            </div>

            {viewMode === "list" && (
              <Button
                variant="drogon"
                onClick={() => setViewMode("create")}
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-5 w-5" />
                Novo Personagem
              </Button>
            )}

            {viewMode !== "list" && (
              <Button variant="outline" onClick={() => setViewMode("list")}>
                ← Voltar à Lista
              </Button>
            )}
          </div>
        </div>

        {/* Conteúdo Principal */}
        {viewMode === "create" && (
          <CharacterForm
            onSave={handleCreateCharacter}
            onCancel={() => setViewMode("list")}
          />
        )}

        {viewMode === "edit" && selectedCharacter && (
          <CharacterForm
            initialData={selectedCharacter}
            onSave={handleUpdateCharacter}
            onCancel={() => setViewMode("list")}
          />
        )}

        {viewMode === "view" && selectedCharacter && (
          <CharacterSheetView
            character={selectedCharacter}
            onEdit={() => handleEditCharacter(selectedCharacter)}
            onDelete={() => handleDeleteCharacterClick(selectedCharacter.id)}
          />
        )}

        {viewMode === "list" && (
          <>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <CharacterCardSkeleton key={i} />
                ))}
              </div>
            ) : characters.length === 0 ? (
              <Card className="border-gold-500/40">
                <CardContent className="py-12 text-center">
                  <GiScrollQuill className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-medieval text-gold-500 mb-2">
                    Nenhum personagem criado
                  </h3>
                  <p className="text-text-secondary mb-6">
                    Crie seu primeiro personagem para começar sua aventura!
                  </p>
                  <Button
                    variant="drogon"
                    onClick={() => setViewMode("create")}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <PlusCircle className="h-5 w-5" />
                    Criar Personagem
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-4"
              >
                {characters.map((character) => (
                  <motion.div
                    key={character.id}
                    variants={staggerItem}
                    onClick={() => handleViewCharacter(character)}
                    className="cursor-pointer"
                  >
                    <CharacterSheetView character={character} compact />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDeleteCharacter}
        title="Excluir Personagem"
        description="Tem certeza que deseja excluir este personagem? Esta ação não pode ser desfeita e todos os dados do personagem serão perdidos permanentemente."
        itemName={characters.find(c => c.id === characterToDelete)?.name}
      />

      {/* Botão Flutuante de Dados Global */}
      <GlobalDiceButton />
    </div>
  );
}
