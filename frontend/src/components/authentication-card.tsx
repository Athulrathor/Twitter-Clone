import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import ChangePasswordDialog from "@/modals/changePasswords/ChangePasswordDialog";
import { useAuth } from "@/context/AuthContext";

const badgeStyles: Record<string, string> = {
  success:
    "bg-green-100 text-green-700 border-transparent dark:bg-green-900/30 dark:text-green-400",
  warning:
    "bg-amber-100 text-amber-700 border-transparent dark:bg-amber-900/30 dark:text-amber-400",
  info: "bg-blue-100 text-blue-700 border-transparent dark:bg-blue-900/30 dark:text-blue-400",
  outline: "bg-muted text-muted-foreground border-transparent",
};

export default function AuthenticationCard() {
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const { currentSession } = useAuth();

  const handleRowClick = (id: string) => {
    switch (id) {
      case "password":
        setPasswordOpen(true);
        break;

      case "email":
        setEmailOpen(false);
        break;

      default:
        break;
    }
  };

  const rows = [
    {
      id: "password",
      label: "Password",
      sub:
        currentSession?.loginMethod.toLowerCase() === "email"
          ? "Update your password"
          : `Password managed & verified by ${currentSession?.loginMethod.toLowerCase()}`,
      badge: {
        text:
          currentSession?.loginMethod.toLowerCase() === "email"
            ? "Change"
            : "Google verified",
        variant: `${currentSession?.loginMethod.toLowerCase() === "google" ? "success" : "info"}` as const,
      },
      clickable: currentSession?.loginMethod.toLowerCase() === "email",
    },
    {
      id: "email",
      label: "Email",
      badge: { text: `${currentSession?.otpVerified ? "Verified" : "Not Verified"}`, variant: currentSession?.otpVerified ? "success" : "warning" as const },
      clickable: !currentSession?.otpVerified,
    },
    {
      id: "chrome",
      label: "Chrome login",
      badge: { text: "OTP required", variant: "warning" as const },
    },
    {
      id: "edge",
      label: "Microsoft browser",
      badge: { text: "Direct login", variant: "info" as const },
    },
    {
      id: "mobile",
      label: "Mobile login",
      badge: { text: "10 AM – 1 PM", variant: "outline" as const },
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start gap-3 pb-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted mt-0.5">
          <Lock className="h-4 w-4 text-foreground" />
        </div>
        <div>
          <CardTitle className="text-base">Authentication</CardTitle>
          <CardDescription className="text-sm">
            Manage how you sign in to your account.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {rows.map((row) => (
          <div key={row.id}>
            <Separator />

            <button
              type="button"
              onClick={() => handleRowClick(row.id)}
              disabled={!row.clickable}
              className={cn(
                "flex w-full items-center justify-between px-5 py-[0.875rem] gap-4 text-left transition-colors",
                row.clickable
                  ? "cursor-pointer hover:bg-muted"
                  : "cursor-default ",
              )}
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-medium">{row.label}</span>

                {row.sub && (
                  <span className="text-xs text-muted-foreground">
                    {row.sub}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[11px] font-medium px-2 py-0.5 rounded-full",
                    badgeStyles[row.badge.variant],
                  )}
                >
                  {row.badge.text}
                </Badge>

                {row.clickable && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>
          </div>
        ))}
      </CardContent>

        <ChangePasswordDialog
          open={passwordOpen}
          hasPassword={
            currentSession?.loginMethod?.toLowerCase() === "email" ? false : true
          }
          providerName={currentSession?.loginMethod?.toLowerCase()}
          onOpenChange={setPasswordOpen}
        />

        {/* <VerifyEmailDialog
          open={EmailOpen}
          hasVerified={
            currentSession?.otpVerified
          }
          providerName={currentSession?.loginMethod?.toLowerCase()}
          onOpenChange={setEmailOpen}
        /> */}
    </Card>
  );
}
