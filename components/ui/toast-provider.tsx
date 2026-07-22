"use client";

import { Toaster as SonnerToaster } from "sonner";

export function ToastProvider() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: "hsl(0 0% 100%)",
          color: "hsl(222.2 84% 4.9%)",
          border: "1px solid hsl(214.3 31.8% 91.4%)",
          borderRadius: "12px",
        },
        className: "dark:bg-zinc-950 dark:text-zinc-50 dark:border-zinc-800",
      }}
      richColors
      closeButton
    />
  );
}
