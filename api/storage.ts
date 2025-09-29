import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";

const storeToken = async (token: string) => {
  try {
    await setItemAsync("token", token);
  } catch (error) {
    console.error("Error storing token:", error);
  }
};

const getToken = async () => {
  try {
    return await getItemAsync("token");
  } catch (error) {
    console.error("Error getting token:", error);
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
