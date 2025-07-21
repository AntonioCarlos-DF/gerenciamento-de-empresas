interface HeaderProps {
  title: string;
  onToggleSidebar: () => void;
  userInitial?: string;
}

export default function Header({ title, onToggleSidebar, userInitial }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <button className="mr-4 text-gray-500 hover:text-purple-800" onClick={onToggleSidebar}>
            {/* ícone de menu */}
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-800 capitalize">{title}</h2>
        </div>
        {userInitial && (
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center">
            {userInitial}
          </div>
        )}
      </div>
    </header>
  );
}