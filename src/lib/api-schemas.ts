import { NextResponse } from 'next/server';
import { z } from 'zod';

export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
});

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  total: z.number().int().nonnegative().optional(),
});

export const CountryCodeSchema = z.string().length(2).toLowerCase();

export const DateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export function apiResponse<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    data: dataSchema,
    pagination: PaginationSchema.optional(),
  });
}

export function apiError(message: string, details?: string, status: number = 400) {
  return NextResponse.json(
    { error: message, ...(details ? { details } : {}) },
    { status }
  );
}

export function apiSuccess(data?: unknown, status: number = 200) {
  return NextResponse.json(
    { success: true, ...(data ? { data } : {}) },
    { status }
  );
}
