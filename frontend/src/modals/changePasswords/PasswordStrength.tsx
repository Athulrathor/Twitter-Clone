import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  score: number; // 0 - 5
}

const levels = [
  {
    label: "Very Weak",
    color: "bg-destructive",
    width: "20%",
  },
  {
    label: "Weak",
    color: "bg-orange-500",
    width: "40%",
  },
  {
    label: "Fair",
    color: "bg-yellow-500",
    width: "60%",
  },
  {
    label: "Strong",
    color: "bg-lime-500",
    width: "80%",
  },
  {
    label: "Very Strong",
    color: "bg-green-600",
    width: "100%",
  },
];

export default function PasswordStrength({
  score,
}: PasswordStrengthProps) {
  if (score === 0) return null;

  const level = levels[score - 1];

  return (
    <div className="space-y-2">

      <div className="flex items-center justify-between">

        <span className="text-sm font-medium">
          Password Strength
        </span>

        <span
          className={cn(
            "text-xs font-semibold",
            score >= 4
              ? "text-green-600"
              : score === 3
              ? "text-yellow-600"
              : "text-destructive"
          )}
        >
          {level.label}
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">

        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            level.color
          )}
          style={{
            width: level.width,
          }}
        />

      </div>

    </div>
  );
}