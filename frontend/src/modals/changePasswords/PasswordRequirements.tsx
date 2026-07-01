import {
  CheckCircle2,
  Circle,
} from "lucide-react";

interface PasswordRequirementsProps {
  password: string;
}

export default function PasswordRequirements({
  password,
}: PasswordRequirementsProps) {
  const requirements = [
    {
      label: "At least 8 characters",
      passed: password.length >= 8,
    },
    {
      label: "One uppercase letter (A-Z)",
      passed: /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter (a-z)",
      passed: /[a-z]/.test(password),
    },
    {
      label: "One number (0-9)",
      passed: /\d/.test(password),
    },
    {
      label: "One special character (!@#$...)",
      passed: /[^A-Za-z0-9]/.test(password),
    },
  ];

  return (
    <div className="space-y-3 rounded-lg border bg-muted/40 p-4">

      <h4 className="text-sm font-medium">
        Password Requirements
      </h4>

      <div className="space-y-2">

        {requirements.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2"
          >
            {item.passed ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}

            <span
              className={
                item.passed
                  ? "text-sm text-foreground"
                  : "text-sm text-muted-foreground"
              }
            >
              {item.label}
            </span>
          </div>
        ))}

      </div>

    </div>
  );
}