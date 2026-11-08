"use server";

import { revalidatePath } from "next/cache";
import { createTaskCategory, updateTaskCategory, deleteTaskCategory } from "../hooks/category-queries";
import { createTaskCategorySchema, updateTaskCategorySchema } from "../actions/category-schema";

export async function createTaskCategoryAction(formData: FormData) {
  const input = createTaskCategorySchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    color: formData.get("color") || undefined,
  });

  await createTaskCategory(input);
  revalidatePath("/tasks");
}

export async function updateTaskCategoryAction(formData: FormData) {
  const categoryId = formData.get("categoryId") as string;
  const input = updateTaskCategorySchema.parse({
    name: formData.get("name") || undefined,
    description: formData.get("description") || undefined,
    color: formData.get("color") || undefined,
  });

  await updateTaskCategory(categoryId, input);
  revalidatePath("/tasks");
}

export async function deleteTaskCategoryAction(formData: FormData) {
  const categoryId = formData.get("categoryId") as string;
  await deleteTaskCategory(categoryId);
  revalidatePath("/tasks");
}
