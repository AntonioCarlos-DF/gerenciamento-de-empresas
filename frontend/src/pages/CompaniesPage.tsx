import { useState, useEffect } from "react";
import API_URL, { authHeaders } from '../services/api';

interface Company {
  _id: string;
  tradeName: string;
  legalName: string;
  cnpj: string;
}

export default function CompaniesPage({ token }: { token: string }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    tradeName: "",
    legalName: "",
    cnpj: "",
  });

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/companies`, {
        headers: authHeaders(token),
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar empresas");
      }

      const data = await response.json();
      setCompanies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [token]);

  const formatCNPJ = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    const limited = cleaned.substring(0, 14);
    return limited
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  };

  const isValidCNPJ = (cnpj: string): boolean => {
    const cleaned = cnpj.replace(/\D/g, "");
    return cleaned.length === 14;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "cnpj") {
      const formatted = formatCNPJ(value);
      setFormData({ ...formData, [name]: formatted });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const openCreateForm = () => {
    setIsCreating(true);
    setFormData({ tradeName: "", legalName: "", cnpj: "" });
  };

  const openEditForm = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      tradeName: company.tradeName,
      legalName: company.legalName,
      cnpj: formatCNPJ(company.cnpj),
    });
  };

  const closeForms = () => {
    setIsCreating(false);
    setEditingCompany(null);
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidCNPJ(formData.cnpj)) {
      setError("CNPJ deve ter 14 dígitos");
      return;
    }

    try {
      const cnpjToSend = formData.cnpj.replace(/\D/g, "");
      const response = await fetch(`${API_URL}/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(token),
        },
        body: JSON.stringify({
          ...formData,
          cnpj: cnpjToSend,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar empresa");
      }

      const createdCompany = await response.json();
      setCompanies([...companies, createdCompany]);
      closeForms();
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    }
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingCompany) return;

    if (!isValidCNPJ(formData.cnpj)) {
      setError("CNPJ deve ter 14 dígitos");
      return;
    }

    try {
      const cnpjToSend = formData.cnpj.replace(/\D/g, "");
      const response = await fetch(
        `${API_URL}/companies/${editingCompany._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(token),
          },
          body: JSON.stringify({
            ...formData,
            cnpj: cnpjToSend,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar empresa");
      }

      const updatedCompany = await response.json();
      setCompanies(
        companies.map((c) =>
          c._id === editingCompany._id ? updatedCompany : c
        )
      );
      closeForms();
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta empresa?")) return;

    try {
      const response = await fetch(`${API_URL}/companies/${companyId}`, {
        method: "DELETE",
        headers: authHeaders(token),
      });

      if (!response.ok) throw new Error("Erro ao excluir empresa");
      setCompanies(companies.filter((c) => c._id !== companyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro");
    }
  };

  if (loading) return <div className="text-center py-8">Carregando empresas...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Gerenciamento de Empresas</h3>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
          onClick={openCreateForm}
        >
          Nova Empresa
        </button>
      </div>

      {isCreating && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold mb-4">Nova Empresa</h4>
          <form onSubmit={handleCreateCompany}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-purple-800 mb-1">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  name="tradeName"
                  value={formData.tradeName}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-800 mb-1">
                  Razão Social
                </label>
                <input
                  type="text"
                  name="legalName"
                  value={formData.legalName}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-purple-800 mb-1">
                  CNPJ
                </label>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  placeholder="00.000.000/0001-00"
                  required
                />
                {formData.cnpj && !isValidCNPJ(formData.cnpj) && (
                  <p className="text-red-500 text-xs mt-1">
                    CNPJ deve ter exatamente 14 dígitos
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeForms}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                disabled={!isValidCNPJ(formData.cnpj)}
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {editingCompany && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold mb-4">Editar Empresa</h4>
          <form onSubmit={handleUpdateCompany}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-purple-800 mb-1">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  name="tradeName"
                  value={formData.tradeName}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-800 mb-1">
                  Razão Social
                </label>
                <input
                  type="text"
                  name="legalName"
                  value={formData.legalName}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-purple-800 mb-1">
                  CNPJ
                </label>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  placeholder="00.000.000/0001-00"
                  required
                />
                {formData.cnpj && !isValidCNPJ(formData.cnpj) && (
                  <p className="text-red-500 text-xs mt-1">
                    CNPJ deve ter exatamente 14 dígitos
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeForms}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                disabled={!isValidCNPJ(formData.cnpj)}
              >
                Atualizar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          {companies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma empresa cadastrada</p>
              <button
                className="mt-4 text-blue-600 hover:text-blue-800"
                onClick={openCreateForm}
              >
                Cadastrar primeira empresa
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome Fantasia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Razão Social
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CNPJ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {companies.map((company) => (
                    <tr key={company._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {company.tradeName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {company.legalName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatCNPJ(company.cnpj)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={() => openEditForm(company)}
                        >
                          Editar
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteCompany(company._id)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}