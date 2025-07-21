import { BuildingOfficeIcon, CubeIcon, UserGroupIcon, ShoppingCartIcon, ClipboardDocumentListIcon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";

interface SidebarProps {
  activeTab: string;
  onChange: (tab: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, onChange, onLogout }: SidebarProps) {
  const items = [
    { key: 'empresas', icon: BuildingOfficeIcon, label: 'Empresas' },
    { key: 'produtos', icon: CubeIcon, label: 'Produtos' },
    { key: 'clientes', icon: UserGroupIcon, label: 'Clientes' },
    { key: 'novo-pedido', icon: ShoppingCartIcon, label: 'Novo Pedido' },
    { key: 'pedidos', icon: ClipboardDocumentListIcon, label: 'Pedidos' },
  ];

  return (
    <div className="w-64 bg-purple-600 text-white flex flex-col">
      <div className="p-4 border-b border-purple-600">
        <h1 className="text-xl font-bold">Sistema de Gestão</h1>
      </div>
      <nav className="flex-1 py-4">
        {items.map(item => (
          <button
            key={item.key}
            className={`flex items-center w-full p-4 hover:bg-purple-800 ${activeTab === item.key ? 'bg-purple-800' : ''}`}
            onClick={() => onChange(item.key)}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-purple-800">
        <button className="flex items-center w-full p-2 hover:bg-purple-800 rounded" onClick={onLogout}>
          <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" /> Sair do Sistema
        </button>
      </div>
    </div>
  );
}