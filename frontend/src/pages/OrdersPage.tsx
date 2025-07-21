import { useState, useEffect } from "react";
import API_URL, { authHeaders } from '../services/api';

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
  date: string;
  status: string;
  total: number;
  observation: string;
}

interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
}

export default function OrdersPage({ token }: { token: string }) {
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
          headers: authHeaders(token),
        });

        if (!response.ok) throw new Error("Erro ao carregar pedidos");
        const data: Order[] = await response.json();
        setOrders(data);
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
        headers: authHeaders(token),
      });

      if (!response.ok) throw new Error("Erro ao carregar itens do pedido");
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
      for (const item of orderItems) {
        await fetch(`${API_URL}/order-products/${item._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(token),
          },
          body: JSON.stringify({ quantity: item.quantity }),
        });
      }

      const response = await fetch(`${API_URL}/orders/${editingOrder._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(token),
        },
        body: JSON.stringify({
          observation: editingOrder.observation,
          status: editingOrder.status,
        }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar pedido");
      
      const updatedData = await response.json();
      setOrders(
        orders.map((order) =>
          order._id === editingOrder._id ? updatedData : order
        )
      );

      setIsEditModalOpen(false);
      alert("Pedido atualizado com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este pedido?")) return;

    try {
      await fetch(`${API_URL}/order-products/delete-by-order/${orderId}`, {
        method: "DELETE",
        headers: authHeaders(token),
      });

      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: "DELETE",
        headers: authHeaders(token),
      });

      if (!response.ok) throw new Error("Erro ao excluir pedido");
      setOrders(orders.filter((order) => order._id !== orderId));
      alert("Pedido excluído com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro");
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

  if (loading) return <div className="text-center py-8">Carregando pedidos...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

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
                  const orderDate = order.date ? new Date(order.date) : new Date();
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
                <p className="font-medium">{editingOrder.customer.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa
                </label>
                <p className="font-medium">{editingOrder.company.tradeName}</p>
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
                    {orderItems.map((item) => (
                      <tr key={item._id}>
                        <td className="py-3">{item.product.name}</td>
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
                          R$ {item.product.price.toFixed(2)}
                        </td>
                        <td className="py-3">
                          R$ {(item.product.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
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
}