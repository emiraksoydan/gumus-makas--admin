import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email zorunludur." })
    .email({ message: "Geçerli bir email adresi girin." }),
  password: z.string().min(1, { message: "Şifre zorunludur." }),
  keepLoggedIn: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email zorunludur." })
    .email({ message: "Geçerli bir email adresi girin." }),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Şifre en az 8 karakter olmalıdır." }),
    confirm: z.string().min(1, { message: "Şifreyi tekrar girin." }),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Şifreler eşleşmiyor.",
    path: ["confirm"],
  });

export type SignInFormValues = z.infer<typeof signInSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
