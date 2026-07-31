import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional().default(false),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const contentSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  richText: z.string().optional(),
  contentType: z.enum([
    "IMAGE", "VIDEO", "AUDIO", "PDF", "EBOOK",
    "SOFTWARE", "TEMPLATE", "DOCUMENT", "COURSE"
  ]),
  status: z.enum(["PUBLISHED", "DRAFT", "HIDDEN"]),
  priceType: z.enum(["FREE", "PAID", "COMING_SOON", "HIDDEN"]),
  originalPrice: z.number().optional().nullable(),
  discountPrice: z.number().optional().nullable(),
  currency: z.string().default("INR"),
  language: z.string().optional(),
});

export const qrPaymentSchema = z.object({
  purchaseId: z.string(),
  transactionId: z.string().min(1, "Transaction ID is required"),
  paymentNote: z.string().optional(),
});

export const reviewSchema = z.object({
  contentId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export const settingSchema = z.object({
  key: z.string(),
  value: z.string(),
  type: z.enum(["string", "number", "boolean", "json"]).default("string"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ContentInput = z.infer<typeof contentSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type QRPaymentInput = z.infer<typeof qrPaymentSchema>;
