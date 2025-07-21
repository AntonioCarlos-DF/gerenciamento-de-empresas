import { useState, useEffect } from "react";
import API_URL, { authHeaders } from '../services/api';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  company: string;
}

interface Company {
  _id: string;
  tradeName: string;
}

export default function ProductsPage({ token }: { token: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    companyId: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, companiesRes] = await Promise.all([
        fetch(`${API_URL}/products`, { headers: authHeaders(token) }),
        fetch(`${API_URL}/companies`, { headers: authHeaders(token) }),
      ]);

      if (!productsRes.ok || !companiesRes.ok) {
        throw new Error("Erro ao carregar dados");
      }

      const [productsData, companiesData] = await Promise.all([
        productsRes.json(),
        companiesRes.json(),
      ]);

      setProducts(productsData);
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openCreateForm = () => {
    setIsCreating(true);
    setFormData({
      name: "",
      price: "",
      description: "",
      companyId: companies[0]?._id || "",
    });
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      companyId: product.company,
    });
  };

  const closeForms = () => {
    setIsCreating(false);
    setEditingProduct(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Nome do produto é obrigatório");
      return false;
    }

    if (
      !formData.price ||
      isNaN(parseFloat(formData.price)) ||
      parseFloat(formData.price) <= 0
    ) {
      setError("Preço deve ser um número positivo");
      return false;
    }

    if (!formData.companyId) {
      setError("Selecione uma empresa");
      return false;
    }

    return true;
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const newProduct = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        company: formData.companyId,
      };

      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(token),
        },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar produto");
      }

      const createdProduct = await response.json();
      setProducts([...products, createdProduct]);
      closeForms();
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao criar produto");
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProduct) return;
    if (!validateForm()) return;

    try {
      const updatedProduct = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        company: formData.companyId,
      };

      const response = await fetch(
        `${API_URL}/products/${editingProduct._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(token),
          },
          body: JSON.stringify(updatedProduct),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar produto");
      }

      const updatedData = await response.json();
      setProducts(
        products.map((p) =>
          p._id === editingProduct._id ? updatedData : p
        )
      );
      closeForms();
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao atualizar produto");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
        headers: authHeaders(token),
      });

      if (!response.ok) throw new Error("Erro ao excluir produto");
      setProducts(products.filter((p) => p._id !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro");
    }
  };

  if (loading) return <div className="text-center py-8">Carregando produtos...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Gerenciamento de Produtos</h3>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
          onClick={openCreateForm}
        >
          Novo Produto
        </button>
      </div>

      {isCreating && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold mb-4">Novo Produto</h4>
          <form onSubmit={handleCreateProduct}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-purple-800 mb-1">
                  Nome do Produto
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
                  Preço (R$)
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              <div>
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-purple-800 mb-1">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  rows={3}
                ></textarea>
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

      {editingProduct && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold mb-4">Editar Produto</h4>
          <form onSubmit={handleUpdateProduct}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-purple-800 mb-1">
                  Nome do Produto
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
                  Preço (R$)
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              <div>
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-purple-800 mb-1">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  rows={3}
                ></textarea>
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
          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum produto cadastrado</p>
              <button
                className="mt-4 text-blue-600 hover:text-blue-800"
                onClick={openCreateForm}
              >
                Cadastrar primeiro produto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const company = companies.find(
                  (c) => c._id === product.company
                );
                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg shadow overflow-hidden border border-gray-200"
                  >
                    <div className="p-6">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-gray-900">
                          {product.name}
                        </h4>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          R$ {product.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-600 line-clamp-2">
                        {product.description || "Sem descrição"}
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        Empresa: {company ? company.tradeName : "Não encontrada"}
                      </p>
                      <div className="mt-4 flex">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={() => openEditForm(product)}
                        >
                          Editar
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}