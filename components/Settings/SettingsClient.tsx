"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/app/utils/api-client";
import { useToast } from "@/lib/utils/useToast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@/app/utils/hooks/useApi";
import { User, Building, MapPin, Save, Shield, Calculator } from "lucide-react";
import { API_ENDPOINTS, SUCCESS_MESSAGES } from "@/app/utils/constants";
import {
    profileUpdateSchema,
    passwordChangeSchema,
    type ProfileUpdateFormData,
    type PasswordChangeFormData
} from "@/app/utils/schemas/auth.schema";
import {
    settingsSchema,
    type SettingsFormData
} from "@/app/utils/schemas/settings.schema";

interface SettingsClientProps {
    initialSettings: SettingsFormData;
    initialProfile: ProfileUpdateFormData;
}

export function SettingsClient({ initialSettings, initialProfile }: SettingsClientProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("profile");

    const companyMutation = useMutation();
    const profileMutation = useMutation();
    const passwordMutation = useMutation();

    const companyForm = useForm<SettingsFormData>({
        resolver: zodResolver(settingsSchema),
        defaultValues: initialSettings,
    });

    const profileForm = useForm<ProfileUpdateFormData>({
        resolver: zodResolver(profileUpdateSchema),
        defaultValues: initialProfile,
    });

    const passwordForm = useForm<PasswordChangeFormData>({
        resolver: zodResolver(passwordChangeSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSaveCompany = async (data: SettingsFormData) => {
        const success = await companyMutation.mutate(() =>
            api.patch(API_ENDPOINTS.SETTINGS, data)
        );
        if (success) {
            toast({ message: SUCCESS_MESSAGES.UPDATED, variant: "success" });
        }
    };

    const onSaveProfile = async (data: ProfileUpdateFormData) => {
        const success = await profileMutation.mutate(() =>
            api.patch(API_ENDPOINTS.AUTH.PROFILE, data)
        );
        if (success) {
            toast({ message: "Profile updated successfully", variant: "success" });
            setTimeout(() => window.location.reload(), 1000);
        }
    };

    const onUpdatePassword = async (data: PasswordChangeFormData) => {
        const success = await passwordMutation.mutate(() =>
            api.patch(API_ENDPOINTS.AUTH.PROFILE, {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            })
        );
        if (success) {
            toast({ message: "Password updated successfully", variant: "success" });
            passwordForm.reset();
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your profile, company, and system configuration</p>
            </div>

            {/* Tabs */}
            <div className="space-y-4">
                <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all gap-1 ${activeTab === "profile" ? "bg-background text-foreground shadow-sm" : "hover:text-foreground"
                            }`}
                    >
                        <User className="h-3.5 w-3.5" /> Profile
                    </button>
                    <button
                        onClick={() => setActiveTab("company")}
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all gap-1 ${activeTab === "company" ? "bg-background text-foreground shadow-sm" : "hover:text-foreground"
                            }`}
                    >
                        <Building className="h-3.5 w-3.5" /> Company
                    </button>
                    <button
                        onClick={() => setActiveTab("scoring")}
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all gap-1 ${activeTab === "scoring" ? "bg-background text-foreground shadow-sm" : "hover:text-foreground"
                            }`}
                    >
                        <Calculator className="h-3.5 w-3.5" /> Scoring
                    </button>
                </div>

                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                            <div className="p-6 space-y-4">
                                <h3 className="text-base font-semibold leading-none tracking-tight">Admin Profile</h3>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                                        <span className="text-xl font-bold text-primary-foreground">
                                            {(profileForm.watch("fullName") || "A").charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">{profileForm.watch("fullName") || "Admin User"}</p>
                                        <p className="text-sm text-muted-foreground">{profileForm.watch("email")}</p>
                                    </div>
                                </div>
                                <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium leading-none text-foreground">Full Name</label>
                                            <input
                                                {...profileForm.register("fullName")}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring mt-1"
                                                disabled={profileMutation.isLoading}
                                            />
                                            {profileForm.formState.errors.fullName && (
                                                <p className="text-xs text-destructive mt-1">{profileForm.formState.errors.fullName.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium leading-none text-foreground">Email</label>
                                            <input
                                                type="email"
                                                {...profileForm.register("email")}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring mt-1"
                                                disabled={profileMutation.isLoading}
                                            />
                                            {profileForm.formState.errors.email && (
                                                <p className="text-xs text-destructive mt-1">{profileForm.formState.errors.email.message}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={profileMutation.isLoading}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
                                    >
                                        <Save className="h-4 w-4" /> {profileMutation.isLoading ? "Saving..." : "Save Profile"}
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                            <div className="p-6 space-y-4">
                                <h3 className="text-base font-semibold leading-none tracking-tight">Change Password</h3>
                                <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium leading-none text-foreground">Current Password</label>
                                        <input
                                            type="password"
                                            {...passwordForm.register("currentPassword")}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring mt-1"
                                            disabled={passwordMutation.isLoading}
                                        />
                                        {passwordForm.formState.errors.currentPassword && (
                                            <p className="text-xs text-destructive mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium leading-none text-foreground">New Password</label>
                                            <input
                                                type="password"
                                                {...passwordForm.register("newPassword")}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring mt-1"
                                                disabled={passwordMutation.isLoading}
                                            />
                                            {passwordForm.formState.errors.newPassword && (
                                                <p className="text-xs text-destructive mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium leading-none text-foreground">Confirm Password</label>
                                            <input
                                                type="password"
                                                {...passwordForm.register("confirmPassword")}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring mt-1"
                                                disabled={passwordMutation.isLoading}
                                            />
                                            {passwordForm.formState.errors.confirmPassword && (
                                                <p className="text-xs text-destructive mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={passwordMutation.isLoading}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-10 px-4 py-2 gap-2"
                                    >
                                        <Shield className="h-4 w-4" /> {passwordMutation.isLoading ? "Updating..." : "Update Password"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Scoring Tab */}
                {activeTab === "scoring" && (
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-base font-semibold leading-none tracking-tight">Trip Scoring Configuration</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Configure the difficulty weight used in the trip score formula.</p>
                                </div>
                                <div className="bg-muted/40 rounded-lg p-4 font-mono text-sm space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Formula</p>
                                    <p>Difficulty = High Point − Low Point</p>
                                    <p>Trip Score = Length × (1 + Difficulty × <strong>Weight</strong>)</p>
                                </div>
                                <form onSubmit={companyForm.handleSubmit(onSaveCompany)} className="space-y-4">
                                    <div className="max-w-xs">
                                        <label className="text-sm font-medium leading-none text-foreground">Difficulty Weight</label>
                                        <input
                                            type="number"
                                            step="0.05"
                                            min="0.01"
                                            max="5"
                                            {...companyForm.register("difficultyWeight")}
                                            placeholder="e.g. 0.2"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring mt-1"
                                            disabled={companyMutation.isLoading}
                                        />
                                        {companyForm.formState.errors.difficultyWeight && (
                                            <p className="text-xs text-destructive mt-1">{companyForm.formState.errors.difficultyWeight.message}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">Recommended range: 0.1 – 0.5. Higher values reward difficulty more.</p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={companyMutation.isLoading}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
                                    >
                                        <Save className="h-4 w-4" /> {companyMutation.isLoading ? "Saving..." : "Save Scoring Settings"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Company Tab */}
                {activeTab === "company" && (
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold leading-none tracking-tight">Company Settings</h3>
                                </div>
                                <form onSubmit={companyForm.handleSubmit(onSaveCompany)} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium leading-none text-foreground">Company Name</label>
                                            <input
                                                {...companyForm.register("companyName")}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring mt-1"
                                                disabled={companyMutation.isLoading}
                                            />
                                            {companyForm.formState.errors.companyName && (
                                                <p className="text-xs text-destructive mt-1">{companyForm.formState.errors.companyName.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium leading-none text-foreground">City / Region</label>
                                            <input
                                                {...companyForm.register("city")}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring mt-1"
                                                disabled={companyMutation.isLoading}
                                            />
                                            {companyForm.formState.errors.city && (
                                                <p className="text-xs text-destructive mt-1">{companyForm.formState.errors.city.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                                <MapPin className="h-4 w-4" /> Office Location Setting
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if ("geolocation" in navigator) {
                                                        navigator.geolocation.getCurrentPosition((position) => {
                                                            const lat = position.coords.latitude.toFixed(7);
                                                            const lng = position.coords.longitude.toFixed(7);
                                                            companyForm.setValue("officeLatitude", lat, { shouldValidate: true });
                                                            companyForm.setValue("officeLongitude", lng, { shouldValidate: true });
                                                        }, (error) => {
                                                            alert("Error fetching location: " + error.message);
                                                        });
                                                    } else {
                                                        alert("Geolocation is not supported by your browser.");
                                                    }
                                                }}
                                                className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background hover:bg-accent h-8 px-2.5 gap-1.5"
                                            >
                                                <MapPin className="h-3 w-3" /> Fetch Current Location
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium leading-none text-foreground">Office Address</label>
                                                <input
                                                    {...companyForm.register("officeAddress")}
                                                    placeholder="123 Main St, City, State"
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring mt-1"
                                                    disabled={companyMutation.isLoading}
                                                />
                                                {companyForm.formState.errors.officeAddress && (
                                                    <p className="text-xs text-destructive mt-1">{companyForm.formState.errors.officeAddress.message}</p>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium leading-none text-foreground">Latitude</label>
                                                    <input
                                                        {...companyForm.register("officeLatitude")}
                                                        placeholder="e.g. 52.7758"
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring mt-1"
                                                        disabled={companyMutation.isLoading}
                                                    />
                                                    {companyForm.formState.errors.officeLatitude && (
                                                        <p className="text-xs text-destructive mt-1">{companyForm.formState.errors.officeLatitude.message}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium leading-none text-foreground">Longitude</label>
                                                    <input
                                                        {...companyForm.register("officeLongitude")}
                                                        placeholder="e.g. -108.2972"
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring mt-1"
                                                        disabled={companyMutation.isLoading}
                                                    />
                                                    {companyForm.formState.errors.officeLongitude && (
                                                        <p className="text-xs text-destructive mt-1">{companyForm.formState.errors.officeLongitude.message}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground">This location is used to verify technician check-ins.</p>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={companyMutation.isLoading}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2 mt-4"
                                    >
                                        <Save className="h-4 w-4" /> {companyMutation.isLoading ? "Saving..." : "Save Company Settings"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
