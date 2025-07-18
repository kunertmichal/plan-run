import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/profile")({
  component: Profile,
});

function Profile() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profil</h2>
        <p className="text-gray-600">Zarządzaj swoim profilem</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Informacje osobiste</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Imię i nazwisko
            </label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Wprowadź swoje imię i nazwisko"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="twój@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data urodzenia
            </label>
            <input
              type="date"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-6">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Zapisz zmiany
          </button>
        </div>
      </div>
    </div>
  );
}
