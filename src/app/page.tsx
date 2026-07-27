import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to a default branch for the entry form.
  // In a real scenario, users would scan a branch-specific QR code,
  // taking them directly to /enter/[slug].
  redirect("/enter/kochi-edappally");
}
