
import React, { useState } from 'react';
import { Icons } from '../constants';
import { backend } from '../services/mockBackend';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onSearch: (q: string) => void;
  onUploadClick: () => void;
  onLogoClick: () => void;
  onAuthClick: () => void;
  onLogout: () => void;
  onMoodboardsClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onSearch, onUploadClick, onLogoClick, onAuthClick, onLogout, onMoodboardsClick }) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-md z-40 px-4 md:px-8 flex items-center gap-4 border-b border-gray-100">
        <button onClick={onLogoClick} className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">P</div>
        </button>
        
        <nav className="hidden md:flex items-center gap-2">
          <button onClick={onLogoClick} className="px-4 py-2 font-semibold text-gray-900 rounded-full hover:bg-gray-100">Home</button>
          <button onClick={onMoodboardsClick} className="px-4 py-2 font-semibold text-gray-500 rounded-full hover:bg-gray-100">Moodboards</button>
        </nav>

        <form onSubmit={handleSearchSubmit} className="flex-1 relative max-w-4xl">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Icons.Search />
          </div>
          <input
            type="text"
            placeholder="Search tags, colors, descriptions..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full bg-gray-100 hover:bg-gray-200 border-none rounded-full py-3 pl-12 pr-4 transition-colors focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <button onClick={onUploadClick} className="p-3 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative group">
            <Icons.Plus />
          </button>
          
          {user ? (
            <div className="flex items-center gap-3">
              <button onClick={onLogout} className="hidden md:block text-sm font-semibold text-gray-500 hover:text-red-600">Logout</button>
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center border border-red-200 font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <button 
              onClick={onAuthClick}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-full transition-colors"
            >
              Log in
            </button>
          )}
        </div>
      </header>

      <main className="pt-24 pb-8 px-4 md:px-8 flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
