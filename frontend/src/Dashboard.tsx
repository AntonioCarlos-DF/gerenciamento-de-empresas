import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Loading from './components/Loading';
import CompaniesPage from './pages/CompaniesPage';
import ProductsPage from './pages/ProductsPage';
import CustomersPage from './pages/CustomersPage';
import OrdersPage from './pages/OrdersPage';
import NewOrderPage from './pages/NewOrderPage';

interface User {
  name: string;
  // adicione demais campos conforme seu objeto de usuário
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>('empresas');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (!t || !u) {
      navigate('/login');
      return;
    }
    setToken(t);
    try {
      setUser(JSON.parse(u));
    } catch (err) {
      console.error('Erro ao parsear usuário:', err);
      navigate('/login');
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = (): void => {
    localStorage.clear();
    navigate('/login');
  };

  const renderContent = (): ReactNode => {
    if (loading) return <Loading />;
    if (!user || !token) return <div className="text-center py-8">Acesso não autorizado</div>;

    const tabs: Record<string, ReactNode> = {
      empresas: <CompaniesPage token={token} />, 
      produtos: <ProductsPage token={token} />, 
      clientes: <CustomersPage token={token} />, 
      pedidos: <OrdersPage token={token} />, 
      'novo-pedido': <NewOrderPage token={token} />
    };

    return tabs[activeTab] ?? tabs['empresas'];
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && <Sidebar activeTab={activeTab} onChange={setActiveTab} onLogout={handleLogout} />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={activeTab === 'novo-pedido' ? 'Novo Pedido' : activeTab}
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          userInitial={user?.name.charAt(0)}
        />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}