"use client";

import { Eye, EyeOff, LucideIcon } from "lucide-react";
import { forwardRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FieldProps {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  icon?: LucideIcon;
  error?: string | null;
  hint?: string;
}

export function FormField({
  label,
  name,
  required,
  placeholder,
  icon: Icon,
  error,
  hint,
  ...props
}: FieldProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
        {required && <span className="text-[#5B132B]">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          required={required}
          placeholder={placeholder}
          className={`h-10 rounded-xl ${error ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-[#D4AF37]"}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function FormTextarea({
  label,
  name,
  required,
  placeholder,
  icon: Icon,
  error,
  hint,
  rows = 3,
  ...props
}: FieldProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
        {required && <span className="text-[#5B132B]">*</span>}
      </Label>
      <Textarea
        id={name}
        name={name}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className={`rounded-xl ${error ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-[#D4AF37]"}`}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function FormSelect({
  label,
  name,
  required,
  placeholder,
  icon: Icon,
  error,
  hint,
  options,
  value,
  onChange,
}: FieldProps & {
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
}) {
  // When value is empty string or undefined, pass undefined so Radix shows the placeholder
  const selectValue = (value === "" || value === undefined) ? undefined : value;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
        {required && <span className="text-[#5B132B]">*</span>}
      </Label>
      <Select name={name} value={String(selectValue ?? "")} onValueChange={onChange ?? (() => {})}>
        <SelectTrigger
          id={name}
          className={`h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-offset-0 ${error ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-[#D4AF37]"}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function FormPassword({
  label,
  name,
  required,
  placeholder,
  error,
  hint,
  ...props
}: FieldProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-[#5B132B]">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          required={required}
          placeholder={placeholder}
          className={`h-10 rounded-xl pr-10 ${error ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-[#D4AF37]"}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
