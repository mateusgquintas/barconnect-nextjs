import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Página não encontrada</h1>
        <p className="text-muted-foreground">A página que você procura pode ter sido movida ou não existe.</p>
        <Link href="/" className="px-3 py-1 rounded border">
          Ir para a página inicial
        </Link>
      </div>
    </div>
  );
}
