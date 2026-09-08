import React from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  helperText,
  className = "",
  ...props
}) => {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-bold text-[#14304A]">
        {label}
        {props.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        className={`w-full text-xs px-3.5 py-2.5 rounded-xl border bg-[#FAFCFB] text-[#14304A] outline-none transition-all focus:bg-white focus:border-[#559620] focus:ring-2 focus:ring-[#559620]/10 ${
          error ? "border-red-500" : "border-[#CCDCCD]"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-[10px] text-red-500 font-bold">{error}</p>}
      {helperText && !error && (
        <p className="text-[10px] text-[#718573]">{helperText}</p>
      )}
    </div>
  );
};
