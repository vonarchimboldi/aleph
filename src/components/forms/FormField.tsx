"use client";

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  min?: number;
  max?: number;
}

export default function FormField({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
  rows,
  min,
  max,
}: FormFieldProps) {
  const inputClasses =
    "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-white outline-none focus:border-zinc-500";

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-zinc-300">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      {rows ? (
        <textarea
          id={name}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={inputClasses}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          className={inputClasses}
        />
      )}
    </div>
  );
}
