import React from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Props {
  title?: string;
  description?: string;
}

export default function AuthenticationHeader({ title, description }: Props) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>

        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
    </>
  );
}
