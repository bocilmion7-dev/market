interface FieldRendererProps {
  field: {
    fieldKey: string;
    label: string;
    fieldType: string;
    required: boolean;
    placeholder?: string;
    helpText?: string;
    options?: { label: string; value: string }[];
  };
  value: any;
  onChange: (value: any) => void;
}

export default function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  const baseClass = "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-accent";

  switch (field.fieldType) {
    case 'TEXT':
      return (
        <div>
          <label className="block text-sm font-medium mb-1">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
          <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={baseClass} />
          {field.helpText && <p className="text-xs text-gray-400 mt-1">{field.helpText}</p>}
        </div>
      );
    case 'TEXTAREA':
      return (
        <div>
          <label className="block text-sm font-medium mb-1">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
          <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={`${baseClass} h-24`} />
        </div>
      );
    case 'NUMBER':
    case 'DECIMAL':
      return (
        <div>
          <label className="block text-sm font-medium mb-1">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
          <input type="number" value={value || ''} onChange={(e) => onChange(field.fieldType === 'DECIMAL' ? parseFloat(e.target.value) : parseInt(e.target.value))} className={baseClass} />
        </div>
      );
    case 'SELECT':
      return (
        <div>
          <label className="block text-sm font-medium mb-1">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
          <select value={value || ''} onChange={(e) => onChange(e.target.value)} className={baseClass}>
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    case 'MULTI_SELECT':
      return (
        <div>
          <label className="block text-sm font-medium mb-1">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
          <div className="flex flex-wrap gap-2">
            {field.options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={(value || []).includes(opt.value)}
                  onChange={(e) => {
                    const current = value || [];
                    onChange(e.target.checked ? [...current, opt.value] : current.filter((v: string) => v !== opt.value));
                  }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      );
    case 'RADIO':
      return (
        <div>
          <label className="block text-sm font-medium mb-1">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
          <div className="flex gap-4">
            {field.options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-1">
                <input type="radio" name={field.fieldKey} checked={value === opt.value} onChange={() => onChange(opt.value)} />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      );
    case 'CHECKBOX':
      return (
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          <span className="text-sm font-medium">{field.label} {field.required && <span className="text-red-500">*</span>}</span>
        </label>
      );
    case 'DATE':
      return (
        <div>
          <label className="block text-sm font-medium mb-1">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
          <input type="date" value={value || ''} onChange={(e) => onChange(e.target.value)} className={baseClass} />
        </div>
      );
    case 'BOOLEAN':
      return (
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          <span className="text-sm font-medium">{field.label}</span>
        </label>
      );
    default:
      return (
        <div>
          <label className="block text-sm font-medium mb-1">{field.label}</label>
          <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className={baseClass} />
        </div>
      );
  }
}
