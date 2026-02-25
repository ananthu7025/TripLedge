"use client";

import { useRouter } from "next/navigation";
import { api } from "@/app/utils/api-client";
import { useToast } from "@/lib/utils/useToast";
import { useMutation } from "@/app/utils/hooks/useApi";
import { useState, useTransition, useMemo } from "react";
import { Plus, Search, Eye, Send, X, Loader2 } from "lucide-react";

interface User {
    id: string;
    fullName: string;
    email: string;
    status: string;
    role: { id: string; name: string; description: string };
}

interface Role {
    id: string;
    name: string;
    description: string;
}

interface UsersClientProps {
    initialUsers: User[];
    initialRoles: Role[];
}

export function UsersClient({ initialUsers, initialRoles }: UsersClientProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const addMutation = useMutation();

    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        roleId: initialRoles[0]?.id ?? "",
        password: "",
    });

    const refresh = () => startTransition(() => router.refresh());

    const filteredUsers = useMemo(() => {
        if (!searchQuery) return initialUsers;
        const q = searchQuery.toLowerCase();
        return initialUsers.filter(
            (u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
        );
    }, [initialUsers, searchQuery]);

    const stats = useMemo(() => ({
        total: initialUsers.length,
        active: initialUsers.filter((u) => u.status === "active").length,
        invited: initialUsers.filter((u) => u.status === "invited").length,
        disabled: initialUsers.filter((u) => u.status === "disabled").length,
    }), [initialUsers]);

    const handleAddUser = async () => {
        if (!form.fullName || !form.email || !form.roleId || !form.password) {
            toast({ message: "Please fill in all fields", variant: "error" });
            return;
        }

        const success = await addMutation.mutate(() =>
            api.post("/api/users", form)
        );

        if (success) {
            toast({ message: "User added successfully", variant: "success" });
            setIsAddUserOpen(false);
            setForm({ fullName: "", email: "", roleId: initialRoles[0]?.id ?? "", password: "" });
            refresh();
        } else if (addMutation.error) {
            toast({ message: addMutation.error, variant: "error" });
        }
    };

    const handleClose = () => {
        setIsAddUserOpen(false);
        setForm({ fullName: "", email: "", roleId: initialRoles[0]?.id ?? "", password: "" });
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Users</h1>
                    <p className="text-sm text-muted-foreground">Manage team members and access</p>
                </div>
                <button
                    onClick={() => setIsAddUserOpen(true)}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
                >
                    <Plus className="h-4 w-4" /> Add User
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <SummaryCard value={stats.total.toString()} label="Total Users" />
                <SummaryCard value={stats.active.toString()} label="Active" colorClass="text-success" />
                <SummaryCard value={stats.invited.toString()} label="Invited" colorClass="text-warning" />
                <SummaryCard value={stats.disabled.toString()} label="Disabled" colorClass="text-muted-foreground" />
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    placeholder="Search by name or email…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 w-full rounded-md bg-secondary border-0 text-sm focus:ring-1 focus:ring-ring outline-none"
                />
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Email</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden lg:table-cell">Last Active</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <UserRow key={user.id} user={user} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            {isAddUserOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="bg-background border border-border sm:rounded-lg shadow-lg w-full max-w-md p-6 relative">
                        <button
                            onClick={handleClose}
                            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 outline-none"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
                            <h2 className="text-lg font-semibold leading-none tracking-tight">Add User</h2>
                            <p className="text-sm text-muted-foreground">Fill in the details to add a new team member.</p>
                        </div>
                        <div className="space-y-4">
                            <FormField
                                label="Full Name"
                                placeholder="e.g. Jane Doe"
                                value={form.fullName}
                                onChange={(val) => setForm((prev) => ({ ...prev, fullName: val }))}
                                disabled={addMutation.isLoading}
                            />
                            <FormField
                                label="Email"
                                type="email"
                                placeholder="jane@tripledge.com"
                                value={form.email}
                                onChange={(val) => setForm((prev) => ({ ...prev, email: val }))}
                                disabled={addMutation.isLoading}
                            />
                            <FormSelect
                                label="Role"
                                options={initialRoles.map((r) => ({ label: r.name, value: r.id }))}
                                value={form.roleId}
                                onChange={(val) => setForm((prev) => ({ ...prev, roleId: val }))}
                                disabled={addMutation.isLoading}
                            />
                            <FormField
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(val) => setForm((prev) => ({ ...prev, password: val }))}
                                disabled={addMutation.isLoading}
                            />
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
                            <button
                                onClick={handleClose}
                                disabled={addMutation.isLoading}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mt-2 sm:mt-0"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddUser}
                                disabled={addMutation.isLoading || isPending}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
                            >
                                {addMutation.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                {addMutation.isLoading ? "Adding..." : "Add User"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ---- Sub-components ----

function SummaryCard({ value, label, colorClass = "text-foreground" }: { value: string; label: string; colorClass?: string }) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-4 text-center">
                <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}

function UserRow({ user }: { user: User }) {
    const getInitials = (name: string) =>
        name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

    const roleColor = {
        admin: "text-red-600 bg-red-500/15",
        supervisor: "text-blue-600 bg-blue-500/15",
    }[user.role.name.toLowerCase()] ?? "bg-muted text-muted-foreground";

    const statusColor = {
        active: "bg-success/10 text-success border-success/20",
        invited: "bg-warning/10 text-warning border-warning/20",
        disabled: "bg-destructive/10 text-destructive border-destructive/20",
    }[user.status] ?? "bg-muted text-muted-foreground border-muted";


    return (
        <tr className="border-b transition-colors hover:bg-muted/50">
            <td className="p-4 align-middle">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">{getInitials(user.fullName)}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{user.fullName}</span>
                </div>
            </td>
            <td className="p-4 align-middle hidden md:table-cell text-sm text-muted-foreground">{user.email}</td>
            <td className="p-4 align-middle">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${roleColor}`}>
                    {user.role.name}
                </span>
            </td>
            <td className="p-4 align-middle">
                <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase ${statusColor}`}>
                    {user.status}
                </div>
            </td>
            <td className="p-4 align-middle hidden lg:table-cell text-xs text-muted-foreground">
                —
            </td>
            <td className="p-4 align-middle">
                <div className="flex gap-1">
                    <button
                        title="View user"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-9 px-3"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    {user.status === "invited" && (
                        <button
                            title="Resend invite"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-9 px-3"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}

function FormField({
    label, placeholder, type = "text", value, onChange, disabled,
}: {
    label: string; placeholder: string; type?: string; value: string;
    onChange: (val: string) => void; disabled?: boolean;
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-foreground">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 outline-none"
            />
        </div>
    );
}

function FormSelect({
    label, options, value, onChange, disabled,
}: {
    label: string; options: { label: string; value: string }[];
    value: string; onChange: (val: string) => void; disabled?: boolean;
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-foreground">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 outline-none"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}
