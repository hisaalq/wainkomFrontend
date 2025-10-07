import {
  Engagement,
  fetchEngagementByIdApi,
  removeEngagementApi,
} from "@/api/eventsave";
import AuthContext from "@/context/authcontext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
// 🚀 تم تعديل مسار الاستيراد ليتناسب مع هيكلية: 'components/user/'
import LogoutButton from "../auth/LogoutButton";

// 💡 الاستيرادات الإضافية لعملية التعديل
import { UserInfo } from "@/types";
import { getProfile, updateUser } from "../../api/user";

// 💡 دالة dummy لاختيار الصورة
const pickImage = async (): Promise<string | undefined> => {
  Alert.alert("اختيار صورة", "يرجى تطبيق منطق مكتبة اختيار الصور هنا.");
  return undefined;
};

// ===============================================
// 🚀 مكون مودال تعديل البروفايل (EditProfileModalContent)
// ===============================================
const EditProfileModalContent = ({
  visible,
  onClose,
  onUpdateSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  onUpdateSuccess: () => void;
}) => {
  // ... (الكود يبقى كما هو من الرد السابق) ...
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState<
    Partial<UserInfo & { image: string }>
  >({ image: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      const fetchUserData = async () => {
        try {
          setLoading(true);
          const data: UserInfo = await getProfile();

          setFormData({
            ...data,
            image:
              data.image ||
              "https://via.placeholder.com/150/00d4ff/0b0f12?text=Avatar",
            bio: data.bio || "",
            phone: data.phone || "",
          });
        } catch (e) {
          setError("فشل في جلب البيانات.");
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    }
  }, [visible]);

  const handleChange = (key: keyof UserInfo, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleImagePick = async () => {
    const imageUri = await pickImage();
    if (imageUri) {
      setFormData({ ...formData, image: imageUri });
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      await updateUser(formData);
      Alert.alert("نجاح", "تم تحديث البروفايل بنجاح!");
      onUpdateSuccess();
      onClose();
    } catch (e: any) {
      const errorMessage =
        e.response?.data?.message || "فشل التحديث. يرجى التحقق من البيانات.";
      setError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={editModalStyles.centeredView}>
        <View style={editModalStyles.modalView}>
          <View style={editModalStyles.modalHeader}>
            <Text style={editModalStyles.headerText}>تعديل البروفايل</Text>
            <TouchableOpacity
              onPress={onClose}
              style={editModalStyles.closeButton}
            >
              <Icon name="x" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }}>
            {loading ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 200,
                }}
              >
                <ActivityIndicator size="large" color="#00d4ff" />
                <Text style={{ color: "#fff", marginTop: 10 }}>
                  جاري التحميل...
                </Text>
              </View>
            ) : (
              <>
                <View style={editModalStyles.imageContainer}>
                  <Image
                    source={{ uri: formData.image }}
                    style={editModalStyles.profileImage}
                  />
                  <TouchableOpacity
                    style={editModalStyles.imageButton}
                    onPress={handleImagePick}
                  >
                    <Icon name="camera" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={editModalStyles.inputGroup}>
                  <Text style={editModalStyles.label}>اسم المستخدم</Text>
                  <TextInput
                    style={editModalStyles.input}
                    value={formData.username}
                    onChangeText={(text) => handleChange("username", text)}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={editModalStyles.inputGroup}>
                  <Text style={editModalStyles.label}>البريد الإلكتروني</Text>
                  <TextInput
                    style={editModalStyles.input}
                    value={formData.email}
                    onChangeText={(text) => handleChange("email", text)}
                    keyboardType="email-address"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={editModalStyles.inputGroup}>
                  <Text style={editModalStyles.label}>الهاتف</Text>
                  <TextInput
                    style={editModalStyles.input}
                    value={formData.phone}
                    onChangeText={(text) => handleChange("phone", text)}
                    keyboardType="phone-pad"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={editModalStyles.inputGroup}>
                  <Text style={editModalStyles.label}>الجهة / المؤسسة</Text>
                </View>
                <View style={editModalStyles.inputGroup}>
                  <Text style={editModalStyles.label}>النبذة</Text>
                  <TextInput
                    style={[editModalStyles.input, editModalStyles.textArea]}
                    value={formData.bio}
                    onChangeText={(text) => handleChange("bio", text)}
                    multiline
                    numberOfLines={4}
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                {error && (
                  <Text style={editModalStyles.errorText}>{error}</Text>
                )}

                <TouchableOpacity
                  style={[
                    editModalStyles.updateButton,
                    isUpdating && editModalStyles.disabledButton,
                  ]}
                  onPress={handleUpdate}
                  disabled={isUpdating}
                >
                  <Text style={editModalStyles.buttonText}>
                    {isUpdating ? "جاري التحديث..." : "تحديث البروفايل"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
// ===============================================

// ... (مكون TermsModal يبقى كما هو) ...
const TermsModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  // ... (الكود الخاص بـ TermsModal لا يتغير) ...
  const [isArabic, setIsArabic] = useState(true);

  const title = isArabic ? "الشروط والأحكام" : "Terms and Conditions";
  const languageToggleText = isArabic ? "English" : "العربية";

  const termsArabic = `
    مرحبًا بك في برنامج وياكم.
    1. قبول الشروط: باستخدامك للبرنامج، فإنك توافق على الالتزام بهذه الشروط.
    2. خصوصية البيانات: يتم التعامل مع بيانات المستخدمين بسرية تامة وعدم مشاركتها مع أي طرف ثالث.
    3. الفعاليات: البرنامج يوفر معلومات عن فعاليات خارجية، ولا يتحمل مسؤولية محتوى هذه الفعاليات أو إلغائها.
    4. حقوق الملكية الفكرية: جميع محتويات البرنامج محمية بحقوق النشر لبرنامج وياكم.
    5. الإنهاء: يحتفظ برنامج وياكم بالحق في إنهاء وصول أي مستخدم يخالف هذه الشروط.
  `;

  const termsEnglish = `
    Welcome to Wayyakum program.
    1. Acceptance of Terms: By using the program, you agree to be bound by these Terms and Conditions.
    2. Data Privacy: User data is handled with strict confidentiality and will not be shared with any third party.
    3. Events: The program provides information about external events and is not responsible for the content or cancellation of these events.
    4. Intellectual Property: All program content is copyrighted by Wayyakum program.
    5. Termination: Wayyakum program reserves the right to terminate access for any user who violates these terms.
  `;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>{title}</Text>
            <TouchableOpacity
              onPress={() => setIsArabic(!isArabic)}
              style={modalStyles.languageToggle}
            >
              <Ionicons
                name="language"
                size={20}
                color="#00d4ff"
                style={{ marginRight: 5 }}
              />
              <Text style={modalStyles.languageText}>{languageToggleText}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.termsScrollView}>
            <Text
              style={[
                modalStyles.modalText,
                { textAlign: isArabic ? "right" : "left" },
              ]}
            >
              {isArabic ? termsArabic.trim() : termsEnglish.trim()}
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
// ===============================================

// ===============================================
// مكون ProfileScreen
// ===============================================
const ProfileScreen = () => {
  const { username } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const {
    data: engagements,
    isLoading,
    error,
    refetch,
  } = useQuery<Engagement[]>({
    queryKey: ["engagements"],
    queryFn: fetchEngagementByIdApi,
  });

  const sortedEvents = useMemo(() => {
    if (!engagements) return [];
    return [...engagements].sort((a, b) => {
      const dateA = new Date(a.event.date).getTime();
      const dateB = new Date(b.event.date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [engagements, sortOrder]);

  const handleRemoveBookmark = async (engagementId: string) => {
    await removeEngagementApi(engagementId);
    queryClient.invalidateQueries({ queryKey: ["engagements"] });
  };

  const handleProfileRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    refetch();
  };

  const user = {
    email: "user@example.com",
    image: "https://via.placeholder.com/150/00d4ff/0b0f12?text=User",
  };

  const ListHeader = (
    <>
      {/* User Info & Edit Button */}
      <View style={styles.cardHeader}>
        <View style={styles.row}>
          <Image source={{ uri: user.image }} style={styles.profileAvatar} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.name}>{username}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>

        {/* 🚀 زر تعديل البروفايل الذي يفتح المودال */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditModalVisible(true)}
        >
          <Icon name="edit-3" size={16} color="#0b0f12" />
          <Text style={styles.editButtonText}> edit profile</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 12 }} />

      {/* Engagement Header */}
      <View style={styles.engagementWrapper}>
        <View style={styles.engagementHeader}>
          <Text style={styles.sectionTitle}>Engagement</Text>
          <TouchableOpacity
            onPress={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            style={styles.sortBtn}
          >
            <Icon
              name={sortOrder === "asc" ? "arrow-up" : "arrow-down"}
              size={16}
              color="#00d4ff"
            />
            <Text style={styles.sortText}>
              {sortOrder === "asc" ? "الأقرب أولاً" : "الأبعد أولاً"}
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading && <Text style={{ color: "#fff" }}>Loading...</Text>}
        {error && (
          <Text style={{ color: "red" }}>Error loading engagements</Text>
        )}
      </View>
    </>
  );

  const ListFooter = (
    <>
      <TouchableOpacity
        style={styles.settingsItem}
        onPress={() => setTermsModalVisible(true)}
      >
        <View style={styles.itemLeft}>
          <View style={styles.iconWrap}>
            <Ionicons name="document-text-outline" size={20} color="#00d4ff" />
          </View>
          <Text style={styles.itemText}>الشروط والأحكام</Text>
        </View>
        <Icon name="chevron-right" size={20} color="#9ca3af" />
      </TouchableOpacity>

      <LogoutButton />
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedEvents}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={{ padding: 16 }}
        style={{ flex: 1 }}
        renderItem={({ item }) => {
          const { title, description, image, location, date, time } =
            item.event;

          return (
            <View style={styles.eventCard}>
              <Image source={{ uri: image }} style={styles.eventImage} />
              <TouchableOpacity
                style={styles.bookmarkIcon}
                onPress={() => handleRemoveBookmark(item._id)}
              >
                <Icon name="bookmark" size={24} color="#00d4ff" />
              </TouchableOpacity>
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{title}</Text>
                <Text style={styles.eventDesc}>{description}</Text>
                {location &&
                  typeof location !== "string" &&
                  location.coordinates && (
                    <Text style={styles.eventLocationText}>
                      Location: Lat {location.coordinates[1]}, Lng{" "}
                      {location.coordinates[0]}
                    </Text>
                  )}

                {location && typeof location === "string" && (
                  <Text style={styles.eventLocationText}>
                    Location: {location}
                  </Text>
                )}
                <Text style={styles.eventDateText}>
                  {new Date(date).toLocaleDateString()} at {time}
                </Text>
              </View>
            </View>
          );
        }}
      />

      <TermsModal
        visible={termsModalVisible}
        onClose={() => setTermsModalVisible(false)}
      />

      <EditProfileModalContent
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onUpdateSuccess={handleProfileRefresh}
      />
    </View>
  );
};

// ===============================================
// التنسيقات (Styles)
// ===============================================

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

const editModalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  modalView: {
    width: "100%",
    height: "90%",
    backgroundColor: "#0b0f12",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1e1e1e",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  closeButton: {
    padding: 5,
  },
  imageContainer: { alignItems: "center", marginBottom: 30 },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#00d4ff",
  },
  imageButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    backgroundColor: "#00d4ff",
    borderRadius: 20,
    padding: 8,
  },
  inputGroup: { marginBottom: 15 },
  label: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "600",
    textAlign: "right",
  },
  input: {
    backgroundColor: "#0f1720",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: "right",
  },
  textArea: { height: 100, textAlignVertical: "top" },
  updateButton: {
    backgroundColor: "#00d4ff",
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    alignItems: "center",
  },
  disabledButton: { backgroundColor: "#00d4ff50" },
  buttonText: { color: "#0b0f12", fontSize: 18, fontWeight: "bold" },
  errorText: { color: "red", textAlign: "center", marginTop: 10, fontSize: 14 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0f12" },
  cardHeader: { backgroundColor: "#0f1720", borderRadius: 12, padding: 14 },
  row: { flexDirection: "row", alignItems: "center" },

  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#00d4ff",
  },
  editButton: {
    backgroundColor: "#00d4ff",
    borderRadius: 8,
    padding: 8,
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    color: "#0b0f12",
    marginLeft: 8,
    fontWeight: "bold",
    fontSize: 14,
  },

  name: { color: "#fff", fontWeight: "700", fontSize: 16 },
  email: { color: "#9ca3af", marginTop: 4 },
  engagementWrapper: {
    marginVertical: 16,
    backgroundColor: "#0f1720",
    borderRadius: 12,
    padding: 12,
  },
  engagementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  sortBtn: { flexDirection: "row", alignItems: "center" },
  sortText: { color: "#00d4ff", marginLeft: 6 },
  eventCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    backgroundColor: "#16232e",
  },
  eventImage: { width: "100%", height: 150 },
  eventTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  eventDesc: {
    color: "#e6eef0",
    marginTop: 4,
  },
  eventLocationText: {
    color: "#9ca3af",
    marginTop: 4,
  },
  eventDateText: {
    color: "#9ca3af",
    marginTop: 4,
    fontSize: 13,
  },
  eventContent: {
    padding: 12,
  },
  bookmarkIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 20,
    padding: 4,
  },
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
