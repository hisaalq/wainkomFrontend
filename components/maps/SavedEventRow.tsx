import { COLORS } from "@/assets/style/color";
import React from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  id: string;
  title: string;
  subtitle?: string;
  isSaved?: boolean;
  onPress?: () => void;
  onToggleSave?: (id: string, isSaved: boolean) => void;
};

export default function SavedEventRow({ id, title, subtitle, isSaved = true, onPress, onToggleSave }: Props) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: COLORS.quinary, foreground: true }}
      style={{ paddingVertical: 12, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
    >
      <View style={{ flexShrink: 1, paddingRight: 12 }}>
        <Text style={{ fontWeight: "700" }}>{title}</Text>
        {subtitle ? <Text style={{ opacity: 0.7 }} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      <Pressable onPress={() => onToggleSave?.(id, isSaved)} hitSlop={12}>
        <Text style={{ fontSize: 20 }}>{isSaved ? "❤️" : "🤍"}</Text>
      </Pressable>
    </Pressable>
  );
}
