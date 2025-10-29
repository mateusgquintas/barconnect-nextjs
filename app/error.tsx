"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Simple client-side logging; replace with a proper logger if desired
    // eslint-disable-next-line no-console
    console.error("Global error boundary:", { message: error?.message, stack: error?.stack, digest: error?.digest });
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-dvh flex items-center justify-center p-6">
          <div className="max-w-md w-full space-y-4 text-center">
            <h1 className="text-2xl font-semibold">Algo deu errado</h1>
            <p className="text-muted-foreground">Se o problema persistir, entre em contato com o suporte.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => reset()}
                className="px-3 py-1 rounded border bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Tentar novamente
              </button>
              <Link href="/" className="px-3 py-1 rounded border">
                Voltar para início
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
