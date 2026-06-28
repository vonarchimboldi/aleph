"use client";

interface FormSelectProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  required?: boolean;
}

export default function FormSelect({
  label,
  name,
  options,
  defaultValue,
  required,
}: FormSelectProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-zinc-300">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-white outline-none focus:border-zinc-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
