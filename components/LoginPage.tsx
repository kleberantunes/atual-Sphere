import React from 'react';
import { UserRole } from '../types';
import Icon from './Icon';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

const RoleCard: React.FC<{
  role: UserRole;
  title: string;
  description: string;
  icon: 'video' | 'language' | 'viewers';
  onSelect: () => void;
}> = ({ title, description, icon, onSelect }) => (
  <div
    onClick={onSelect}
    className="bg-gray-800 p-8 rounded-lg border border-gray-700 hover:border-indigo-500 hover:bg-gray-700 transition-all duration-300 cursor-pointer text-center transform hover:-translate-y-1"
  >
    <Icon icon={icon} className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
    <h3 className="text-2xl font-bold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);


const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <Icon icon="broadcast" className="w-16 h-16 text-indigo-500 mx-auto mb-4"/>
        <h1 className="text-5xl font-bold tracking-tighter">Welcome to Babel Streaming</h1>
        <p className="text-xl text-gray-400 mt-2">Select your role to continue</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        <RoleCard
          role={UserRole.CREATOR}
          title="Creator"
          description="Manage your stream, go live, and interact with your audience. Access the full Creator Studio."
          icon="video"
          onSelect={() => onLogin(UserRole.CREATOR)}
        />
        <RoleCard
          role={UserRole.INTERPRETER}
          title="Interpreter"
          description="Join as a language interpreter. Access the console to provide live audio translations."
          icon="language"
          onSelect={() => onLogin(UserRole.INTERPRETER)}
        />
        <RoleCard
          role={UserRole.VIEWER}
          title="Viewer"
          description="Watch live streams and VODs. Switch between available audio languages in real time."
          icon="viewers"
          onSelect={() => onLogin(UserRole.VIEWER)}
        />
      </div>
    </div>
  );
};

export default LoginPage;