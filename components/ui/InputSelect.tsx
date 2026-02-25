/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Info, LucideIcon } from "lucide-react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { isError } from "@/app/utils/helpers";
import { cn } from "@/app/utils/utils";

interface InputSelectProps<T extends FieldValues = any> extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'name'> {
    hookForm?: UseFormReturn<T>;
    field?: Path<T>;
    label?: string;
    labelMandatory?: boolean;
    infoText?: string;
    showInfoIcon?: boolean;
    options: { value: string; label: string }[];
    icon?: LucideIcon;
}

const InputSelect = <T extends FieldValues>({
    hookForm,
    field,
    label,
    labelMandatory,
    infoText,
    showInfoIcon,
    options,
    className,
    icon: Icon,
    ...props
}: InputSelectProps<T>) => {
    const renderSelect = (hasError?: boolean, registerProps?: any) => (
        <div className="relative w-full">
            {Icon && (
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            )}
            <select
                {...props}
                {...registerProps}
                className={cn(
                    "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
                    Icon && "pl-9",
                    hasError && "border-danger focus-visible:ring-danger",
                    className
                )}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    );

    const labelContent = (
        <>
            {label}
            {labelMandatory && <span className="text-danger">*</span>}
            {showInfoIcon && infoText && (
                <div className="group relative">
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-popover text-popover-foreground text-xs rounded border shadow-lg z-50">
                        {infoText}
                    </div>
                </div>
            )}
        </>
    );

    if (hookForm && field) {
        const {
            register,
            formState: { errors },
        } = hookForm;

        const hasError = isError(errors, field);
        const errorMessage = (errors as any)[field]?.message;

        return (
            <div className="space-y-1.5 w-full text-left">
                {label && (
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1">
                            {labelContent}
                        </label>
                    </div>
                )}

                {renderSelect(hasError, register(field))}

                {hasError && (
                    <p className="text-[11px] font-medium text-danger">
                        {errorMessage}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-1.5 w-full text-left">
            {label && (
                <label className="text-sm font-medium leading-none flex items-center gap-1">
                    {labelContent}
                </label>
            )}
            {renderSelect(false)}
        </div>
    );
};

InputSelect.displayName = "InputSelect";

export { InputSelect };
