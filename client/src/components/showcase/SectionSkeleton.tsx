import { Skeleton } from "@/components/ui/skeleton";

interface SectionSkeletonProps {
  rows?: number;
  height?: string;
}

export function SectionSkeleton({ rows = 4, height = "h-8" }: SectionSkeletonProps) {
  return (
    <div className="space-y-3 p-6" role="status" aria-label="Loading section…">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={`${height} w-full rounded-md`} />
      ))}
    </div>
  );
}
