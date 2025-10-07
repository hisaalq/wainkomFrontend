import { deleteToken } from "@/api/storage";
import { COLORS } from "@/assets/style/color";
import AuthContext from "@/context/authcontext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Feather";

export default function LogoutButton() {
  const { setIsAuthenticated, setIsOrganizer } = useContext(AuthContext);
  const router = useRouter();

  const logout = async () => {
    try {
      await deleteToken();
    } finally {
      setIsAuthenticated(false);
      setIsOrganizer(false);
      router.replace("/");
    }
  };

  return (
    <Pressable
      // زر الخروج الآن هو الزر القابل للضغط بالكامل
      onPress={logout}
      style={({ pressed }) => [
        styles.logoutBtn,
        pressed && styles.logoutBtnPressed,
      ]}
    >
      <Icon name="log-out" size={18} color="#ff4d4f" />
      <Text style={styles.logoutText}>تسجيل الخروج</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  logoutBtn: {
    marginTop: 12,
    marginBottom: 10,
    backgroundColor: "#1e1e1e",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row", // لجعل النص والأيقونة في صف واحد
    alignItems: "center",
    justifyContent: "center", // لتوسيط المحتوى
    borderWidth: 1.5,
    borderColor: "#ff4d4f",
  },
  logoutBtnPressed: {
    backgroundColor: "#2a1e1e", // لون أغمق عند الضغط
  },
  logoutText: { 
    color: "#ff4d4f", 
    fontWeight: "700", 
    marginLeft: 8, 
    fontSize: 16 
  },
});