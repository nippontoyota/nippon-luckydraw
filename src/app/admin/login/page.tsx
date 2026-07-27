"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-t-4 border-t-primary shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-black">Admin Panel</CardTitle>
          <p className="text-sm text-muted-foreground">Sign in to manage the Lucky Draw</p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="h-12"
                placeholder="admin@nippontoyota.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="h-12"
              />
            </div>

            {state?.error && (
              <div className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-md">
                {state.error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
