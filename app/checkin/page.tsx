"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, MapPin, Clock, CheckCircle, XCircle, Loader2, LogOut } from "lucide-react";
import { api } from "@/app/utils/api-client";
import { ROUTES, API_ENDPOINTS } from "@/app/utils/constants";

type Stage = "idle" | "locating" | "verifying" | "awaiting" | "approved" | "rejected";

export default function CheckInPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stop polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Redirect to dashboard on approval
  useEffect(() => {
    if (stage === "approved") {
      const t = setTimeout(() => router.push(ROUTES.DASHBOARD), 1800);
      return () => clearTimeout(t);
    }
  }, [stage, router]);

  const startPoll = (id: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const data = await api.get(API_ENDPOINTS.CHECKIN.REQUEST_STATUS(id)) as { status: string };
        if (data.status === "approved") {
          clearInterval(pollRef.current!);
          setStage("approved");
        } else if (data.status === "rejected") {
          clearInterval(pollRef.current!);
          setStage("rejected");
        }
      } catch {
        // keep polling silently
      }
    }, 5000);
  };

  const handleCheckIn = async () => {
    setError(null);
    setStage("locating");

    let latitude: number;
    let longitude: number;

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      );
      latitude = pos.coords.latitude;
      longitude = pos.coords.longitude;
      setCoords({ lat: latitude, lng: longitude });
    } catch {
      setError("Location access denied. Please allow location and try again.");
      setStage("idle");
      return;
    }

    setStage("verifying");

    try {
      const result = await api.post(API_ENDPOINTS.CHECKIN.VERIFY_LOCATION, {
        latitude,
        longitude,
      }) as { auto_approved: boolean; id?: string };

      if (result.auto_approved) {
        setStage("approved");
      } else if (result.id) {
        setRequestId(result.id);
        setStage("awaiting");
        startPoll(result.id);
      }
    } catch (err: any) {
      setError(err?.message ?? "Check-in failed. Please try again.");
      setStage("idle");
    }
  };

  const isLoading = stage === "locating" || stage === "verifying";

  const handleLogout = async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT, {});
    } catch { /* ignore */ }
    router.push(ROUTES.LOGIN);
    router.refresh();
  };

  return (
    <div className="admin-theme min-h-screen bg-background flex flex-col items-center justify-center p-6 font-sans antialiased text-foreground relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="mb-8 text-center relative z-10">
        <div className="mx-auto mb-4 h-20 w-20 rounded-2xl bg-primary flex items-center justify-center shadow-glow-primary">
          <Shield className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-black text-foreground tracking-tight">Trip Ledge</h1>
        <p className="text-sm font-medium text-muted-foreground mt-1 uppercase tracking-widest">Daily Check-In</p>
      </header>

      <main className="w-full max-w-md glass shadow-lg rounded-2xl relative z-10 pt-10 pb-8 px-8 flex flex-col items-center gap-6">
        <div className="absolute top-4 right-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-lg hover:bg-destructive/10"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>

        {/* Approved state */}
        {stage === "approved" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Checked In!</h2>
            <p className="text-sm text-muted-foreground text-center">
              Your location has been verified. Redirecting to dashboard…
            </p>
          </div>
        )}

        {/* Rejected state */}
        {stage === "rejected" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Check-In Rejected</h2>
            <p className="text-sm text-muted-foreground text-center">
              Your request was rejected by admin. Please contact your supervisor.
            </p>
            <button
              onClick={() => { setStage("idle"); setError(null); }}
              className="mt-2 text-sm font-semibold text-primary underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {/* Awaiting state */}
        {stage === "awaiting" && (
          <div className="flex flex-col items-center gap-4 py-4 w-full">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Awaiting Approval</h2>
            <p className="text-sm text-muted-foreground text-center">
              You're outside the office radius. Your request has been sent to admin and will update automatically.
            </p>

            {coords && (
              <div className="w-full rounded-xl border border-border bg-muted/30 p-4 flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Your Location</p>
                  <p className="text-sm font-mono font-medium text-foreground">
                    {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Checking for approval every 5 seconds…
            </div>
          </div>
        )}

        {/* Idle / loading state */}
        {(stage === "idle" || isLoading) && (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">Good {getGreeting()}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Tap the button to verify your location and check in for today.
              </p>
            </div>

            {error && (
              <div className="w-full rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive font-medium">
                {error}
              </div>
            )}

            {/* Big check-in button */}
            <button
              onClick={handleCheckIn}
              disabled={isLoading}
              className="relative h-44 w-44 rounded-full bg-primary shadow-glow-primary flex flex-col items-center justify-center gap-2 border-8 border-background transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-14 w-14 text-primary-foreground animate-spin" />
              ) : (
                <>
                  <MapPin className="h-14 w-14 text-primary-foreground" />
                  <span className="text-base font-black text-primary-foreground tracking-widest uppercase">
                    Check In
                  </span>
                </>
              )}
            </button>

            <p className="text-xs text-muted-foreground text-center">
              {stage === "locating" && "Getting your location…"}
              {stage === "verifying" && "Verifying with server…"}
              {stage === "idle" && "Your location will be shared with your employer."}
            </p>
          </>
        )}
      </main>

      <footer className="mt-12 text-center relative z-10 text-muted-foreground/50 text-[10px] font-medium uppercase tracking-[0.2em]">
        © {new Date().getFullYear()} Trip Ledge Inc. • Secure Access Only
      </footer>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}
