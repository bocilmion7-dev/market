import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

type FieldType = 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'DECIMAL' | 'SELECT' | 'MULTI_SELECT' | 'RADIO' | 'CHECKBOX' | 'DATE' | 'BOOLEAN' | 'IMAGE' | 'FILE';

interface FieldInput {
  fieldKey: string;
  label: string;
  fieldType: FieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  options?: { label: string; value: string }[];
  validationRules?: Record<string, any>;
  sortOrder: number;
}

// Category Form Schema
export async function getCategoryFormSchema(categoryId: string) {
  const schema = await prisma.categoryFormSchema.findFirst({
    where: { categoryId, status: 'PUBLISHED' },
    include: { fields: { orderBy: { sortOrder: 'asc' } } },
  });
  return schema;
}

export async function getCategoryFormSchemaDraft(categoryId: string) {
  const schema = await prisma.categoryFormSchema.findFirst({
    where: { categoryId, status: 'DRAFT' },
    include: { fields: { orderBy: { sortOrder: 'asc' } } },
  });
  return schema;
}

export async function saveCategoryFormSchema(categoryId: string, fields: FieldInput[], userId: string) {
  const existing = await prisma.categoryFormSchema.findFirst({
    where: { categoryId, status: 'DRAFT' },
  });

  const version = existing ? existing.version : 1;

  if (existing) {
    await prisma.categoryFormField.deleteMany({ where: { schemaId: existing.id } });
    return prisma.categoryFormSchema.update({
      where: { id: existing.id },
      data: {
        fields: {
          create: fields.map(f => ({
            fieldKey: f.fieldKey,
            label: f.label,
            fieldType: f.fieldType,
            required: f.required,
            placeholder: f.placeholder,
            helpText: f.helpText,
            defaultValue: f.defaultValue,
            options: f.options,
            validationRules: f.validationRules,
            sortOrder: f.sortOrder,
            status: 'ACTIVE',
          })),
        },
      },
      include: { fields: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  const maxVersion = await prisma.categoryFormSchema.findFirst({
    where: { categoryId },
    orderBy: { version: 'desc' },
    select: { version: true },
  });

  const newVersion = maxVersion ? maxVersion.version + 1 : 1;

  return prisma.categoryFormSchema.create({
    data: {
      categoryId,
      version: newVersion,
      status: 'DRAFT',
      createdBy: userId,
      fields: {
        create: fields.map(f => ({
          fieldKey: f.fieldKey,
          label: f.label,
          fieldType: f.fieldType,
          required: f.required,
          placeholder: f.placeholder,
          helpText: f.helpText,
          defaultValue: f.defaultValue,
          options: f.options,
          validationRules: f.validationRules,
          sortOrder: f.sortOrder,
          status: 'ACTIVE',
        })),
      },
    },
    include: { fields: { orderBy: { sortOrder: 'asc' } } },
  });
}

export async function publishCategoryFormSchema(categoryId: string) {
  const draft = await prisma.categoryFormSchema.findFirst({
    where: { categoryId, status: 'DRAFT' },
  });
  if (!draft) throw new AppError(404, 'NOT_FOUND', 'No draft schema found');

  await prisma.categoryFormSchema.updateMany({
    where: { categoryId, status: 'PUBLISHED' },
    data: { status: 'ARCHIVED' },
  });

  return prisma.categoryFormSchema.update({
    where: { id: draft.id },
    data: { status: 'PUBLISHED' },
    include: { fields: { orderBy: { sortOrder: 'asc' } } },
  });
}

// Variant Form Schema
export async function getVariantFormSchema(categoryId: string) {
  return prisma.variantFormSchema.findFirst({
    where: { categoryId, status: 'PUBLISHED' },
    include: { fields: { orderBy: { sortOrder: 'asc' } } },
  });
}

export async function getVariantFormSchemaDraft(categoryId: string) {
  return prisma.variantFormSchema.findFirst({
    where: { categoryId, status: 'DRAFT' },
    include: { fields: { orderBy: { sortOrder: 'asc' } } },
  });
}

export async function saveVariantFormSchema(categoryId: string, fields: FieldInput[], userId: string) {
  const existing = await prisma.variantFormSchema.findFirst({
    where: { categoryId, status: 'DRAFT' },
  });

  if (existing) {
    await prisma.variantFormField.deleteMany({ where: { schemaId: existing.id } });
    return prisma.variantFormSchema.update({
      where: { id: existing.id },
      data: {
        fields: {
          create: fields.map(f => ({
            fieldKey: f.fieldKey,
            label: f.label,
            fieldType: f.fieldType,
            required: f.required,
            options: f.options,
            validationRules: f.validationRules,
            sortOrder: f.sortOrder,
            status: 'ACTIVE',
          })),
        },
      },
      include: { fields: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  const maxVersion = await prisma.variantFormSchema.findFirst({
    where: { categoryId },
    orderBy: { version: 'desc' },
    select: { version: true },
  });

  const newVersion = maxVersion ? maxVersion.version + 1 : 1;

  return prisma.variantFormSchema.create({
    data: {
      categoryId,
      version: newVersion,
      status: 'DRAFT',
      createdBy: userId,
      fields: {
        create: fields.map(f => ({
          fieldKey: f.fieldKey,
          label: f.label,
          fieldType: f.fieldType,
          required: f.required,
          options: f.options,
          validationRules: f.validationRules,
          sortOrder: f.sortOrder,
          status: 'ACTIVE',
        })),
      },
    },
    include: { fields: { orderBy: { sortOrder: 'asc' } } },
  });
}

export async function publishVariantFormSchema(categoryId: string) {
  const draft = await prisma.variantFormSchema.findFirst({
    where: { categoryId, status: 'DRAFT' },
  });
  if (!draft) throw new AppError(404, 'NOT_FOUND', 'No draft schema found');

  await prisma.variantFormSchema.updateMany({
    where: { categoryId, status: 'PUBLISHED' },
    data: { status: 'ARCHIVED' },
  });

  return prisma.variantFormSchema.update({
    where: { id: draft.id },
    data: { status: 'PUBLISHED' },
    include: { fields: { orderBy: { sortOrder: 'asc' } } },
  });
}
