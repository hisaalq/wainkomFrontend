import { OrganizerInfo } from "@/types/OrganizerInfo";
import { createContext } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  isOrganizer: boolean;
  setIsOrganizer: (isOrganizer: boolean) => void;
  username: string | null;
  setUsername: (id: string | null) => void;

  organizerData: OrganizerInfo | null;
  setOrganizerData: (organizerData: OrganizerInfo | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  isOrganizer: false,
  setIsOrganizer: () => {},
  username: null,
  setUsername: () => {},

  organizerData: null,
  setOrganizerData: () => {},
});

export default AuthContext;
