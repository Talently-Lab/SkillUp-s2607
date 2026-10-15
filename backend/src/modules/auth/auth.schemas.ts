import { z } from "zod";
import "zod-openapi";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

const email = z
  .string({ error: "Email is required" })
  .trim()
  .toLowerCase()
  .pipe(
    z
      .email({ error: "Invalid email" })
      .max(254, { error: "Email is too long" }),
  )
  .meta({ example: "valentina.ruiz@gmail.com" });

export const registerSchema = z
  .object({
    fullName: z
      .string({ error: "Full name is required" })
      .trim()
      .min(2, { error: "Full name must have at least 2 characters" })
      .max(60, { error: "Full name must have at most 60 characters" })
      .meta({ example: "Valentina Ruiz" }),
    email,
    password: z
      .string({ error: "Password is required" })
      .min(PASSWORD_MIN_LENGTH, {
        error: `Password must have at least ${PASSWORD_MIN_LENGTH} characters`,
      })
      .max(PASSWORD_MAX_LENGTH, {
        error: `Password must have at most ${PASSWORD_MAX_LENGTH} characters`,
      })
      .meta({ example: "skillup123" }),
  })
  .meta({ id: "RegisterRequest" });

export const loginSchema = z
  .object({
    email,
    password: z
      .string({ error: "Password is required" })
      .min(1, { error: "Password is required" })
      .max(PASSWORD_MAX_LENGTH, { error: "Invalid credentials" })
      .meta({ example: "skillup123" }),
  })
  .meta({ id: "LoginRequest" });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// Response schemas, used only for the OpenAPI document

export const userSchema = z
  .object({
    id: z.uuid(),
    email: z.email(),
    fullName: z.string(),
    role: z.enum(["student", "teacher", "admin"]),
    status: z.enum(["active", "suspended"]),
    createdAt: z.iso.datetime(),
  })
  .meta({ id: "User" });

export const sessionSchema = z
  .object({
    user: userSchema,
    accessToken: z.string().meta({
      description: "JWT to send as `Authorization: Bearer <token>`",
    }),
    tokenType: z.literal("Bearer"),
    expiresIn: z.number().int().meta({
      description: "Seconds until the access token expires",
      example: 900,
    }),
  })
  .meta({ id: "Session" });

export const meSchema = z
  .object({ user: userSchema })
  .meta({ id: "MeResponse" });
