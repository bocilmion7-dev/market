import { z } from 'zod';

const fieldSchema = z.object({
  fieldKey: z.string().max(100),
  label: z.string().max(150),
  fieldType: z.enum(['TEXT', 'TEXTAREA', 'NUMBER', 'DECIMAL', 'SELECT', 'MULTI_SELECT', 'RADIO', 'CHECKBOX', 'DATE', 'BOOLEAN', 'IMAGE', 'FILE']),
  required: z.boolean(),
  placeholder: z.string().max(255).optional(),
  helpText: z.string().optional(),
  defaultValue: z.any().optional(),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  validationRules: z.record(z.any()).optional(),
  sortOrder: z.number(),
});

export const saveFormSchema = z.object({
  fields: z.array(fieldSchema),
});
