"use client";

import { useCallback, useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/hooks/useToast";

interface BotaoExcluirContaProps {
  username: string;
}

export function BotaoExcluirConta({ username }: BotaoExcluirContaProps) {
  const { error } = useToast();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [typedUsername, setTypedUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const usernameMatches = typedUsername.trim() === username;

  const closeDialogs = useCallback(() => {
    if (loading) {
      return;
    }

    setStep(0);
    setTypedUsername("");
  }, [loading]);

  async function handleDeleteAccount() {
    if (!usernameMatches || loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/conta", {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Não foi possível excluir sua conta.");
      }

      window.location.assign("/");
    } catch (caughtError) {
      error(caughtError instanceof Error ? caughtError.message : "Não foi possível excluir sua conta.");
      setLoading(false);
      setStep(0);
      setTypedUsername("");
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className="border-danger/30 text-danger hover:bg-danger/10 hover:text-danger"
        onClick={() => setStep(1)}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Excluir conta
      </Button>

      <ConfirmDialog
        open={step === 1}
        title="Excluir sua conta?"
        description="Suas receitas, curtidas, salvamentos, comentários, seguidores e perfil serão removidos. Essa ação não pode ser desfeita."
        confirmLabel="Continuar"
        cancelLabel="Manter conta"
        onCancel={closeDialogs}
        onConfirm={() => setStep(2)}
      />

      <ConfirmDialog
        open={step === 2}
        title="Confirmação final"
        description={`Digite ${username} para confirmar a exclusão permanente da sua conta.`}
        confirmLabel={loading ? "Excluindo..." : "Excluir conta definitivamente"}
        cancelLabel="Cancelar"
        loading={loading}
        confirmDisabled={!usernameMatches}
        onCancel={closeDialogs}
        onConfirm={() => {
          void handleDeleteAccount();
        }}
      >
        <div className="space-y-2">
          <label htmlFor="confirm-delete-account" className="text-sm font-medium text-text-primary">
            Username
          </label>
          <Input
            id="confirm-delete-account"
            value={typedUsername}
            disabled={loading}
            autoComplete="off"
            placeholder={username}
            onChange={(event) => setTypedUsername(event.target.value)}
          />
          <p className="text-xs text-text-secondary">O botão final só libera quando o username estiver igual.</p>
        </div>
      </ConfirmDialog>
    </>
  );
}
