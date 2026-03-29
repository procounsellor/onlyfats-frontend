import { api } from "./client";

export const uploadFiles = (formData) =>
  api("/uploads", {
    method: "POST",
    body: formData,
  });
