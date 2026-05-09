import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-5">
      <div className="grid w-full max-w-wide gap-8 lg:grid-cols-[minmax(0,0.95fr)_480px] lg:items-center">
        <section className="hidden lg:block">
          <div className="surface-panel p-8">
            <Image
              src="/brand-logo.svg"
              alt="IAgora"
              width={980}
              height={280}
              priority
              className="h-auto w-[216px]"
            />
            <h1 className="mt-10 max-w-[12ch] text-5xl font-semibold leading-tight text-text-primary">
              Sua cozinha, organizada como produto.
            </h1>
            <p className="mt-5 max-w-[46ch] text-base leading-7 text-text-secondary">
              Entre para publicar receitas, salvar ideias e acompanhar a comunidade em uma experiência
              mais limpa e focada.
            </p>
          </div>
        </section>

        <section>
          <div className="mb-8 text-center lg:hidden">
            <div className="mb-4 flex justify-center">
              <Image
                src="/brand-logo.svg"
                alt="IAgora"
                width={980}
                height={280}
                priority
                className="h-auto w-[206px]"
              />
            </div>
            <h1 className="text-[2rem] font-semibold text-text-primary">Receitas com cara de produto</h1>
            <p className="mt-3 text-base text-text-secondary">
              Entre ou crie sua conta para publicar, salvar e organizar suas receitas.
            </p>
          </div>

          {children}
        </section>
      </div>
    </main>
  );
}
