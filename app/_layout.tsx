import { getToken } from "@/api/storage";
import { COLORS } from "@/assets/style/color";
import AuthContext from "@/context/authcontext";
import { OrganizerInfo } from "@/types/OrganizerInfo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [organizerData, setOrganizerData] = useState<OrganizerInfo | null>(
    null
  );
  const [isReady, setIsReady] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  const checkToken = async () => {
    const token = await getToken();
    console.log("token", token);
    if (token) {
      const decodedToken = jwtDecode(token);
      console.log("decodedToken", decodedToken);
      setIsAuthenticated(true);
      setIsOrganizer((decodedToken as any).isOrganizer);
      setOrganizerData((decodedToken as any).organizer || null);
      setUsername((decodedToken as any).username || null);

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
      <AuthContext.Provider
        value={{
          isAuthenticated,
          setIsAuthenticated,
          isOrganizer,
          setIsOrganizer,
          organizerData,
          setOrganizerData,
          username,
          setUsername,
        }}
      >
        <Stack
          screenOptions={{
            // Unified simple chevron back across all stacks
            headerStyle: { backgroundColor: COLORS.backgroundd },
            headerTintColor: COLORS.primary,
            headerBackTitle: "",
            headerLeft: ({ canGoBack }) =>
              canGoBack ? (
                <Pressable onPress={() => router.back()} hitSlop={10}>
                  <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
                </Pressable>
              ) : undefined,
          }}
          initialRouteName={
            isAuthenticated ? (isOrganizer ? "organizer" : "user") : "(auth)"
          }
        >
          <Stack.Protected guard={isAuthenticated}>
            {isOrganizer ? (
              <Stack.Screen name="organizer" options={{ headerShown: false }} />
            ) : (
              <Stack.Screen name="user" options={{ headerShown: false }} />
            )}
            {/* Ensure myProfile has the same header UI as editProfile */}
            <Stack.Screen
              name="myProfile"
              options={{
                title: "Profile",
                headerShown: true,
                headerBackVisible: false,
                headerLeft: () => (
                  <Pressable onPress={() => router.back()} hitSlop={10} style={{ paddingHorizontal: 4 }}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
                  </Pressable>
                ),
              }}
            />
          </Stack.Protected>
          <Stack.Protected guard={!isAuthenticated}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
