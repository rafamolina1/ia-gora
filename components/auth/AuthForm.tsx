"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldErrors } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/hooks/useToast";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import {
  cadastroSchema,
  loginSchema,
  type CadastroFormData,
  type LoginFormData,
} from "@/lib/validations/auth.schema";

interface AuthFormProps {
  mode: "login" | "cadastro";
  redirectTo?: string;
}

type FormValues = LoginFormData | CadastroFormData;

export function AuthForm({ mode, redirectTo = "/perfil" }: AuthFormProps) {
  const router = useRouter();
  const { error, success } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(mode === "login" ? loginSchema : cadastroSchema),
    defaultValues:
      mode === "login" ? { email: "", password: "" } : { email: "", password: "", username: "" },
  });

  async function onSubmit(values: FormValues) {
    if (!hasSupabaseEnv()) {
      error("Configure as variáveis do Supabase para entrar ou criar conta.");
      return;
    }

    if (mode === "login") {
      const payload = values as LoginFormData;
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        error(data?.error ?? "Falha ao entrar.");
        return;
      }

      success("Login realizado.");
      window.location.assign(redirectTo);
      return;
    }

    const payload = values as CadastroFormData;
    const response = await fetch("/api/auth/cadastro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as {
      error?: string;
      requiresEmailConfirmation?: boolean;
    };

    if (!response.ok) {
      error(data.error ?? "Falha ao criar conta.");
      return;
    }

    if (data.requiresEmailConfirmation) {
      success("Conta criada. Confirme o e-mail antes de entrar.");
      router.push("/login");
      router.refresh();
      return;
    }

    success("Conta criada.");
    window.location.assign(redirectTo);
  }

  const isCadastro = mode === "cadastro";
  const cadastroErrors = form.formState.errors as FieldErrors<CadastroFormData>;

  return (
    <div className="surface-panel w-full p-6 sm:p-8">
      <div className="mb-8">
        <div className="section-label">{isCadastro ? "Cadastro" : "Login"}</div>
        <h2 className="mt-2 text-text-primary">{isCadastro ? "Criar conta" : "Entrar"}</h2>
        <p className="mt-2 text-base text-text-secondary">
          {isCadastro
            ? "Crie sua conta para salvar receitas geradas por IA."
            : "Entre para acessar seu perfil, rascunhos e receitas salvas."}
        </p>
      </div>

      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        {isCadastro ? (
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-text-primary">
              Username
            </label>
            <Input id="username" placeholder="seu_username" {...form.register("username" as const)} />
            <p className="text-sm text-danger">{cadastroErrors.username?.message as string | undefined}</p>
          </div>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-text-primary">
            E-mail
          </label>
          <Input id="email" type="email" placeholder="voce@exemplo.com" {...form.register("email")} />
          <p className="text-sm text-danger">{form.formState.errors.email?.message as string | undefined}</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-text-primary">
            Senha
          </label>
          <Input id="password" type="password" placeholder="Sua senha" {...form.register("password")} />
          <p className="text-sm text-danger">{form.formState.errors.password?.message as string | undefined}</p>
        </div>

        <Button type="submit" className="mt-2 w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Processando..." : isCadastro ? "Criar conta" : "Entrar"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-text-secondary">
        {isCadastro ? "Já tem conta?" : "Ainda não tem conta?"}{" "}
        <Link href={isCadastro ? "/login" : "/cadastro"} className="font-medium text-accent">
          {isCadastro ? "Entrar" : "Criar conta"}
        </Link>
      </p>
    </div>
  );
}
