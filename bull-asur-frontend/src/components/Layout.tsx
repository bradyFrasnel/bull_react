import React, { ReactNode } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Layout.css';

interface LayoutProps {
  title?: string;
  children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ title, children }) => {
  const navigate = useNavigate();
  
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="content-header">
          <div className="header-content">
            <button 
              onClick={() => navigate('/')}
              className="header-back-button"
            >
              ← Accueil
            </button>
            <h1>{title || 'Bull ASUR'}</h1>
          </div>
        </header>
        <main className="content-main">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout;
