import z from "zod";

export const SignupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

export const CreateUserSchema = SignupSchema;

export const SendSchema = z.object({
    to: z.string(),
    amount: z.number().positive(),
});
