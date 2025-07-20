import { useState } from 'react';
import { 
  BuildingOfficeIcon, 
  CubeIcon, 
  UserGroupIcon, 
  ShoppingCartIcon, 
  ClipboardDocumentListIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('empresas');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Função para renderizar o conteúdo com base na aba ativa
  const renderContent = () => {
    switch(activeTab) {
      case 'empresas':
        return <CompaniesPage />;
      case 'produtos':
        return <ProductsPage />;
      case 'clientes':
        return <CustomersPage />;
      case 'pedidos':
        return <OrdersPage />;
      case 'novo-pedido':
        return <NewOrderPage />;
      default:
        return <CompaniesPage />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 bg-gray-800 text-white flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h1 className="text-xl font-bold">Sistema de Gestão</h1>
          </div>
          
          <nav className="flex-1 py-4">
            <ul className="space-y-1">
              <li>
                <button 
                  className={`flex items-center w-full p-4 hover:bg-gray-700 ${activeTab === 'empresas' ? 'bg-gray-700' : ''}`}
                  onClick={() => setActiveTab('empresas')}
                >
                  <BuildingOfficeIcon className="h-5 w-5 mr-3" />
                  Empresas
                </button>
              </li>
              <li>
                <button 
                  className={`flex items-center w-full p-4 hover:bg-gray-700 ${activeTab === 'produtos' ? 'bg-gray-700' : ''}`}
                  onClick={() => setActiveTab('produtos')}
                >
                  <CubeIcon className="h-5 w-5 mr-3" />
                  Produtos
                </button>
              </li>
              <li>
                <button 
                  className={`flex items-center w-full p-4 hover:bg-gray-700 ${activeTab === 'clientes' ? 'bg-gray-700' : ''}`}
                  onClick={() => setActiveTab('clientes')}
                >
                  <UserGroupIcon className="h-5 w-5 mr-3" />
                  Clientes
                </button>
              </li>
              <li>
                <button 
                  className={`flex items-center w-full p-4 hover:bg-gray-700 ${activeTab === 'novo-pedido' ? 'bg-gray-700' : ''}`}
                  onClick={() => setActiveTab('novo-pedido')}
                >
                  <ShoppingCartIcon className="h-5 w-5 mr-3" />
                  Novo Pedido
                </button>
              </li>
              <li>
                <button 
                  className={`flex items-center w-full p-4 hover:bg-gray-700 ${activeTab === 'pedidos' ? 'bg-gray-700' : ''}`}
                  onClick={() => setActiveTab('pedidos')}
                >
                  <ClipboardDocumentListIcon className="h-5 w-5 mr-3" />
                  Pedidos
                </button>
              </li>
            </ul>
          </nav>
          
          <div className="p-4 border-t border-gray-700">
            <button className="flex items-center w-full p-2 hover:bg-gray-700 rounded">
              <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
              Sair do Sistema
            </button>
          </div>
        </div>
      )}
      
      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button 
                className="mr-4 text-gray-500 hover:text-gray-700"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="text-lg font-semibold text-gray-800 capitalize">
                {activeTab === 'novo-pedido' ? 'Novo Pedido' : activeTab}
              </h2>
            </div>
            <div className="flex items-center">
              <div className="relative">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
              </div>
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

// Componentes para cada página
const CompaniesPage = () => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-semibold">Gerenciamento de Empresas</h3>
      <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">
        Nova Empresa
      </button>
    </div>
    
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome Fantasia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Razão Social</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNPJ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Empresa ABC</td>
                <td className="px-6 py-4 whitespace-nowrap">ABC Comércio Ltda</td>
                <td className="px-6 py-4 whitespace-nowrap">12.345.678/0001-90</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                  <button className="text-red-600 hover:text-red-900">Excluir</button>
                </td>
              </tr>
              {/* Mais empresas aqui... */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

const ProductsPage = () => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-semibold">Gerenciamento de Produtos</h3>
      <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">
        Novo Produto
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between">
              <h4 className="font-medium text-gray-900">Produto {item}</h4>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">R$ {item * 100},00</span>
            </div>
            <p className="mt-2 text-gray-600">Descrição do produto {item}</p>
            <div className="mt-4 flex">
              <button className="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
              <button className="text-red-600 hover:text-red-900">Excluir</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CustomersPage = () => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-semibold">Gerenciamento de Clientes</h3>
      <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">
        Novo Cliente
      </button>
    </div>
    
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">João Silva</td>
                <td className="px-6 py-4 whitespace-nowrap">joao@exemplo.com</td>
                <td className="px-6 py-4 whitespace-nowrap">(11) 99999-9999</td>
                <td className="px-6 py-4 whitespace-nowrap">Empresa ABC</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                  <button className="text-red-600 hover:text-red-900">Excluir</button>
                </td>
              </tr>
              {/* Mais clientes aqui... */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

const NewOrderPage = () => (
  <div>
    <h3 className="text-xl font-semibold mb-6">Novo Pedido</h3>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h4 className="font-medium text-lg mb-4">Produtos</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="border rounded-lg p-4 flex items-center">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mr-4" />
                <div className="flex-1">
                  <h5 className="font-medium">Produto {item}</h5>
                  <p className="text-gray-600 text-sm">R$ {item * 100},00</p>
                </div>
                <button className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                  +
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="font-medium text-lg mb-4">Itens do Pedido</h4>
          
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
                <tr>
                  <td className="py-3">Produto 1</td>
                  <td className="py-3">
                    <input type="number" min="1" defaultValue="1" className="w-16 border rounded p-1" />
                  </td>
                  <td className="py-3">R$ 100,00</td>
                  <td className="py-3">R$ 100,00</td>
                  <td className="py-3">
                    <button className="text-red-600 hover:text-red-900">Remover</button>
                  </td>
                </tr>
                <tr>
                  <td className="py-3">Produto 2</td>
                  <td className="py-3">
                    <input type="number" min="1" defaultValue="2" className="w-16 border rounded p-1" />
                  </td>
                  <td className="py-3">R$ 200,00</td>
                  <td className="py-3">R$ 400,00</td>
                  <td className="py-3">
                    <button className="text-red-600 hover:text-red-900">Remover</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div>
        <div className="bg-white shadow rounded-lg p-6 sticky top-6">
          <h4 className="font-medium text-lg mb-4">Resumo do Pedido</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <select className="w-full border rounded p-2">
                <option>Selecione um cliente</option>
                <option>João Silva</option>
                <option>Maria Souza</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
              <select className="w-full border rounded p-2">
                <option>Selecione uma empresa</option>
                <option>Empresa ABC</option>
                <option>Empresa XYZ</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea className="w-full border rounded p-2" rows={3}></textarea>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>R$ 500,00</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Desconto:</span>
                <span>R$ 0,00</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>R$ 500,00</span>
              </div>
            </div>
            
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg mt-4">
              Finalizar Pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const OrdersPage = () => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-semibold">Gerenciamento de Pedidos</h3>
      <div className="flex space-x-2">
        <input 
          type="text" 
          placeholder="Buscar pedido..." 
          className="border rounded p-2"
        />
        <select className="border rounded p-2">
          <option>Todos os status</option>
          <option>Pendente</option>
          <option>Processando</option>
          <option>Enviado</option>
          <option>Entregue</option>
        </select>
      </div>
    </div>
    
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">PED-001</td>
                <td className="px-6 py-4 whitespace-nowrap">João Silva</td>
                <td className="px-6 py-4 whitespace-nowrap">10/05/2023</td>
                <td className="px-6 py-4 whitespace-nowrap">R$ 500,00</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Pendente</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Detalhes</button>
                  <button className="text-red-600 hover:text-red-900">Cancelar</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">PED-002</td>
                <td className="px-6 py-4 whitespace-nowrap">Maria Souza</td>
                <td className="px-6 py-4 whitespace-nowrap">09/05/2023</td>
                <td className="px-6 py-4 whitespace-nowrap">R$ 750,00</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Entregue</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Detalhes</button>
                  <button className="text-red-600 hover:text-red-900">Cancelar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Mostrando 1 a 2 de 2 registros
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