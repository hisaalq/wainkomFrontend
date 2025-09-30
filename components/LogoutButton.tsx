import { deleteToken } from "@/api/storage";
import AuthContext from "@/context/authcontext";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { Button } from "react-native";

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
        <Button onPress={logout} title="Logout" />
    )
}