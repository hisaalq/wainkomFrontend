import { getToken } from "@/api/storage";
import { COLORS } from "@/assets/style/color";
import AuthContext from "@/context/authcontext";
import { OrganizerInfo } from "@/types/OrganizerInfo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [organizerData, setOrganizerData] = useState<OrganizerInfo | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const checkToken = async () => {
    const token = await getToken();
    console.log("token", token);
    if (token) {
      const decodedToken = jwtDecode(token);
      console.log("decodedToken", decodedToken);
      setIsAuthenticated(true);
      setIsOrganizer((decodedToken as any).isOrganizer);
      setOrganizerData((decodedToken as any).organizer || null);
      setUserId((decodedToken as any)?.id || (decodedToken as any)?._id || null);
      console.log("isOrganizer", isOrganizer);
      console.log("organizerData from token:", (decodedToken as any).organizer);
    }
    setIsReady(true);
  };
  useEffect(() => {
    checkToken();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.backgroundd }}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, isOrganizer, setIsOrganizer, organizerData, setOrganizerData, userId, setUserId }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={isAuthenticated}>
              { isOrganizer ? <Stack.Screen name="organizer" /> : <Stack.Screen name="user" /> }
          </Stack.Protected>
          <Stack.Protected guard={!isAuthenticated}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
        </Stack>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
