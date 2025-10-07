import Link from 'next/link';

export default function PilgrimagesAdmin() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Administração de Romarias</h1>
      <div className="mb-6">
        <p className="mb-2">A nova página de <b>Gestão de Romarias</b> está disponível com recursos avançados de associação de quartos, visualização e edição.</p>
        <Link href="/admin/pilgrimages/management">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ir para Gestão de Romarias</button>
        </Link>
      </div>
      <p className="text-slate-500">Esta página será descontinuada. Utilize a nova interface para todas as operações administrativas de romarias.</p>
    </div>
  );
}
