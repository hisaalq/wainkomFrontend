import { createContext } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  isOrganizer: boolean;
  setIsOrganizer: (isOrganizer: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  isOrganizer: false,
  setIsOrganizer: () => {},
});

export default AuthContext;
