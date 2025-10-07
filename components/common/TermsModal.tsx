import { COLORS } from "@/assets/style/color";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function TermsModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" }}>
        <View style={{ backgroundColor: "#1e1e1e", borderRadius: 20, padding: 20, width: "90%", maxHeight: "80%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>Terms and Conditions</Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close terms">
              <Ionicons name="close" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ maxHeight: 420 }}>
            <Text style={{ color: "#e6eef0", lineHeight: 22 }}>
              By using this app, you agree to follow our rules and local laws. Content must be lawful and respectful.
              We may update these terms; continued use means you accept the latest version. We are not responsible for
              third‑party events listed in the app.
            </Text>
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 14, backgroundColor: COLORS.primary, padding: 12, borderRadius: 10, alignItems: "center" }}>
            <Text style={{ color: "#0B1416", fontWeight: "900" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}


