import { getToken } from "@/api/storage";
import { COLORS } from "@/assets/style/color";
import AuthContext from "@/context/authcontext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const checkToken = async () => {
    const token = await getToken();

    if (token) {
      const decodedToken = jwtDecode(token);
      setIsAuthenticated(true);
      setIsOrganizer((decodedToken as any).isOrganizer);
    }
    setIsReady(true);

  };
  useEffect(() => {
    checkToken();
  }, []);


  if (!isReady) {
    return <ActivityIndicator color={COLORS.primary} />;
  }
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, isOrganizer, setIsOrganizer }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={isAuthenticated}>
            <Stack screenOptions={{ headerShown: false }}>
              { isOrganizer ? <Stack.Screen name="organizer" /> : <Stack.Screen name="user" /> }
            </Stack>
          </Stack.Protected>
          <Stack.Protected guard={!isAuthenticated}><Stack.Screen name="(auth)" /></Stack.Protected>
        </Stack>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}