import React from 'react';

interface MultiFilterSelectProps {
  label: string;
  values: string[];
  options: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function MultiFilterSelect({ label, values, options, onChange }: MultiFilterSelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
    onChange(selected);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <select
        multiple
        value={values}
        onChange={handleChange}
        className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white text-gray-700 min-w-[220px] focus:outline-none focus:ring-2 focus:ring-blue-300"
        style={{ minHeight: '80px' }}
        aria-label={label}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {values.length > 0 && (
        <p className="text-xs text-gray-400">{values.length} seleccionado(s)</p>
      )}
    </div>
  );
}
