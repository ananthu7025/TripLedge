"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/app/utils/api-client";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { InputText } from "@/components/ui/InputText";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApi } from "@/app/utils/hooks/useApi";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES, DEMO_CREDENTIALS, API_ENDPOINTS } from "@/app/utils/constants";
import {
  loginSchema,
  type LoginFormData,
} from "@/app/utils/schemas/auth.schema";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  const redirectPath = searchParams.get("redirect") || ROUTES.DASHBOARD;

  const { execute, isLoading, error, setError } = useApi<{ success: boolean; user: { roleName: string } }>();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: DEMO_CREDENTIALS.EMAIL,
      password: DEMO_CREDENTIALS.PASSWORD,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await execute(() => api.post(API_ENDPOINTS.AUTH.LOGIN, data));
    if (result) {
      const destination = result.user?.roleName === 'admin' ? redirectPath : ROUTES.CHECKIN;
      router.push(destination);
      router.refresh();
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <InputText
        hookForm={form}
        field="email"
        label="Email"
        type="email"
        placeholder="admin@tripledge.com"
        icon={User}
        autoComplete="email"
        disabled={isLoading}
      />
      <InputText
        hookForm={form}
        field="password"
        label="Password"
        type={showPassword ? "text" : "password"}
        placeholder="Enter password"
        icon={Lock}
        autoComplete="current-password"
        disabled={isLoading}
        rightElement={
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        }
      />
      <Button
        type="submit"
        variant="primary"
        className="w-full h-12 rounded-xl text-base font-bold shadow-md"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}
