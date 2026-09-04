"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

interface RestoreAccountDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  loading?: boolean;
  deletedAt?: string | Date | null;
  scheduledDeleteAt?: string | Date | null;
  restoreAt?: string | Date | null;
  onRestore: () => Promise<void> | void;
}

export default function RestoreAccountDialog({
  open,
  onOpenChange,
  loading = false,
  deletedAt,
  scheduledDeleteAt,
  restoreAt,
  onRestore,
}: RestoreAccountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="sm:max-w-md"
      >
        <DialogHeader className="items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>

          <DialogTitle className="mt-4 text-2xl">
            Account Scheduled for Deletion
          </DialogTitle>

          <DialogDescription className="space-y-2 text-center">
            <div>Your account has been marked for deletion.</div>

            {deletedAt && (
              <div>
                Deleted on{" "}
                <strong>{new Date(deletedAt).toLocaleString()}</strong>
              </div>
            )}

            {scheduledDeleteAt && (
              <div>
                Permanent deletion on{" "}
                <strong>{new Date(scheduledDeleteAt).toLocaleString()}</strong>
              </div>
            )}

            {restoreAt && (
              <div>
                Restore available until{" "}
                <strong>{new Date(restoreAt).toLocaleString()}</strong>
              </div>
            )}

            <div className="text-muted-foreground">
              Restore your account now to continue using the application.
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            className="w-full"
            size="lg"
            disabled={loading}
            onClick={onRestore}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            {loading ? "Restoring..." : "Restore Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
