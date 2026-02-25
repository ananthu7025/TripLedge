/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldErrors, FieldValues, Path } from "react-hook-form";

export const isError = <T extends FieldValues>(
  errors: FieldErrors<T>,
  field: Path<T>,
): boolean => {
  const parts = (field as string).split(".");
  let current: any = errors;

  for (const part of parts) {
    if (!current || typeof current !== "object") return false;
    current = current[part];
  }

  return !!current;
};
