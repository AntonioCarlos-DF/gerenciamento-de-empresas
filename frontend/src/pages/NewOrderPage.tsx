import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_URL, { authHeaders } from '../services/api';

interface Product {
  _id: string;
  name: string;
  price: number;
}

interface Customer {
  _id: string;
  name: string;
}

interface Company {
  _id: string;
  tradeName: string;
}

interface OrderItem {
  _id: string;
  product: Product;
  quantity: number;
}

export default function NewOrderPage({ token }: { token: string }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [observation, setObservation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, customersRes, companiesRes] = await Promise.all([
          fetch(`${API_URL}/products`, { headers: authHeaders(token) }),
          fetch(`${API_URL}/customers`, { headers: authHeaders(token) }),
          fetch(`${API_URL}/companies`, { headers: authHeaders(token) }),
        ]);

        if (!productsRes.ok || !customersRes.ok || !companiesRes.ok) {
          throw new Error("Erro ao carregar dados");
        }

        const [productsData, customersData, companiesData] = await Promise.all([
          productsRes.json(),
          customersRes.json(),
          companiesRes.json(),
        ]);

        setProducts(productsData);
        setCustomers(customersData);
        setCompanies(companiesData);
        
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
      const total = calculateTotal();
      const orderResponse = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(token),
        },
        body: JSON.stringify({
          number: `PED-${Date.now()}`,
          customerId: selectedCustomer,
          companyId: selectedCompany,
          observation,
          total,
        }),
      });

      if (!orderResponse.ok) throw new Error("Erro ao criar pedido");
      const orderData = await orderResponse.json();

      for (const item of cart) {
        await fetch(`${API_URL}/order-products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(token),
          },
          body: JSON.stringify({
            orderId: orderData._id,
            productId: item.product._id,
            quantity: item.quantity,
          }),
        });
      }

      setCart([]);
      setError("");
      alert("Pedido criado com sucesso!");
      navigate('/dashboard?tab=pedidos');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro");
    }
  };

  if (loading) return <div className="text-center py-8">Carregando dados...</div>;

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
}