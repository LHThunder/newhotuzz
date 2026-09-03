"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center py-20 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-destructive/15 text-destructive">
        <AlertTriangle className="size-7" />
      </div>
      <h1 className="mt-4 text-xl font-semibold">Đã có lỗi xảy ra</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Trang này gặp sự cố khi tải. Thử lại giúp bạn nhé.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-[11px] text-muted-foreground/60">Mã lỗi: {error.digest}</p>
      )}
      <Button onClick={reset} className="mt-5 gap-1.5">
        <RotateCw className="size-4" /> Thử lại
      </Button>
    </div>
  );
}
