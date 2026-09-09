import { useState } from 'react';

interface Field {
  fieldKey: string;
  label: string;
  fieldType: string;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: { label: string; value: string }[];
  sortOrder: number;
}

interface FormBuilderProps {
  fields: Field[];
  onChange: (fields: Field[]) => void;
}

const FIELD_TYPES = ['TEXT', 'TEXTAREA', 'NUMBER', 'DECIMAL', 'SELECT', 'MULTI_SELECT', 'RADIO', 'CHECKBOX', 'DATE', 'BOOLEAN'];

export default function FormBuilder({ fields, onChange }: FormBuilderProps) {
  const [editing, setEditing] = useState<number | null>(null);

  const addField = () => {
    const newField: Field = {
      fieldKey: `field_${Date.now()}`,
      label: '',
      fieldType: 'TEXT',
      required: false,
      sortOrder: fields.length,
    };
    onChange([...fields, newField]);
    setEditing(fields.length);
  };

  const updateField = (index: number, updates: Partial<Field>) => {
    const updated = fields.map((f, i) => i === index ? { ...f, ...updates } : f);
    onChange(updated);
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const moveField = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const updated = [...fields];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated.map((f, i) => ({ ...f, sortOrder: i })));
  };

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={index} className="border p-4 bg-white">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">{field.label || field.fieldKey} <span className="text-gray-400 text-sm">({field.fieldType})</span></span>
            <div className="flex gap-1">
              <button onClick={() => moveField(index, -1)} className="text-gray-400 hover:text-gray-600 text-sm">↑</button>
              <button onClick={() => moveField(index, 1)} className="text-gray-400 hover:text-gray-600 text-sm">↓</button>
              <button onClick={() => setEditing(editing === index ? null : index)} className="text-brand-accent text-sm">Edit</button>
              <button onClick={() => removeField(index)} className="text-red-500 text-sm">Remove</button>
            </div>
          </div>

          {editing === index && (
            <div className="space-y-2 mt-2 pt-2 border-t">
              <input placeholder="Label" value={field.label} onChange={(e) => updateField(index, { label: e.target.value })} className="w-full border px-2 py-1 text-sm" />
              <input placeholder="Field Key" value={field.fieldKey} onChange={(e) => updateField(index, { fieldKey: e.target.value })} className="w-full border px-2 py-1 text-sm" />
              <select value={field.fieldType} onChange={(e) => updateField(index, { fieldType: e.target.value })} className="w-full border px-2 py-1 text-sm">
                {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={field.required} onChange={(e) => updateField(index, { required: e.target.checked })} />
                <span className="text-sm">Required</span>
              </label>
              <input placeholder="Placeholder" value={field.placeholder || ''} onChange={(e) => updateField(index, { placeholder: e.target.value })} className="w-full border px-2 py-1 text-sm" />
              <input placeholder="Help Text" value={field.helpText || ''} onChange={(e) => updateField(index, { helpText: e.target.value })} className="w-full border px-2 py-1 text-sm" />
              {['SELECT', 'MULTI_SELECT', 'RADIO'].includes(field.fieldType) && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Options (one per line: label,value)</p>
                  <textarea
                    value={field.options?.map(o => `${o.label},${o.value}`).join('\n') || ''}
                    onChange={(e) => {
                      const opts = e.target.value.split('\n').filter(Boolean).map(line => {
                        const [label, value] = line.split(',');
                        return { label: label || value || '', value: value || label || '' };
                      });
                      updateField(index, { options: opts });
                    }}
                    className="w-full border px-2 py-1 text-sm h-20"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <button onClick={addField} className="border-2 border-dashed p-3 w-full text-gray-500 hover:text-brand-accent hover:border-brand-accent transition-colors">
        + Add Field
      </button>
    </div>
  );
}
