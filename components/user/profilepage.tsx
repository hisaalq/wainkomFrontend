import { apiOrigin } from "@/api";
// Engagement feature removed
import { deleteAccount, getProfile, updateUser } from "@/api/user";
import { BUTTONS, LAYOUT, TYPO } from "@/assets/style/stylesheet";
import AuthContext from "@/context/authcontext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router, useNavigation } from "expo-router";
import React, { useContext, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
// Feather icons no longer needed after removing engagement
import Ionicons from "react-native-vector-icons/Ionicons";
// ===============================================

const PrivacyModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const [isArabic, setIsArabic] = useState(true);
  const title = isArabic ? "سياسة الخصوصية" : "Privacy Policy";
  const languageToggleText = isArabic ? "English" : "العربية";
  const policyAr = `
    نحن نحترم خصوصيتك. نجمع أقل قدر من البيانات اللازمة لتقديم الخدمة،
    ولا نشارك معلوماتك مع أطراف ثالثة إلا عند الضرورة القانونية أو بموافقتك.
    يمكنك طلب حذف بياناتك في أي وقت.
  `;
  const policyEn = `
    We respect your privacy. We collect the minimum data required to deliver the service
    and never share your information with third parties except when legally required or with your consent.
    You can request deletion of your data at any time.
  `;
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={() => setIsArabic(!isArabic)} style={modalStyles.languageToggle}>
              <Ionicons name="language" size={20} color="#00d4ff" style={{ marginRight: 5 }} />
              <Text style={modalStyles.languageText}>{languageToggleText}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={modalStyles.termsScrollView}>
            <Text style={[modalStyles.modalText, { textAlign: isArabic ? "right" : "left" }]}>
              {(isArabic ? policyAr : policyEn).trim()}
            </Text>
          </ScrollView>
          <TouchableOpacity style={modalStyles.buttonClose} onPress={onClose}>
            <Text style={modalStyles.textStyle}>إغلاق / Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const ProfileScreen = () => {
  const { username } = useContext(AuthContext);
  const navigation = useNavigation();
  const { data: profile } = useQuery({ queryKey: ["userProfile"], queryFn: getProfile });
  const avatarSrc = profile?.image ? { uri: /^https?:\/\//.test(profile.image) ? profile.image : `${apiOrigin}/${profile.image.replace(/^\//, "")}` } : require("@/assets/images/placeholer.png");
  const queryClient = useQueryClient();
  // Engagement sorting removed
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable field states
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editImage, setEditImage] = useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (profile) {
      setEditUsername(profile.username || "");
      setEditEmail(profile.email || "");
      setEditBio(profile.bio || "");
      setEditPhone(profile.phone || "");
    }
  }, [profile]);

  React.useLayoutEffect(() => {
    // Update header title based on mode
    (navigation as any)?.setOptions?.({ title: isEditing ? "Edit Profile" : "Profile" });
  }, [navigation, isEditing]);

  const { mutateAsync: saveProfile, isPending: saving } = useMutation({
    mutationFn: (payload: any) => updateUser(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setIsEditing(false);
      setEditImage(undefined);
    },
  });

  // Engagement data and actions removed

  const user = { email: profile?.email ?? "" };

  // مكون رأس القائمة (ListHeaderComponent)
  const ListHeader = (
    <>
      {/* User Info */}
      <View style={styles.cardHeader}>
        {isEditing ? (
          <View>
            <View style={[styles.row, { marginBottom: 12 }]}>
              <TouchableOpacity
                onPress={async () => {
                  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
                  if (!res.canceled && res.assets?.[0]?.uri) setEditImage(res.assets[0].uri);
                }}
              >
                <View>
                  <Image source={{ uri: (editImage || (profile?.image ? (/^https?:\/\//.test(profile.image) ? profile.image : `${apiOrigin}/${profile.image.replace(/^\//, "")}`) : undefined)) as any }} style={{ width: 96, height: 96, borderRadius: 48 }} />
                  <View style={styles.cameraBadge}><Ionicons name="camera" size={16} color="#0B1416" /></View>
                </View>
              </TouchableOpacity>
            </View>
            <TextInput value={editUsername} onChangeText={setEditUsername} placeholder="Username" placeholderTextColor={TYPO.muted.color as string} style={styles.input} />
            <TextInput value={editEmail} onChangeText={setEditEmail} keyboardType="email-address" autoCapitalize="none" placeholder="Email" placeholderTextColor={TYPO.muted.color as string} style={styles.input} />
            <TextInput value={editBio} onChangeText={setEditBio} placeholder="Bio" placeholderTextColor={TYPO.muted.color as string} style={[styles.input, { minHeight: 80 }]} multiline />
            <TextInput value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" placeholder="Phone" placeholderTextColor={TYPO.muted.color as string} style={styles.input} />
            <View style={{ flexDirection: "row", columnGap: 10, marginTop: 8 }}>
              <TouchableOpacity
                onPress={async () => {
                  const payload: any = { username: editUsername, email: editEmail, bio: editBio, phone: editPhone };
                  if (editImage) payload.image = editImage;
                  await saveProfile(payload);
                }}
                disabled={saving}
                style={[BUTTONS.primary, { alignItems: 'center' }, saving && { opacity: 0.7 }]}
              >
                <Text style={BUTTONS.primaryText}>{saving ? "Saving..." : "Save Changes"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setIsEditing(false); setEditImage(undefined); }} style={BUTTONS.secondary}>
                <Text style={BUTTONS.secondaryText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.row}>
              <View>
                <Image source={avatarSrc as any} style={{ width: 96, height: 96, borderRadius: 48 }} />
                <TouchableOpacity
                  onPress={() => router.push("/user/editProfile" as any)}
                  style={styles.cameraBadge}
                >
                  <Ionicons name="camera" size={16} color="#0B1416" />
                </TouchableOpacity>
              </View>
              <View style={{ marginLeft: 12, justifyContent: 'center', flex: 1 }}>
                <Text style={[TYPO.h2]}>{profile?.username ?? username}</Text>
                {!!user.email && <Text style={[TYPO.muted]}>{user.email}</Text>}
                {!!(profile?.bio && profile.bio.trim()) && (
                  <Text style={[TYPO.muted, { marginTop: 6 }]}>{profile.bio}</Text>
                )}
                {!!(profile?.phone && profile.phone.trim()) && (
                  <Text style={[TYPO.muted, { marginTop: 2 }]}>Phone: {profile.phone}</Text>
                )}
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={{ height: 12 }} />

      {/* Engagement section removed */}
    </>
  );

  // مكون ذيل القائمة (ListFooterComponent)
  const ListFooter = (
    <>
      {/* Edit button placed directly above Sign Out */}
      <TouchableOpacity onPress={() => router.push("/user/editProfile" as any)} style={[BUTTONS.primary, { marginTop: 8 }]}>
        <Text style={BUTTONS.primaryText}>Edit Profile</Text>
      </TouchableOpacity>

      {/* Delete account replaces Sign Out here */}
      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            "Delete Account",
            "This action cannot be undone. Are you sure you want to delete your account?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                  try {
                    await deleteAccount();
                    (require("expo-router").router.replace("/" as any));
                  } catch (e) {
                    console.warn("Delete account failed", e);
                  }
                },
              },
            ]
          );
        }}
        style={{
          marginTop: 12,
          backgroundColor: '#2a1e1e',
          padding: 14,
          borderRadius: 12,
          alignItems: 'center',
          borderWidth: 1.5,
          borderColor: '#ff4d4f',
        }}
      >
        <Text style={{ color: '#ff4d4f', fontWeight: '800' }}>Delete Account</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <ScrollView style={[LAYOUT.screen, { padding: 0 }] } contentContainerStyle={{ padding: 16 }}>
      {ListHeader}
      {ListFooter}
      <PrivacyModal visible={privacyVisible} onClose={() => setPrivacyVisible(false)} />
    </ScrollView>
  );
};

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  termsScrollView: {
    maxHeight: 400,
    paddingHorizontal: 5,
    marginBottom: 15,
  },
  modalText: {
    color: "#e6eef0",
    marginBottom: 15,
    lineHeight: 22,
    fontSize: 14,
  },
  buttonClose: {
    backgroundColor: "#00d4ff",
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  languageToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#00d4ff",
  },
  languageText: {
    color: "#00d4ff",
    fontSize: 12,
    fontWeight: "600",
  },
});
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0f12" },
  cardHeader: { backgroundColor: "#0f1720", borderRadius: 12, padding: 14 },
  row: { flexDirection: "row", alignItems: "center" },
  name: { color: "#fff", fontWeight: "700", fontSize: 16 },
  email: { color: "#9ca3af", marginTop: 4 },
  input: {
    color: "#e6eef0",
    borderColor: "#213336",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#0f1720",
  },
  cameraBadge: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00d4ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0B1416',
  },
  primaryBtn: {
    backgroundColor: '#00d4ff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  primaryBtnText: { color: '#0B1416', fontWeight: '900' },
  secondaryBtn: {
    backgroundColor: '#213336',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  secondaryBtnText: { color: '#e6eef0', fontWeight: '600' },
  settingsItem: {
    backgroundColor: "#0f1720",
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemLeft: { flexDirection: "row", alignItems: "center" },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#062526",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemText: { color: "#e6eef0", fontSize: 15 },
});

export default ProfileScreen;
