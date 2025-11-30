import React, { createContext, useContext, useState } from 'react';

type NavSnapshot = any;

interface NavContextValue {
  navStack: NavSnapshot[];
  pushView: (snap: NavSnapshot) => void;
  popView: () => NavSnapshot | undefined;
  clear: () => void;
}

const NavContext = createContext<NavContextValue | null>(null);

export const NavProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [navStack, setNavStack] = useState<NavSnapshot[]>([]);

  const pushView = (snap: NavSnapshot) => {
    setNavStack(prev => [...prev, snap]);
  };

  const popView = () => {
    let last: NavSnapshot | undefined = undefined;
    setNavStack(prev => {
      if (!prev || prev.length === 0) return prev;
      last = prev[prev.length - 1];
      return prev.slice(0, -1);
    });
    return last;
  };

  const clear = () => setNavStack([]);

  return (
    <NavContext.Provider value={{ navStack, pushView, popView, clear }}>
      {children}
    </NavContext.Provider>
  );
};

export const useNav = () => {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
};

export default NavContext;
