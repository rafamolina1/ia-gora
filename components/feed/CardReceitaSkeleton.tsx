import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CardReceitaSkeleton() {
  return (
    <Card className="overflow-hidden rounded-lg p-0">
      <div className="flex items-center justify-between gap-3 px-4 pb-4 pt-4 sm:px-5 sm:pt-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>
      <Skeleton className="aspect-[4/5] w-full rounded-none sm:aspect-[4/3]" />
      <div className="space-y-3.5 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <Skeleton className="h-10 w-16 rounded-full" />
            <Skeleton className="h-10 w-16 rounded-full" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/5" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-14 rounded-full" />
        </div>
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    </Card>
  );
}
