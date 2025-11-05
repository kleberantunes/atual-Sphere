import React from 'react';
import { AppView, User, UserRole } from '../types';
import Icon from './Icon';

interface HeaderProps {
  user: User;
  setView: (view: AppView) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, setView, onLogout }) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-gray-900/80 p-4 backdrop-blur-md border-b border-gray-700">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(AppView.HOME)}>
        <Icon icon="broadcast" className="w-8 h-8 text-indigo-500"/>
        <h1 className="text-2xl font-bold tracking-tighter">Babel Streaming</h1>
      </div>
      <nav className="flex items-center gap-6">
        <button
          onClick={() => setView(AppView.HOME)}
          className="text-gray-300 hover:text-white transition-colors"
        >
          Home
        </button>
        {user.role === UserRole.CREATOR && (
          <button
            onClick={() => setView(AppView.CREATOR_STUDIO)}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Creator Studio
          </button>
        )}
        {user.role === UserRole.INTERPRETER && (
          <button
            onClick={() => setView(AppView.INTERPRETER_CONSOLE)}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Interpreter Console
          </button>
        )}
      </nav>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
            <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
            <span className="text-sm font-medium">{user.name}</span>
        </div>
        <button
          onClick={onLogout}
          className="text-sm bg-gray-700 hover:bg-indigo-600 px-3 py-1.5 rounded-md transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;