import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Header } from "@/components/app/Header";
import { useAuth } from "@/components/app/AuthProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — Saptapath" }] }),
  component: Signup,
});

function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await signUp(email, password, name);
    setBusy(false);
    if (error) { toast.error(error); return; }
    toast.success("Account created. Welcome.");
    navigate({ to: "/tracks" });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto flex max-w-md flex-col px-6 pt-20">
        <h1 className="font-display text-3xl font-semibold">Begin your path</h1>
        <p className="mt-2 text-sm text-muted-foreground">Choose a track after signing up.</p>
        <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-border/60 p-6" style={{ background: "var(--gradient-surface)" }}>
          <div className="space-y-2">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>{busy ? "Creating…" : "Create account"}</Button>
          <p className="text-center text-xs text-muted-foreground">
            Already have one? <Link to="/login" className="text-primary underline-offset-4 hover:underline">Sign in</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
