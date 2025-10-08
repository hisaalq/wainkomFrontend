import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";

const storeToken = async (token: string) => {
  try {
    await setItemAsync("token", token);
    console.log("✅ Token stored successfully");
  } catch (error) {
    console.error("❌ Error storing token:", error);
  }
};

const getToken = async () => {
  try {
    const token = await getItemAsync("token");
    console.log(token ? "✅ Token found" : "⚠️  No token found (user not logged in)");
    return token;
  } catch (error) {
    console.error("❌ Error getting token:", error);
  }
};

const deleteToken = async () => {
  try {
    await deleteItemAsync("token");
  } catch (error) {
    console.error("Error deleting token:", error);
  }
};

export { deleteToken, getToken, storeToken };

