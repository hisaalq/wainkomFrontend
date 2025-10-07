import { UserInfo } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import instance from ".";

export const getProfile = async () => {
  const { data } = await instance.get<UserInfo>("/user/profile");
  return data;
};

export const getuser = async () => {
  const { data } = await instance.get<UserInfo>("/user");
  return data;
};

export const updateUser = async (userInfo: Partial<UserInfo>) => {
  // If an image is a local file URI, send multipart/form-data for multer backends
  const maybeImage = userInfo.image;
  const looksLikeFileUri =
    typeof maybeImage === "string" && /^file:/.test(maybeImage);

  if (looksLikeFileUri) {
    const form = new FormData();
    // append file
    const uri = maybeImage as string;
    const filename = uri.split("/").pop() || `avatar.jpg`;
    const ext = filename.split(".").pop()?.toLowerCase();
    const mime =
      ext === "png"
        ? "image/png"
        : ext === "webp"
        ? "image/webp"
        : ext === "heic" || ext === "heif"
        ? "image/heic"
        : "image/jpeg";

    form.append(
      "image",
      // React Native FormData file shape
      { uri, name: filename, type: mime } as unknown as Blob
    );

    // append any other provided fields besides image
    Object.entries(userInfo).forEach(([key, value]) => {
      if (key === "image" || value === undefined || value === null) return;
      form.append(key, String(value));
    });

    const { data } = await instance.put<UserInfo>("/user", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }

  // Fallback to JSON body when not uploading a file
  const { data } = await instance.put<UserInfo>("/user", userInfo);
  return data;
};

export const logout = async () => {
  await AsyncStorage.removeItem("token");
};

export const deleteAccount = async () => {
  const { data } = await instance.delete("/user");
  await AsyncStorage.removeItem("token");
  return data;
};


