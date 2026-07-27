"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBranch(formData: FormData) {
  const name = formData.get("name") as string;
  const location = formData.get("location") as string;

  if (!name) {
    return { error: "Branch name is required" };
  }

  // Auto-generate slug from name (lowercase, replace spaces and special chars with hyphens)
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  try {
    await prisma.branch.create({
      data: {
        name,
        location,
        slug,
      },
    });

    revalidatePath("/admin/dashboard/branches");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "A branch with this name/slug already exists." };
    }
    return { error: "Failed to create branch." };
  }
}
