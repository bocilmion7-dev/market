import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCategories } from '@/features/admin/hooks';
import { useCategoryFormSchema, useCategoryFormDraft, useSaveCategoryFormSchema, usePublishCategoryFormSchema, useVariantFormSchema, useSaveVariantFormSchema, usePublishVariantFormSchema } from '@/features/form-builder/hooks';
import FormBuilder from '@/components/forms/FormBuilder';

export default function FormBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedCategory, setSelectedCategory] = useState(id || '');
  const [activeTab, setActiveTab] = useState<'category' | 'variant'>('category');

  const { data: categories } = useCategories();
  const { data: catSchema } = useCategoryFormSchema(selectedCategory);
  const { data: catDraft } = useCategoryFormDraft(selectedCategory);
  const saveCatForm = useSaveCategoryFormSchema(selectedCategory);
  const publishCatForm = usePublishCategoryFormSchema(selectedCategory);

  const { data: varSchema } = useVariantFormSchema(selectedCategory);
  const saveVarForm = useSaveVariantFormSchema(selectedCategory);
  const publishVarForm = usePublishVariantFormSchema(selectedCategory);

  const [catFields, setCatFields] = useState<any[]>([]);
  const [varFields, setVarFields] = useState<any[]>([]);

  useEffect(() => {
    const source = catDraft?.fields || catSchema?.fields || [];
    setCatFields(source.map((f: any) => ({
      fieldKey: f.fieldKey,
      label: f.label,
      fieldType: f.fieldType,
      required: f.required,
      placeholder: f.placeholder,
      helpText: f.helpText,
      options: f.options,
      sortOrder: f.sortOrder,
    })));
  }, [catDraft, catSchema]);

  useEffect(() => {
    const source = varSchema?.fields || [];
    setVarFields(source.map((f: any) => ({
      fieldKey: f.fieldKey,
      label: f.label,
      fieldType: f.fieldType,
      required: f.required,
      options: f.options,
      sortOrder: f.sortOrder,
    })));
  }, [varSchema]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Form Builder</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Select Category</label>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="border px-3 py-2 w-full max-w-md">
          <option value="">Choose category...</option>
          {categories?.map((cat: any) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {selectedCategory && (
        <>
          <div className="flex gap-2 mb-6">
            <button onClick={() => setActiveTab('category')} className={`px-4 py-2 rounded-sm ${activeTab === 'category' ? 'bg-brand-accent text-white' : 'bg-white border'}`}>
              Category Fields
            </button>
            <button onClick={() => setActiveTab('variant')} className={`px-4 py-2 rounded-sm ${activeTab === 'variant' ? 'bg-brand-accent text-white' : 'bg-white border'}`}>
              Variant Fields
            </button>
          </div>

          {activeTab === 'category' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">
                  {catSchema ? `Published v${catSchema.version}` : 'No published schema'}
                  {catDraft && ` | Draft v${catDraft.version}`}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => saveCatForm.mutate(catFields)} className="bg-white border px-4 py-2 text-sm rounded-sm">
                    Save Draft
                  </button>
                  <button onClick={() => publishCatForm.mutate()} className="bg-brand-accent text-white px-4 py-2 text-sm rounded-sm">
                    Publish
                  </button>
                </div>
              </div>
              <FormBuilder fields={catFields} onChange={setCatFields} />
            </div>
          )}

          {activeTab === 'variant' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">
                  {varSchema ? `Published v${varSchema.version}` : 'No published schema'}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => saveVarForm.mutate(varFields)} className="bg-white border px-4 py-2 text-sm rounded-sm">
                    Save Draft
                  </button>
                  <button onClick={() => publishVarForm.mutate()} className="bg-brand-accent text-white px-4 py-2 text-sm rounded-sm">
                    Publish
                  </button>
                </div>
              </div>
              <FormBuilder fields={varFields} onChange={setVarFields} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
