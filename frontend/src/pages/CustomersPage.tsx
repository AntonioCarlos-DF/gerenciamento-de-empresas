import { useState, useEffect } from "react";
import API_URL, { authHeaders } from '../services/api';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
}

interface Company {
  _id: string;
  tradeName: string;
}

export default function CustomersPage({ token }: { token: string }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyId: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [customersRes, companiesRes] = await Promise.all([
        fetch(`${API_URL}/customers`, { headers: authHeaders(token) }),
        fetch(`${API_URL}/companies`, { headers: authHeaders(token) }),
      ]);

      if (!customersRes.ok || !companiesRes.ok) {
        throw new Error("Erro ao carregar dados");
      }

      const [customersData, companiesData] = await Promise.all([
        customersRes.json(),
        companiesRes.json(),
      ]);

      setCustomers(customersData);
      setCompanies(companiesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openCreateForm = () => {
    setIsCreating(true);
    setFormData({
      name: "",
      email: "",
      phone: "",
      companyId: companies[0]?._id || "",
    });
  };

  const openEditForm = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      companyId: customer.company,
    });
  };

  const closeForms = () => {
    setIsCreating(false);
    setEditingCustomer(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Nome do cliente é obrigatório");
      return false;
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("E-mail inválido");
      return false;
    }

    if (!formData.companyId) {
      setError("Selecione uma empresa");
      return false;
    }

    return true;
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const newCustomer = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        companyId: formData.companyId,
      };

      const response = await fetch(`${API_URL}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(token),
        },
        body: JSON.stringify(newCustomer),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar cliente");
      }

      const createdCustomer = await response.json();
      setCustomers([...customers, createdCustomer]);
      closeForms();
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingCustomer) return;
    if (!validateForm()) return;

    try {
      const updatedCustomer = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        companyId: formData.companyId,
      };

      const response = await fetch(
        `${API_URL}/customers/${editingCustomer._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(token),
          },
          body: JSON.stringify(updatedCustomer),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar cliente");
      }

      const updatedData = await response.json();
      setCustomers(
        customers.map((c) =>
          c._id === editingCustomer._id ? updatedData : c
        )
      );
      closeForms();
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este cliente?")) return;

    try {
      const response = await fetch(`${API_URL}/customers/${customerId}`, {
        method: "DELETE",
        headers: authHeaders(token),
      });

      if (!response.ok) throw new Error("Erro ao excluir cliente");
      setCustomers(customers.filter((c) => c._id !== customerId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro");
    }
  };

  if (loading) return <div className="text-center py-8">Carregando clientes...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Gerenciamento de Clientes</h3>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
          onClick={openCreateForm}
        >
          Novo Cliente
        </button>
      </div>

      {isCreating && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold mb-4">Novo Cliente</h4>
          <form onSubmit={handleCreateCustomer}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-purple-800 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-800 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-800 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-purple-800 mb-1">
                  Empresa
                </label>
                <select
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                >
                  {companies.map((company) => (
                    <option key={company._id} value={company._id}>
                      {company.tradeName}
                    </option>
                  ))}
                </select>
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
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {editingCustomer && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold mb-4">Editar Cliente</h4>
          <form onSubmit={handleUpdateCustomer}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-purple-800 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-800 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-800 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-purple-800 mb-1">
                  Empresa
                </label>
                <select
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                >
                  {companies.map((company) => (
                    <option key={company._id} value={company._id}>
                      {company.tradeName}
                    </option>
                  ))}
                </select>
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
              >
                Atualizar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          {customers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum cliente cadastrado</p>
              <button
                className="mt-4 text-blue-600 hover:text-blue-800"
                onClick={openCreateForm}
              >
                Cadastrar primeiro cliente
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => {
                    const company = companies.find(
                      (c) => c._id === customer.company
                    );
                    return (
                      <tr key={customer._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {customer.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {customer.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {customer.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {company ? company.tradeName : "Não encontrada"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            onClick={() => openEditForm(customer)}
                          >
                            Editar
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteCustomer(customer._id)}
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}