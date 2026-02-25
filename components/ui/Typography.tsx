import * as React from "react"
import { cn } from "@/app/utils/utils"

const Heading1 = React.memo(({ children, className }: { children: React.ReactNode, className?: string }) => (
    <h1 className={cn("scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl", className)}>
        {children}
    </h1>
))
Heading1.displayName = "Heading1"

const Heading2 = React.memo(({ children, className }: { children: React.ReactNode, className?: string }) => (
    <h2 className={cn("scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0", className)}>
        {children}
    </h2>
))
Heading2.displayName = "Heading2"

const Heading3 = React.memo(({ children, className }: { children: React.ReactNode, className?: string }) => (
    <h3 className={cn("scroll-m-20 text-2xl font-semibold tracking-tight", className)}>
        {children}
    </h3>
))
Heading3.displayName = "Heading3"

const Heading4 = React.memo(({ children, className }: { children: React.ReactNode, className?: string }) => (
    <h4 className={cn("scroll-m-20 text-xl font-semibold tracking-tight", className)}>
        {children}
    </h4>
))
Heading4.displayName = "Heading4"

const Paragraph = React.memo(({ children, className }: { children: React.ReactNode, className?: string }) => (
    <p className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}>
        {children}
    </p>
))
Paragraph.displayName = "Paragraph"

const Small = React.memo(({ children, className }: { children: React.ReactNode, className?: string }) => (
    <small className={cn("text-sm font-medium leading-none", className)}>
        {children}
    </small>
))
Small.displayName = "Small"

const Muted = React.memo(({ children, className }: { children: React.ReactNode, className?: string }) => (
    <p className={cn("text-sm text-muted-foreground", className)}>
        {children}
    </p>
))
Muted.displayName = "Muted"

export { Heading1, Heading2, Heading3, Heading4, Paragraph, Small, Muted }
