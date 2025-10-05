import { createContext } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  isOrganizer: boolean;
  setIsOrganizer: (isOrganizer: boolean) => void;
  userId: string | null;
  setUserId: (id: string | null) => void;
  
  
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  isOrganizer: false,
  setIsOrganizer: () => {},
  userId: null,
  setUserId: () => {},

  
});

export default AuthContext;
