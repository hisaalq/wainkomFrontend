import { COLORS } from "@/assets/style/color";
import { signOut } from "@/assets/style/stylesheet";
import AuthContext from "@/context/authcontext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { Pressable, Text } from "react-native";

export default function LogoutButton() {
    const {setIsAuthenticated, setIsOrganizer} = useContext(AuthContext);
    const router = useRouter();

    const logout = async () => {
        try {
            await deleteToken();
        } finally {
            setIsAuthenticated(false);
            setIsOrganizer(false);
            router.replace("/");
        }
    }
    
    return (
        <Pressable
          android_ripple={{ color: "#ffdddd", foreground: true }}
          style={({ pressed }) => [
            signOut.signOut,
            pressed && {
              backgroundColor: "#1a1313",
                borderColor: COLORS.primary,
            },
          ]}
          onPress={logout}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.primary} />
          <Text style={signOut.signOutText}>Sign Out</Text>
        </Pressable>
    )
}