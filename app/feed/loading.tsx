import { CardReceitaSkeleton } from "@/components/feed/CardReceitaSkeleton";
import { BottomNav } from "@/components/layout/BottomNav";
import { Navbar } from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";

export default function FeedLoading() {
  return (
    <>
      <Navbar />
      <main>
        <PageContainer size="wide" className="pt-5">
          <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,680px)_300px] 2xl:grid-cols-[300px_minmax(0,720px)_320px]">
            <div className="rounded-lg border border-border bg-bg-surface px-5 py-6 sm:px-6 sm:py-7">
              <div className="skeleton h-4 w-28 rounded-full" />
              <div className="mt-4 skeleton h-20 w-[72%] rounded-lg" />
              <div className="mt-4 skeleton h-5 w-full rounded-full" />
              <div className="mt-2 skeleton h-5 w-[80%] rounded-full" />
              <div className="mt-5 flex gap-2">
                <div className="skeleton h-10 w-24 rounded-full" />
                <div className="skeleton h-10 w-28 rounded-full" />
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-lg border border-border bg-bg-surface px-5 py-5">
                <div className="skeleton h-4 w-24 rounded-full" />
                <div className="mt-3 skeleton h-8 w-[80%] rounded-md" />
                <div className="mt-3 skeleton h-4 w-full rounded-full" />
                <div className="mt-2 skeleton h-4 w-[76%] rounded-full" />
                <div className="mt-5 skeleton h-11 w-40 rounded-full" />
              </div>

              <div className="grid grid-cols-1 gap-5">
                {Array.from({ length: 4 }).map((_, index) => (
                  <CardReceitaSkeleton key={index} />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-bg-surface px-4 py-4">
                <div className="skeleton h-4 w-28 rounded-full" />
                <div className="mt-4 space-y-2">
                  <div className="skeleton h-12 w-full rounded-md" />
                  <div className="skeleton h-12 w-full rounded-md" />
                  <div className="skeleton h-12 w-full rounded-md" />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-bg-surface px-4 py-4">
                <div className="skeleton h-4 w-32 rounded-full" />
                <div className="mt-4 space-y-3">
                  <div className="skeleton h-14 w-full rounded-md" />
                  <div className="skeleton h-14 w-full rounded-md" />
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
