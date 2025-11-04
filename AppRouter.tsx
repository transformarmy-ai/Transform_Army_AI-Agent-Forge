import React, { useState, useEffect } from 'react';
import { MissionProvider } from './context/MissionContext';
import App from './App';
import MissionControl from './pages/MissionControl';

type PageType = 'forge' | 'mission-control';

const AppRouter: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('forge');

  // Check URL on mount and route accordingly
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('mission-control')) {
      setCurrentPage('mission-control');
    } else {
      setCurrentPage('forge');
    }
  }, []);

  // Handle navigation by updating URL
  const navigate = (page: PageType) => {
    setCurrentPage(page);
    window.history.pushState(null, '', `/${page === 'mission-control' ? 'mission-control' : ''}`);
  };

  // Expose navigation to global scope for cross-component access
  useEffect(() => {
    (window as any).navigateToPage = navigate;
  }, []);

  return (
    <MissionProvider>
      <div>
        {currentPage === 'forge' && <App onNavigate={navigate} />}
        {currentPage === 'mission-control' && <MissionControl />}
      </div>
    </MissionProvider>
  );
};

export default AppRouter;
