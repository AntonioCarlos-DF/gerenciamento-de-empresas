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
}

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  company: string;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
}

interface Order {
  _id: string;
  number: string;
  customer: Customer;
  company: Company;
  observation: string;
  date: Date;
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
        <div className="w-64 bg-gray-800 text-white flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h1 className="text-xl font-bold">Sistema de Gestão</h1>
            {user && (
              <p className="text-sm text-gray-300 mt-1">Olá, {user.name}</p>
            )}
          </div>

          <nav className="flex-1 py-4">
            <ul className="space-y-1">
              <li>
                <button
                  className={`flex items-center w-full p-4 hover:bg-gray-700 ${
                    activeTab === "empresas" ? "bg-gray-700" : ""
                  }`}
                  onClick={() => setActiveTab("empresas")}
                >
                  <BuildingOfficeIcon className="h-5 w-5 mr-3" />
                  Empresas
                </button>
              </li>
              <li>
                <button
                  className={`flex items-center w-full p-4 hover:bg-gray-700 ${
                    activeTab === "produtos" ? "bg-gray-700" : ""
                  }`}
                  onClick={() => setActiveTab("produtos")}
                >
                  <CubeIcon className="h-5 w-5 mr-3" />
                  Produtos
                </button>
              </li>
              <li>
                <button
                  className={`flex items-center w-full p-4 hover:bg-gray-700 ${
                    activeTab === "clientes" ? "bg-gray-700" : ""
                  }`}
                  onClick={() => setActiveTab("clientes")}
                >
                  <UserGroupIcon className="h-5 w-5 mr-3" />
                  Clientes
                </button>
              </li>
              <li>
                <button
                  className={`flex items-center w-full p-4 hover:bg-gray-700 ${
                    activeTab === "novo-pedido" ? "bg-gray-700" : ""
                  }`}
                  onClick={() => setActiveTab("novo-pedido")}
                >
                  <ShoppingCartIcon className="h-5 w-5 mr-3" />
                  Novo Pedido
                </button>
              </li>
              <li>
                <button
                  className={`flex items-center w-full p-4 hover:bg-gray-700 ${
                    activeTab === "pedidos" ? "bg-gray-700" : ""
                  }`}
                  onClick={() => setActiveTab("pedidos")}
                >
                  <ClipboardDocumentListIcon className="h-5 w-5 mr-3" />
                  Pedidos
                </button>
              </li>
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-700">
            <button
              className="flex items-center w-full p-2 hover:bg-gray-700 rounded"
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
                className="mr-4 text-gray-500 hover:text-gray-700"
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

  useEffect(() => {
    const fetchCompanies = async () => {
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

    fetchCompanies();
  }, [token]);

  const handleCreateCompany = async () => {
    const newCompany = {
      tradeName: "Nova Empresa",
      legalName: "Nova Empresa LTDA",
      cnpj: "00.000.000/0001-00",
    };

    try {
      const response = await fetch(`${API_URL}/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCompany),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar empresa");
      }

      const createdCompany = await response.json();
      setCompanies([...companies, createdCompany]);
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
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
          onClick={handleCreateCompany}
        >
          Nova Empresa
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
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
                      {company.cnpj}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Editar
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

  useEffect(() => {
    const fetchData = async () => {
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

    fetchData();
  }, [token]);

  const handleCreateProduct = async () => {
    if (companies.length === 0) return;

    const newProduct = {
      name: "Novo Produto",
      price: 100.0,
      description: "Descrição do novo produto",
      companyId: companies[0]._id,
    };

    try {
      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar produto");
      }

      const createdProduct = await response.json();
      setProducts([...products, createdProduct]);
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
          onClick={handleCreateProduct}
        >
          Novo Produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const company = companies.find((c) => c._id === product.company);
          return (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between">
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    R$ {product.price.toFixed(2)}
                  </span>
                </div>
                <p className="mt-2 text-gray-600">{product.description}</p>
                <p className="mt-2 text-sm text-gray-500">
                  Empresa: {company ? company.tradeName : "Não encontrada"}
                </p>
                <div className="mt-4 flex">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                    Editar
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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

  useEffect(() => {
    const fetchData = async () => {
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

    fetchData();
  }, [token]);

  const handleCreateCustomer = async () => {
    if (companies.length === 0) return;

    const newCustomer = {
      name: "Novo Cliente",
      email: "cliente@exemplo.com",
      phone: "(11) 99999-9999",
      companyId: companies[0]._id,
    };

    try {
      const response = await fetch(`${API_URL}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCustomer),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar cliente");
      }

      const createdCustomer = await response.json();
      setCustomers([...customers, createdCustomer]);
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
          onClick={handleCreateCustomer}
        >
          Novo Cliente
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
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
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Editar
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
      // Criar o pedido
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_URL}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao carregar pedidos");
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocorreu um erro");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

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
                  const orderDate = new Date(order.date);
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
                        R$ {order.total.toFixed(2)}
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
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Detalhes
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Cancelar
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

          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Mostrando {filteredOrders.length} de {orders.length} registros
            </div>
            <div className="flex space-x-2">
              <button className="border rounded p-2">Anterior</button>
              <button className="border rounded p-2">Próximo</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
