"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/lib/hooks/useToast";

interface BotaoExcluirReceitaProps {
  receitaId: string;
}

export function BotaoExcluirReceita({ receitaId }: BotaoExcluirReceitaProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDelete() {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/receitas/${receitaId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Não foi possível excluir a receita.");
      }

      success("Receita excluída.");
      setConfirmOpen(false);
      router.push("/perfil");
      router.refresh();
    } catch (caughtError) {
      setConfirmOpen(false);
      error(caughtError instanceof Error ? caughtError.message : "Não foi possível excluir a receita.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="small"
        disabled={loading}
        className="border-danger/30 text-danger hover:bg-danger/10 hover:text-danger"
        onClick={() => setConfirmOpen(true)}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        {loading ? "Excluindo..." : "Excluir"}
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir receita?"
        description="Esta receita será removida do seu perfil e do feed. Essa ação não pode ser desfeita."
        confirmLabel={loading ? "Excluindo..." : "Excluir receita"}
        cancelLabel="Manter receita"
        loading={loading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          void handleDelete();
        }}
      />
    </>
  );
}
