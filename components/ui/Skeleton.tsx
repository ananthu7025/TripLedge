import { cn } from "@/app/utils/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn("animate-shimmer rounded-md bg-muted", className)}
            {...props}
        />
    );
}
