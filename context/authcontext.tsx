import { OrganizerInfo } from "@/types/OrganizerInfo";
import { createContext } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  isOrganizer: boolean;
  setIsOrganizer: (isOrganizer: boolean) => void;
  userId: string | null;
  setUserId: (id: string | null) => void;
  
  
  organizerData: OrganizerInfo | null;
  setOrganizerData: (organizerData: OrganizerInfo | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  isOrganizer: false,
  setIsOrganizer: () => {},
  userId: null,
  setUserId: () => {},

  
  organizerData: null,
  setOrganizerData: () => {},
});

export default AuthContext;
