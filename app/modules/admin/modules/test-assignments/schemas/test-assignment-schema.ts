import { z } from "zod";
import { createZodSchema, createRequiredString } from "@/lib";
import type { TestAssignment } from "../hooks";

export const testAssignmentFormBuilder = (_assignment?: TestAssignment) => ({
  userId: "",
  testId: "",
});

export const testAssignmentSchema = createZodSchema((t) =>
  z.object({
    userId: createRequiredString(t, "admin.testAssignments.validation.userRequired"),
    testId: createRequiredString(t, "admin.testAssignments.validation.testRequired"),
  })
);

export type TestAssignmentFormData = z.infer<ReturnType<typeof testAssignmentSchema>>;
