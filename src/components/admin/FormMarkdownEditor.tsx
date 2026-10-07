"use client";

import { useState } from "react";
import MarkdownEditor from "./MarkdownEditor";

interface FormMarkdownEditorProps {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

export default function FormMarkdownEditor({
  label,
  name,
  defaultValue = "",
  placeholder,
  required,
  rows,
}: FormMarkdownEditorProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <MarkdownEditor
      label={label}
      name={name}
      value={value}
      onChange={setValue}
      placeholder={placeholder}
      required={required}
      rows={rows}
    />
  );
}
