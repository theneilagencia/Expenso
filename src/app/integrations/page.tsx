export default function IntegrationsPage() {
  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-semibold mb-4">Conectar Plataformas</h1>

      <p className="text-gray-600 mb-6">
        Conecte as plataformas onde deseja anunciar.  
        Tudo será feito de forma simples e guiada.
      </p>

      <div className="space-y-3">
        <button className="w-full p-3 border rounded">Conectar Meta</button>
        <button className="w-full p-3 border rounded">Conectar Google</button>
        <button className="w-full p-3 border rounded">Conectar TikTok</button>
      </div>

      <div className="mt-8">
        <button className="w-full bg-blue-600 text-white p-3 rounded">
          Continuar
        </button>
      </div>
    </div>
  );
}
