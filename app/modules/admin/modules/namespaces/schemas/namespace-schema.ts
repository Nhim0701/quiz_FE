import { z } from "zod";
import { createZodSchema, createRequiredString } from "@/lib";
import type { Namespace } from "../hooks";

export const namespaceFormBuilder = (namespace?: Namespace) => ({
  name: namespace?.name || "",
  prefix: namespace?.prefix || "",
  description: namespace?.description || "",
});

export const namespaceSchema = createZodSchema((t) =>
  z.object({
    name: createRequiredString(t, "admin.namespaces.validation.nameRequired"),
    prefix: createRequiredString(
      t,
      "admin.namespaces.validation.prefixRequired"
    ),
    description: z.string().optional(),
  })
);

export type NamespaceFormData = z.infer<ReturnType<typeof namespaceSchema>>;
