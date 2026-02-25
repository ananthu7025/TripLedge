/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Info, LucideIcon } from "lucide-react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { isError } from "@/app/utils/helpers";
import { cn } from "@/app/utils/utils";

type TextTransformMode = "capitalize" | "uppercase" | "lowercase" | "none";

interface InputTextProps<T extends FieldValues = any> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
    hookForm?: UseFormReturn<T>;
    field?: Path<T>;
    label?: string;
    labelMandatory?: boolean;
    infoText?: string;
    showInfoIcon?: boolean;
    textTransformMode?: TextTransformMode;
    onConditionCheck?: (newValue: string, oldValue: string) => boolean;
    icon?: LucideIcon;
    variant?: "default" | "pill";
    rightElement?: React.ReactNode;
}

const InputText = <T extends FieldValues>({
    hookForm,
    field,
    label,
    labelMandatory,
    infoText,
    showInfoIcon,
    textTransformMode = "none",
    onConditionCheck,
    className,
    icon: Icon,
    variant = "default",
    rightElement,
    ...props
}: InputTextProps<T>) => {
    const textTransformHandler = React.useCallback((value: string) => {
        switch (textTransformMode) {
            case "capitalize":
                return value.length > 0
                    ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
                    : value;
            case "uppercase":
                return value.toUpperCase();
            case "lowercase":
                return value.toLowerCase();
            default:
                return value;
        }
    }, [textTransformMode]);

    const renderInput = (hasError?: boolean, registerProps?: any) => (
        <div className="relative w-full">
            {Icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                    <Icon className="h-5 w-5 text-slate-400" />
                </div>
            )}
            <input
                {...props}
                {...registerProps}
                style={{
                    paddingLeft: Icon ? (variant === 'pill' ? '2.75rem' : '2.5rem') : undefined,
                    paddingRight: rightElement ? '2.5rem' : undefined
                }}
                className={cn(
                    "flex w-full border transition-all placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                    variant === "default" && "h-12 rounded-xl border-slate-200 bg-slate-100/50 px-4 text-sm shadow-sm hover:bg-slate-100/80 hover:border-slate-300",
                    variant === "pill" && "h-12 rounded-full border-transparent bg-slate-100 px-6 text-sm",
                    hasError && "border-danger focus-visible:ring-danger/20",
                    className
                )}
            />
            {rightElement && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    {rightElement}
                </div>
            )}
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

    // If using with react-hook-form
    if (hookForm && field) {
        const {
            register,
            formState: { errors },
            setValue,
            getValues,
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

                {renderInput(hasError, register(field, {
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                        const oldValue = getValues(field) as string;
                        const newValue = textTransformHandler(e.target.value);

                        if (onConditionCheck && !onConditionCheck(newValue, oldValue)) {
                            e.preventDefault();
                            return;
                        }

                        setValue(field, newValue as any, { shouldValidate: true });
                    },
                }))}

                {hasError && (
                    <p className="text-[11px] font-medium text-danger">
                        {errorMessage}
                    </p>
                )}
            </div>
        );
    }

    // Standalone usage
    return (
        <div className="space-y-1.5 w-full text-left">
            {label && (
                <label className="text-sm font-medium leading-none flex items-center gap-1">
                    {labelContent}
                </label>
            )}
            {renderInput(false, {
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    const newVal = textTransformHandler(e.target.value);
                    e.target.value = newVal;
                    props.onChange?.(e);
                }
            })}
        </div>
    );
};

InputText.displayName = "InputText";

export { InputText };
