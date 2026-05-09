import { BottomNav } from "@/components/layout/BottomNav";
import { Navbar } from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReceitaLoading() {
  return (
    <>
      <Navbar />
      <main>
        <PageContainer size="wide" className="pt-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
            <div className="space-y-6">
              <Skeleton className="h-[420px] w-full rounded-lg" />

              <div className="rounded-lg border border-border bg-bg-surface p-5">
                <Skeleton className="h-5 w-32 rounded-full" />
                <Skeleton className="mt-4 h-16 w-full rounded-md" />
                <Skeleton className="mt-3 h-16 w-full rounded-md" />
                <Skeleton className="mt-3 h-16 w-[84%] rounded-md" />
              </div>

              <div className="rounded-lg border border-border bg-bg-surface p-5">
                <Skeleton className="h-5 w-36 rounded-full" />
                <Skeleton className="mt-4 h-12 w-full rounded-md" />
                <Skeleton className="mt-3 h-12 w-full rounded-md" />
                <Skeleton className="mt-3 h-12 w-[88%] rounded-md" />
              </div>

              <div className="rounded-lg border border-border bg-bg-surface p-5">
                <Skeleton className="h-5 w-36 rounded-full" />
                <Skeleton className="mt-4 h-28 w-full rounded-lg" />
                <Skeleton className="mt-4 h-28 w-full rounded-lg" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-bg-surface p-5">
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28 rounded-full" />
                    <Skeleton className="h-3 w-20 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-bg-surface p-5">
                <Skeleton className="h-4 w-24 rounded-full" />
                <div className="mt-4 flex flex-wrap gap-3">
                  <Skeleton className="h-10 w-24 rounded-full" />
                  <Skeleton className="h-10 w-24 rounded-full" />
                  <Skeleton className="h-10 w-28 rounded-full" />
                </div>
                <div className="mt-5 space-y-3">
                  <Skeleton className="h-12 w-full rounded-md" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-bg-surface p-5">
                <Skeleton className="h-4 w-16 rounded-full" />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-8 w-16 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </main>
      <BottomNav />
    </>
  );
}
