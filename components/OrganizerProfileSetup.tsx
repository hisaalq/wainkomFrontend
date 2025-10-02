import instance from '@/api';
import { register } from '@/api/auth';
import { COLORS } from '@/assets/style/color';
import { BUTTONS, FORMS, LAYOUT, SPACING, TYPO } from '@/assets/style/stylesheet';
import AuthContext from '@/context/authcontext';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function OrganizerProfileSetup() {
    const { setIsAuthenticated, setOrganizerData } = useContext(AuthContext);
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // Get user data from params
    const username = params.username as string;
    const email = params.email as string;
    const password = params.password as string;
    const confirm = params.confirm as string;
    
    // Organizer profile fields
    const [orgName, setOrgName] = useState('');
    const [orgAddress, setOrgAddress] = useState('');
    const [orgImage, setOrgImage] = useState('');
    const [orgPhone, setOrgPhone] = useState('');
    const [orgEmail, setOrgEmail] = useState('');
    const [orgBio, setOrgBio] = useState('');
    const [orgWebsite, setOrgWebsite] = useState('');
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission needed", "Please allow photo library access.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.9,
        });
        if (result.canceled || !result.assets?.length) return;
        const asset = result.assets[0];

        try {
            const fd = new FormData();
            fd.append("image", {
                uri: asset.uri,
                name: (asset as any).fileName || "logo.jpg",
                type: (asset as any).mimeType || "image/jpeg",
            } as any);
            const uploadPath = (process.env.EXPO_PUBLIC_UPLOAD_URL as string) || "/upload";
            const { data } = await instance.post(uploadPath, fd, { headers: { "Content-Type": "multipart/form-data" } });
            if (data?.url) setOrgImage(data.url); else setOrgImage(asset.uri);
        } catch {
            setOrgImage(asset.uri);
        }
    };

    const onSignup = async () => {
        if (!orgName || !orgAddress || !orgImage || !orgPhone || !orgEmail) {
            Alert.alert('Missing organizer info', 'Please fill all required organizer fields.');
            return;
        }
     
        try {
            setLoading(true);
            const userData: any = {
                username,
                email,
                password,
                verifyPassword: confirm,
                isOrganizer: true,
                orgName,
                orgAddress,
                orgImage,
                orgPhone,
                orgEmail,
            };
            
            if (orgBio) userData.orgBio = orgBio;
            if (orgWebsite) userData.orgWebsite = orgWebsite;
            
            const data = await register(userData);
            console.log("Registration response:", data);
            console.log("Registration response organizer:", data.organizer);
            console.log("Registration response user:", data.user);
            
            // Store organizer data if present
            if (data.organizer) {
                console.log("Organizer data:", data.organizer);
                setOrganizerData(data.organizer);
            } else {
                console.log("No organizer data in registration response");
            }
            
            router.replace("/organizer");
            setIsAuthenticated(true);
        } catch (err: any) {
            const msg = err?.response?.data?.msg || err?.response?.data?.message || 'Signup failed';
            Alert.alert('Error', String(msg));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={LAYOUT.screen}>
            <ScrollView contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 16 }}>
                <View style={{ height: 140, borderRadius: 16, backgroundColor: '#111', marginBottom: 12, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={TYPO.muted}>WainKom Logo</Text>
                </View>

                <Text style={TYPO.h2}>Complete Your Organizer Profile</Text>
                <Text style={[TYPO.muted, { marginBottom: SPACING.md }]}>Fill in your organization details to get started</Text>

                {/* Organization Logo */}
                <View style={{ alignItems: "center", marginBottom: SPACING.sm }}>
                    <TouchableOpacity onPress={pickImage} activeOpacity={0.85}>
                        {orgImage ? (
                            <View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, overflow: 'hidden' }}>
                                <Image source={{ uri: orgImage }} style={{ width: '100%', height: '100%' }} />
                            </View>
                        ) : (
                            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" }}>
                                <MaterialCommunityIcons name="image-plus" size={24} color={COLORS.muted} />
                            </View>
                        )}
                    </TouchableOpacity>
                    <Text style={[TYPO.muted, { marginTop: SPACING.xs, fontSize: 12 }]}>Tap to add logo</Text>
                </View>

                <Text style={FORMS.label}>Organization Name *</Text>
                <View style={FORMS.inputRow}>
                    <MaterialCommunityIcons name="office-building" size={18} color={COLORS.muted} />
                    <TextInput
                        value={orgName}
                        onChangeText={setOrgName}
                        placeholder="Enter organization name"
                        placeholderTextColor={COLORS.muted}
                        style={FORMS.inputText}
                        autoCapitalize="words"
                    />
                </View>

                <Text style={FORMS.label}>Organization Address *</Text>
                <View style={FORMS.inputRow}>
                    <MaterialCommunityIcons name="map-marker-outline" size={18} color={COLORS.muted} />
                    <TextInput
                        value={orgAddress}
                        onChangeText={setOrgAddress}
                        placeholder="Enter organization address"
                        placeholderTextColor={COLORS.muted}
                        style={FORMS.inputText}
                        autoCapitalize="words"
                    />
                </View>

                <Text style={FORMS.label}>Organization Phone *</Text>
                <View style={FORMS.inputRow}>
                    <Ionicons name="call-outline" size={18} color={COLORS.muted} />
                    <TextInput
                        value={orgPhone}
                        onChangeText={setOrgPhone}
                        placeholder="Enter organization phone"
                        placeholderTextColor={COLORS.muted}
                        style={FORMS.inputText}
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                    />
                </View>

                <Text style={FORMS.label}>Organization Email *</Text>
                <View style={FORMS.inputRow}>
                    <Ionicons name="mail-outline" size={18} color={COLORS.muted} />
                    <TextInput
                        value={orgEmail}
                        onChangeText={setOrgEmail}
                        placeholder="Enter organization email"
                        placeholderTextColor={COLORS.muted}
                        style={FORMS.inputText}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <Text style={FORMS.label}>Bio (Optional)</Text>
                <TextInput
                    value={orgBio}
                    onChangeText={setOrgBio}
                    placeholder="Tell customers about your organization"
                    placeholderTextColor={COLORS.muted}
                    style={[FORMS.input, { height: 80, textAlignVertical: 'top' }]}
                    multiline
                />

                <Text style={FORMS.label}>Website (Optional)</Text>
                <View style={FORMS.inputRow}>
                    <MaterialCommunityIcons name="link-variant" size={18} color={COLORS.muted} />
                    <TextInput
                        value={orgWebsite}
                        onChangeText={setOrgWebsite}
                        placeholder="https://example.com"
                        placeholderTextColor={COLORS.muted}
                        style={FORMS.inputText}
                        autoCapitalize="none"
                    />
                </View>

                <Pressable disabled={loading} onPress={onSignup} style={[BUTTONS.primary, { marginTop: 12, opacity: loading ? 0.7 : 1 }]}>
                    {loading ? <ActivityIndicator color={COLORS.backgroundn} /> : <Text style={BUTTONS.primaryText}>Sign Up</Text>}
                </Pressable>

                <Pressable onPress={() => router.back()} style={[BUTTONS.secondary, { marginTop: 8 }]}>
                    <Text style={BUTTONS.secondaryText}>Back</Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
