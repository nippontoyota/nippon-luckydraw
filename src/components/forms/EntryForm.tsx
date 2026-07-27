"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { entrySchema, type EntryInput } from "@/schemas/entry";
import { submitEntry } from "@/app/actions/entry";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ModelWithColours {
  id: string;
  name: string;
  colours: { id: string; name: string }[];
}

interface EntryFormProps {
  slug: string;
  branchName: string;
  models: ModelWithColours[];
}

export function EntryForm({ slug, branchName, models }: EntryFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<EntryInput>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      name: "",
      phone: "",
      modelId: "",
      colourId: "",
      vin: "",
      slug,
      honeypot: "",
    },
  });

  const router = useRouter();

  const selectedModelId = form.watch("modelId");
  const selectedModel = models.find((m) => m.id === selectedModelId);
  const availableColours = selectedModel?.colours || [];

  const onSubmit = async (data: EntryInput) => {
    setLoading(true);
    form.clearErrors("root");
    
    const result = await submitEntry(data);
    
    if ("error" in result) {
      form.setError("root", { message: result.error as string });
      setLoading(false);
    } else if ("id" in result) {
      // Redirect to confirmation page
      router.push(`/confirmation/${result.id}`);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto border-t-4 border-t-primary shadow-xl rounded-2xl overflow-hidden bg-white/95 backdrop-blur">
      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-border/50 pb-6 text-center">
        <CardTitle className="text-xl font-bold text-foreground">
          {branchName} Branch
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Complete the form below to enter the Onam lucky draw!
        </p>
      </CardHeader>

      <CardContent className="pt-6 pb-8 px-6 md:px-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Honeypot field for spam prevention */}
          <input
            type="text"
            {...form.register("honeypot")}
            className="absolute -left-[9999px] opacity-0 pointer-events-none"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-semibold">
              Full Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. John Doe"
              {...form.register("name")}
              className={`h-12 bg-gray-50 border-gray-200 focus-visible:ring-primary ${
                form.formState.errors.name ? "border-destructive" : ""
              }`}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive font-medium">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground font-semibold">
              Mobile Number
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                +91
              </span>
              <Input
                id="phone"
                placeholder="98765 43210"
                maxLength={10}
                {...form.register("phone")}
                className={`h-12 pl-10 bg-gray-50 border-gray-200 focus-visible:ring-primary ${
                  form.formState.errors.phone ? "border-destructive" : ""
                }`}
              />
            </div>
            {form.formState.errors.phone && (
              <p className="text-sm text-destructive font-medium">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="modelId" className="text-foreground font-semibold">
                Vehicle Model
              </Label>
              <Select
                onValueChange={(value) => {
                  form.setValue("modelId", value || "", { shouldValidate: true });
                  // Reset colour when model changes
                  form.setValue("colourId", "", { shouldValidate: true });
                }}
                defaultValue={form.getValues("modelId")}
              >
                <SelectTrigger
                  className={`h-12 bg-gray-50 border-gray-200 focus:ring-primary ${
                    form.formState.errors.modelId ? "border-destructive" : ""
                  }`}
                >
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.modelId && (
                <p className="text-sm text-destructive font-medium">
                  {form.formState.errors.modelId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="colourId" className="text-foreground font-semibold">
                Colour
              </Label>
              <Select
                disabled={!selectedModelId}
                onValueChange={(value) =>
                  form.setValue("colourId", value || "", { shouldValidate: true })
                }
                value={form.watch("colourId")}
              >
                <SelectTrigger
                  className={`h-12 bg-gray-50 border-gray-200 focus:ring-primary ${
                    form.formState.errors.colourId ? "border-destructive" : ""
                  }`}
                >
                  <SelectValue placeholder="Select Colour" />
                </SelectTrigger>
                <SelectContent>
                  {availableColours.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.colourId && (
                <p className="text-sm text-destructive font-medium">
                  {form.formState.errors.colourId.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vin" className="text-foreground font-semibold">
              Vehicle Identification Number (VIN)
            </Label>
            <Input
              id="vin"
              placeholder="17-character VIN"
              maxLength={17}
              {...form.register("vin", {
                onChange: (e) => {
                  e.target.value = e.target.value.toUpperCase();
                },
              })}
              className={`h-12 uppercase font-mono text-sm bg-gray-50 border-gray-200 focus-visible:ring-primary ${
                form.formState.errors.vin ? "border-destructive" : ""
              }`}
            />
            {form.formState.errors.vin ? (
              <p className="text-sm text-destructive font-medium">
                {form.formState.errors.vin.message}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                You can find this on your vehicle invoice or registration certificate.
              </p>
            )}
          </div>

          {form.formState.errors.root && (
            <div className="p-4 bg-destructive/10 text-destructive text-sm font-medium rounded-lg border border-destructive/20 flex items-start gap-2">
              <div className="mt-0.5">⚠️</div>
              <div>{form.formState.errors.root.message}</div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 text-lg font-black tracking-wide uppercase shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
          >
            {loading ? "Registering..." : "Submit Entry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
