import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface PasswordInputProps {
  id?: string;
  label: string;
  value: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onChange: (value: string) => void;
}

export default function PasswordInput({
  id,
  label,
  value,
  placeholder,
  error,
  disabled = false,
  autoFocus = false,
  onChange,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">

      <Label htmlFor={id}>
        {label}
      </Label>

      <div className="relative">

        <Lock
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />

        <Input
          id={id}
          autoFocus={autoFocus}
          type={showPassword ? "text" : "password"}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          className="pl-10 pr-11"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>

      </div>

      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}

    </div>
  );
}