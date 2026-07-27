import { redirect } from "next/navigation";

export default function Home() {
  // Forms are accessed via QR codes containing specific branch slugs (/enter/[slug]).
  // The root path should redirect to the admin login.
  redirect("/admin/login");
}
