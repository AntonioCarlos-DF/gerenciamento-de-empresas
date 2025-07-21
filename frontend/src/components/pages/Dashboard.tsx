import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BuildingOfficeIcon,
  CubeIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

// Configuração da API
const API_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}:${
      import.meta.env.VITE_API_BASE_PORT
    }/api`
  : "http://localhost:3000/api";

// Interface para os tipos de dados
interface User {
  _id: string;
  name: string;
  email: string;
}

interface Company {
  _id: string;
  tradeName: string;
  legalName: string;
  cnpj: string;
  userId: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  company: string;
  userId: string;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  userId: string;
}

interface Order {
  _id: string;
  number: string;
  customer: {
    _id: string;
    name: string;
  };
  company: {
    _id: string;
    tradeName: string;
  };
  observation: string;
  date: string;
  status: string;
  total: number;
}

interface OrderItem {
  _id: string;
  product: Product;
  quantity: number;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("empresas");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null); // Adicione este estado

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    try {
      setUser(JSON.parse(userData));
      setToken(token); // Armazene o token
    } catch (e) {
      console.error("Erro ao analisar dados do usuário", e);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Função para renderizar o conteúdo com base na aba ativa
  const renderContent = () => {
    if (loading) {
      return <div className="text-center py-8">Carregando...</div>;
    }

    if (!user) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Acesso não autorizado</h2>
            <p>Por favor, faça login para acessar o sistema</p>
          </div>
        </div>
      );
    }

    if (!token) {
      return <div>Token não disponível</div>;
    }

    switch (activeTab) {
      case "empresas":
        return <CompaniesPage token={token} />; // Passe o token
      case "produtos":
        return <ProductsPage token={token} />; // Passe o token
      case "clientes":
        return <CustomersPage token={token} />; // Passe o token
      case "pedidos":
        return <OrdersPage token={token} />; // Passe o token
      case "novo-pedido":
        return <NewOrderPage token={token} />; // Passe o token
      default:
        return <CompaniesPage token={token} />; // Passe o token
    }
  };

  // Função para fazer logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 bg-purple-600 text-white flex flex-col">
          <div className="p-4 border-b border-purple-600">
            <h1 className="text-xl font-bold">Sistema de Gestão</h1>
            {user && (
              <p className="text-sm text-gray-300 mt-1">Olá, {user.name}</p>
            )}
          </div>

          <nav className="flex-1 py-4">
            <ul className="space-y-1">
              <li>
                <button
                  className={`flex items-center w-full p-4 hover:bg-purple-800 ${
                    activeTab === "empresas" ? "bg-purple-800" : ""
                  }`}
                  onClick={() => setActiveTab("empresas")}
                >
                  <BuildingOfficeIcon className="h-5 w-5 mr-3" />
                  Empresas
                </button>
              </li>
              <li>
                <button
                  className={`flex items-center w-full p-4 hover:bg-purple-800 ${
                    activeTab === "produtos" ? "bg-purple-800" : ""
                  }`}
                  onClick={() => setActiveTab("produtos")}
                >
                  <CubeIcon className="h-5 w-5 mr-3" />
                  Produtos
                </button>
              </li>
              <li>
                <button
                  className={`flex items-center w-full p-4 hover:bg-purple-800 ${
                    activeTab === "clientes" ? "bg-purple-800" : ""
                  }`}
                  onClick={() => setActiveTab("clientes")}
                >
                  <UserGroupIcon className="h-5 w-5 mr-3" />
                  Clientes
                </button>
              </li>
              <li>
                <button
                  className={`flex items-center w-full p-4 hover:bg-purple-800 ${
                    activeTab === "novo-pedido" ? "bg-purple-800" : ""
                  }`}
                  onClick={() => setActiveTab("novo-pedido")}
                >
                  <ShoppingCartIcon className="h-5 w-5 mr-3" />
                  Novo Pedido
                </button>
              </li>
              <li>
                <button
                  className={`flex items-center w-full p-4 hover:bg-purple-800 ${
                    activeTab === "pedidos" ? "bg-purple-800" : ""
                  }`}
                  onClick={() => setActiveTab("pedidos")}
                >
                  <ClipboardDocumentListIcon className="h-5 w-5 mr-3" />
                  Pedidos
                </button>
              </li>
            </ul>
          </nav>

          <div className="p-4 border-t border-purple-800">
            <button
              className="flex items-center w-full p-2 hover:bg-purple-800 rounded"
              onClick={handleLogout}
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
              Sair do Sistema
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button
                className="mr-4 text-gray-500 hover:text-purple-800"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {/* Ícone de menu */}
              </button>
              <h2 className="text-lg font-semibold text-gray-800 capitalize">
                {activeTab === "novo-pedido" ? "Novo Pedido" : activeTab}
              </h2>
            </div>
            <div className="flex items-center">
              {user && (
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

// Componente para gerenciamento de empresas
const CompaniesPage = ({ token }: { token: string }) => {
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

  // Buscar empresas
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/companies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  // Função para formatar CNPJ
  const formatCNPJ = (value: string): string => {
    // Remove tudo que não é dígito
    const cleaned = value.replace(/\D/g, "");

    // Limita a 14 caracteres
    const limited = cleaned.substring(0, 14);

    // Aplica a formatação
    return limited
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  };

  // Valida se o CNPJ tem 14 dígitos numéricos
  const isValidCNPJ = (cnpj: string): boolean => {
    const cleaned = cnpj.replace(/\D/g, "");
    return cleaned.length === 14;
  };

  // Atualizar formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Formatação especial para CNPJ
    if (name === "cnpj") {
      const formatted = formatCNPJ(value);
      setFormData({
        ...formData,
        [name]: formatted,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Abrir formulário de criação
  const openCreateForm = () => {
    setIsCreating(true);
    setFormData({
      tradeName: "",
      legalName: "",
      cnpj: "",
    });
  };

  // Abrir formulário de edição
  const openEditForm = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      tradeName: company.tradeName,
      legalName: company.legalName,
      cnpj: formatCNPJ(company.cnpj),
    });
  };

  // Fechar formulários
  const closeForms = () => {
    setIsCreating(false);
    setEditingCompany(null);
  };

  // Criar nova empresa
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();

    // Valida CNPJ
    if (!isValidCNPJ(formData.cnpj)) {
      setError("CNPJ deve ter 14 dígitos");
      return;
    }

    try {
      // Remove formatação do CNPJ para envio
      const cnpjToSend = formData.cnpj.replace(/\D/g, "");

      const response = await fetch(`${API_URL}/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

  // Atualizar empresa existente
  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingCompany) return;

    // Valida CNPJ
    if (!isValidCNPJ(formData.cnpj)) {
      setError("CNPJ deve ter 14 dígitos");
      return;
    }

    try {
      // Remove formatação do CNPJ para envio
      const cnpjToSend = formData.cnpj.replace(/\D/g, "");

      const response = await fetch(
        `${API_URL}/companies/${editingCompany._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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

  // Excluir empresa
  const handleDeleteCompany = async (companyId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta empresa?")) return;

    try {
      const response = await fetch(`${API_URL}/companies/${companyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir empresa");
      }

      setCompanies(companies.filter((c) => c._id !== companyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando empresas...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

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

      {/* Formulário de criação */}
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

      {/* Formulário de edição */}
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

      {/* Lista de empresas */}
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
};

// Componente para gerenciamento de produtos
const ProductsPage = ({ token }: { token: string }) => {
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

  // Buscar produtos e empresas
  const fetchData = async () => {
    setLoading(true);
    try {
      // Buscar produtos
      const productsResponse = await fetch(`${API_URL}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!productsResponse.ok) {
        throw new Error("Erro ao carregar produtos");
      }

      const productsData = await productsResponse.json();
      setProducts(productsData);

      // Buscar empresas
      const companiesResponse = await fetch(`${API_URL}/companies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!companiesResponse.ok) {
        throw new Error("Erro ao carregar empresas");
      }

      const companiesData = await companiesResponse.json();
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

  // Atualizar formulário
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Abrir formulário de criação
  const openCreateForm = () => {
    setIsCreating(true);
    setFormData({
      name: "",
      price: "",
      description: "",
      companyId: companies.length > 0 ? companies[0]._id : "",
    });
  };

  // Abrir formulário de edição
  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      companyId: product.company,
    });
  };

  // Fechar formulários
  const closeForms = () => {
    setIsCreating(false);
    setEditingProduct(null);
  };

  // Validar formulário
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

  // Criar novo produto
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const newProduct = {
        name: formData.name,
        price: formData.price,
        description: formData.description,
        company: formData.companyId, // Campo deve ser "company"
      };

      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || errorData.error || "Erro ao criar produto"
        );
      }

      const createdProduct = await response.json();
      setProducts([...products, createdProduct]);
      closeForms();
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao criar produto");
    }
  };

  // Atualizar produto existente
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProduct) return;

    if (!validateForm()) return;

    try {
      const updatedProduct = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        company: formData.companyId, // Use "company" em vez de "companyId" se necessário
      };

      const response = await fetch(
        `${API_URL}/products/${editingProduct._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedProduct),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || errorData.error || "Erro ao atualizar produto"
        );
      }

      const updatedData = await response.json();

      // Garanta que o objeto atualizado tenha um _id
      if (!updatedData._id) {
        updatedData._id = editingProduct._id;
      }

      // Atualize o estado corretamente
      setProducts(
        products.map((p) => (p._id === editingProduct._id ? updatedData : p))
      );

      closeForms();
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao atualizar produto");
    }
  };

  // Excluir produto
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir produto");
      }

      setProducts(products.filter((p) => p._id !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando produtos...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

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

      {/* Formulário de criação */}
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

      {/* Formulário de edição */}
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

      {/* Lista de produtos */}
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
                          {/* CORREÇÃO: Verificar se price existe antes de formatar */}
                          R${" "}
                          {typeof product.price === "number"
                            ? product.price.toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-600 line-clamp-2">
                        {product.description || "Sem descrição"}
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        Empresa:{" "}
                        {company ? company.tradeName : "Não encontrada"}
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
};

// Componente para gerenciamento de clientes
const CustomersPage = ({ token }: { token: string }) => {
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

  // Buscar clientes e empresas
  const fetchData = async () => {
    setLoading(true);
    try {
      // Buscar clientes
      const customersResponse = await fetch(`${API_URL}/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!customersResponse.ok) {
        throw new Error("Erro ao carregar clientes");
      }

      const customersData = await customersResponse.json();
      setCustomers(customersData);

      // Buscar empresas
      const companiesResponse = await fetch(`${API_URL}/companies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!companiesResponse.ok) {
        throw new Error("Erro ao carregar empresas");
      }

      const companiesData = await companiesResponse.json();
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

  // Atualizar formulário
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Abrir formulário de criação
  const openCreateForm = () => {
    setIsCreating(true);
    setFormData({
      name: "",
      email: "",
      phone: "",
      companyId: companies.length > 0 ? companies[0]._id : "",
    });
  };

  // Abrir formulário de edição
  const openEditForm = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      companyId: customer.company,
    });
  };

  // Fechar formulários
  const closeForms = () => {
    setIsCreating(false);
    setEditingCustomer(null);
  };

  // Validar formulário
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

  // Criar novo cliente
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
          Authorization: `Bearer ${token}`,
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

  // Atualizar cliente existente
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
            Authorization: `Bearer ${token}`,
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
          c._id === editingCustomer._id ? { ...c, ...updatedData } : c
        )
      );
      closeForms();
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    }
  };

  // Excluir cliente
  const handleDeleteCustomer = async (customerId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este cliente?")) return;

    try {
      const response = await fetch(`${API_URL}/customers/${customerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir cliente");
      }

      setCustomers(customers.filter((c) => c._id !== customerId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando clientes...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

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

      {/* Formulário de criação */}
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

      {/* Formulário de edição */}
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

      {/* Lista de clientes */}
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
};

// Componente para criação de novos pedidos
const NewOrderPage = ({ token }: { token: string }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [observation, setObservation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar produtos
        const productsResponse = await fetch(`${API_URL}/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!productsResponse.ok) throw new Error("Erro ao carregar produtos");
        const productsData = await productsResponse.json();
        setProducts(productsData);

        // Buscar clientes
        const customersResponse = await fetch(`${API_URL}/customers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!customersResponse.ok) throw new Error("Erro ao carregar clientes");
        const customersData = await customersResponse.json();
        setCustomers(customersData);

        // Buscar empresas
        const companiesResponse = await fetch(`${API_URL}/companies`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!companiesResponse.ok) throw new Error("Erro ao carregar empresas");
        const companiesData = await companiesResponse.json();
        setCompanies(companiesData);

        // Selecionar primeiro cliente e empresa por padrão
        if (customersData.length > 0) setSelectedCustomer(customersData[0]._id);
        if (companiesData.length > 0) setSelectedCompany(companiesData[0]._id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocorreu um erro");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product._id === product._id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          _id: Math.random().toString(36).substr(2, 9),
          product,
          quantity: 1,
        },
      ]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;

    setCart(
      cart.map((item) => (item._id === id ? { ...item, quantity } : item))
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  };

  const handleSubmitOrder = async () => {
    if (!selectedCustomer || !selectedCompany || cart.length === 0) {
      setError("Preencha todos os campos e adicione produtos ao pedido");
      return;
    }

    try {
      // Calcular o total
      const total = cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      // Criar o pedido COM O TOTAL
      const orderResponse = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          number: `PED-${Date.now()}`,
          customerId: selectedCustomer,
          companyId: selectedCompany,
          observation,
          total, // Adicionar o total aqui
        }),
      });

      if (!orderResponse.ok) throw new Error("Erro ao criar pedido");
      const orderData = await orderResponse.json();

      // Adicionar itens ao pedido
      for (const item of cart) {
        await fetch(`${API_URL}/order-products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: orderData._id,
            productId: item.product._id,
            quantity: item.quantity,
          }),
        });
      }

      // Limpar carrinho e exibir mensagem de sucesso
      setCart([]);
      setError("");
      alert("Pedido criado com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando dados...</div>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Novo Pedido</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h4 className="font-medium text-lg mb-4">Produtos</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="border rounded-lg p-4 flex items-center"
                >
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mr-4" />
                  <div className="flex-1">
                    <h5 className="font-medium">{product.name}</h5>
                    <p className="text-gray-600 text-sm">
                      R$ {product.price.toFixed(2)}
                    </p>
                  </div>
                  <button
                    className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
                    onClick={() => addToCart(product)}
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h4 className="font-medium text-lg mb-4">Itens do Pedido</h4>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhum item adicionado ao pedido
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2">Produto</th>
                      <th className="text-left py-2">Quantidade</th>
                      <th className="text-left py-2">Preço</th>
                      <th className="text-left py-2">Total</th>
                      <th className="text-left py-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item._id}>
                        <td className="py-3">{item.product.name}</td>
                        <td className="py-3">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item._id, parseInt(e.target.value))
                            }
                            className="w-16 border rounded p-1"
                          />
                        </td>
                        <td className="py-3">
                          R$ {item.product.price.toFixed(2)}
                        </td>
                        <td className="py-3">
                          R$ {(item.product.price * item.quantity).toFixed(2)}
                        </td>
                        <td className="py-3">
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => removeFromCart(item._id)}
                          >
                            Remover
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

        <div>
          <div className="bg-white shadow rounded-lg p-6 sticky top-6">
            <h4 className="font-medium text-lg mb-4">Resumo do Pedido</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-800 mb-1">
                  Cliente
                </label>
                <select
                  className="w-full border rounded p-2"
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                >
                  <option value="">Selecione um cliente</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-800 mb-1">
                  Empresa
                </label>
                <select
                  className="w-full border rounded p-2"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                >
                  <option value="">Selecione uma empresa</option>
                  {companies.map((company) => (
                    <option key={company._id} value={company._id}>
                      {company.tradeName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-800 mb-1">
                  Observações
                </label>
                <textarea
                  className="w-full border rounded p-2"
                  rows={3}
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                ></textarea>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>R$ {calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Desconto:</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>R$ {calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <button
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg mt-4"
                onClick={handleSubmitOrder}
                disabled={cart.length === 0}
              >
                Finalizar Pedido
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para gerenciamento de pedidos
const OrdersPage = ({ token }: { token: string }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_URL}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Erro ao carregar pedidos");

        const data: any[] = await response.json(); // Temporariamente 'any'

        // Tipagem explícita com fallbacks
        const ordersWithTotal: Order[] = data.map((item: any) => ({
          _id: item._id || "",
          number: item.number || `PED-${Date.now()}`,
          total: typeof item.total === "number" ? item.total : 0,
          customer: item.customer || {
            _id: "",
            name: "Cliente não disponível",
          },
          company: item.company || {
            _id: "",
            tradeName: "Empresa não disponível",
          },
          date: item.date || new Date().toISOString(),
          status: item.status || "pendente",
          observation: item.observation || "",
        }));

        setOrders(ordersWithTotal);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocorreu um erro");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const fetchOrderItems = async (orderId: string) => {
    try {
      setItemsLoading(true);
      const response = await fetch(`${API_URL}/order-products/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar itens do pedido");
      }

      const data = await response.json();
      setOrderItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro");
    } finally {
      setItemsLoading(false);
    }
  };

  const handleEditOrder = async (order: Order) => {
    setEditingOrder(order);
    await fetchOrderItems(order._id);
    setIsEditModalOpen(true);
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder) return;

    try {
      // Atualizar itens do pedido
      for (const item of orderItems) {
        await fetch(`${API_URL}/order-products/${item._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity: item.quantity,
          }),
        });
      }

      // Atualizar informações do pedido
      const response = await fetch(`${API_URL}/orders/${editingOrder._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          observation: editingOrder.observation,
          status: editingOrder.status,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar pedido");
      }

      // Atualizar lista de pedidos
      setOrders(
        orders.map((order) =>
          order._id === editingOrder._id ? editingOrder : order
        )
      );

      setIsEditModalOpen(false);
      setError("");
      alert("Pedido atualizado com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este pedido?")) {
      try {
        // Deletar itens do pedido primeiro
        await fetch(`${API_URL}/order-products/delete-by-order/${orderId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Deletar o pedido
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao excluir pedido");
        }

        // Atualizar lista de pedidos
        setOrders(orders.filter((order) => order._id !== orderId));
        setError("");
        alert("Pedido excluído com sucesso!");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocorreu um erro");
      }
    }
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setOrderItems(
      orderItems.map((item) =>
        item._id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? order.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="text-center py-8">Carregando pedidos...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Gerenciamento de Pedidos</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Buscar pedido..."
            className="border rounded p-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border rounded p-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="processando">Processando</option>
            <option value="enviado">Enviado</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  // Verificação de segurança para order.date
                  const orderDate = order?.date
                    ? new Date(order.date)
                    : new Date();

                  const formattedDate = orderDate.toLocaleDateString("pt-BR");

                  return (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.customer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formattedDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order?.total
                          ? `R$ ${order.total.toFixed(2)}`
                          : "R$ 0,00"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            order.status === "pendente"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "entregue"
                              ? "bg-green-100 text-green-800"
                              : order.status === "cancelado"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={() => handleEditOrder(order)}
                        >
                          Editar
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteOrder(order._id)}
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

          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum pedido encontrado
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      {isEditModalOpen && editingOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h4 className="text-lg font-bold mb-4">
              Editar Pedido #{editingOrder.number}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                <p className="font-medium">
                  {editingOrder.customer?.name || "Cliente não disponível"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa
                </label>
                <p className="font-medium">
                  {editingOrder.company?.tradeName || "Empresa não disponível"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="w-full border rounded p-2"
                  value={editingOrder.status}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="pendente">Pendente</option>
                  <option value="processando">Processando</option>
                  <option value="enviado">Enviado</option>
                  <option value="entregue">Entregue</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  className="w-full border rounded p-2"
                  rows={2}
                  value={editingOrder.observation || ""}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      observation: e.target.value,
                    })
                  }
                ></textarea>
              </div>
            </div>

            <h5 className="font-medium text-lg mb-4">Itens do Pedido</h5>

            {itemsLoading ? (
              <div className="text-center py-4">Carregando itens...</div>
            ) : (
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2">Produto</th>
                      <th className="text-left py-2">Quantidade</th>
                      <th className="text-left py-2">Preço Unitário</th>
                      <th className="text-left py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item) => {
                      // Verificação de segurança para item.product
                      const product = item.product || {
                        name: "Produto não disponível",
                        price: 0,
                      };

                      return (
                        <tr key={item._id}>
                          <td className="py-3">{product.name}</td>
                          <td className="py-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItemQuantity(
                                  item._id,
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-16 border rounded p-1"
                            />
                          </td>
                          <td className="py-3">
                            R$ {product.price.toFixed(2)}
                          </td>
                          <td className="py-3">
                            R$ {(product.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                onClick={handleUpdateOrder}
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
