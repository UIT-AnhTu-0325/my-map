import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { isLoggedIn, login as doLogin, logout as doLogout } from './auth';

interface AuthCtx {
  loggedIn: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({
  loggedIn: false,
  login: async () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  const login = async (username: string, password: string) => {
    const ok = await doLogin(username, password);
    if (ok) setLoggedIn(true);
    return ok;
  };

  const logout = () => {
    doLogout();
    setLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ loggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
