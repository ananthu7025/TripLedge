import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Summary Cards Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card p-4 text-center space-y-2">
                        <Skeleton className="h-8 w-12 mx-auto" />
                        <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                ))}
            </div>

            {/* Search Skeleton */}
            <Skeleton className="h-9 w-full max-w-sm" />

            {/* Table Skeleton */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="border-b p-4">
                    <div className="flex gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32 hidden md:block" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-24 hidden lg:block" />
                        <Skeleton className="h-4 w-16 ml-auto" />
                    </div>
                </div>
                <div className="divide-y">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-4 flex items-center gap-4">
                            <div className="flex items-center gap-2 flex-1">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-4 w-48 hidden md:block" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-4 w-12 hidden lg:block" />
                            <div className="flex gap-2 w-24 justify-end">
                                <Skeleton className="h-8 w-8" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
