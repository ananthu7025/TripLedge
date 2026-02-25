import { Suspense } from "react";
import { Shield } from "lucide-react";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="admin-theme min-h-screen bg-background flex flex-col items-center justify-center p-6 font-sans antialiased text-foreground relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="mb-8 text-center relative z-10 animate-slide-in">
        <div className="mx-auto mb-4 h-20 w-20 rounded-2xl bg-primary flex items-center justify-center shadow-glow-primary transition-transform hover:scale-105 duration-300">
          <Shield className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-black text-foreground tracking-tight">Trip Ledge</h1>
        <p className="text-sm font-medium text-muted-foreground mt-1 uppercase tracking-widest">Admin Console</p>
      </header>

      <main className="w-full max-w-md glass shadow-lg rounded-2xl relative z-10 animate-slide-in" style={{ animationDelay: '100ms' }}>
        <div className="flex flex-col space-y-2 p-8 pb-4 text-center">
          <h2 className="text-2xl font-bold leading-none tracking-tight text-foreground">
            Admin Sign In
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter your admin credentials to continue
          </p>
        </div>
        <div className="p-8 pt-2">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </main>

      <footer className="mt-12 text-center relative z-10 text-muted-foreground/50 text-[10px] font-medium uppercase tracking-[0.2em]">
        © {new Date().getFullYear()} Trip Ledge Inc. • Secure Access Only
      </footer>
    </div>
  );
}

export const metadata = {
  title: "Admin Login - Trip Ledge",
  description: "Sign in to the Trip Ledge admin console",
};
