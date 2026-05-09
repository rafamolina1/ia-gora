import { GeradorReceita } from "@/components/gerador/GeradorReceita";
import { BottomNav } from "@/components/layout/BottomNav";
import { Navbar } from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <PageContainer size="wide">
          <GeradorReceita />
        </PageContainer>
      </main>
      <BottomNav />
    </>
  );
}
