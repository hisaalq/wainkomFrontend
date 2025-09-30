import { register } from '@/api/auth';
import { COLORS } from '@/assets/style/color';
import { BUTTONS, FORMS, LAYOUT, TYPO } from '@/assets/style/stylesheet';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';

type Role = 'user' | 'organizer';

export default function SignupScreen() {
    const [role, setRole] = useState<Role>('user');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);

    const onSignup = async () => {
        if (!username || !email || !password) {
            Alert.alert('Missing info', 'Please fill all required fields.');
            return;
        }
        if (password !== confirm) {
            Alert.alert('Password mismatch', 'Passwords do not match.');
            return;
        }
        try {
            setLoading(true);
            await register({
                name: username,
                email,
                password,
                verifyPassword: confirm,
                type: role,
            });
            router.replace('/');
        } catch (err: any) {
            const msg = err?.response?.data?.msg || err?.response?.data?.message || 'Signup failed';
            Alert.alert('Error', String(msg));
        } finally {
            setLoading(false);
        }
    };

    const SegButton = ({ label, value }: { label: string; value: Role }) => {
        const active = role === value;
        return (
            <Pressable onPress={() => setRole(value)} style={[FORMS.segmentedItem, active && FORMS.segmentedItemActive]}>
                <Text style={{ color: active ? COLORS.backgroundn : COLORS.quaternary, fontWeight: '600' }}>{label}</Text>
            </Pressable>
        );
    };

    return (
        <View style={[LAYOUT.screen, { gap: 14 }]}>
            <View style={{ height: 140, borderRadius: 16, backgroundColor: '#111', marginBottom: 12, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={TYPO.muted}>WainKom Logo</Text>
            </View>

            <Text style={TYPO.h2}>Create your account</Text>

            <View style={FORMS.segmentedWrap}>
                <SegButton label="User" value="user" />
                <SegButton label="Organizer" value="organizer" />
            </View>

            <Text style={FORMS.label}>Username</Text>
            <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                placeholderTextColor={COLORS.quaternary}
                style={FORMS.input}
            />

            <Text style={FORMS.label}>Email</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.quaternary}
                keyboardType="email-address"
                autoCapitalize="none"
                style={FORMS.input}
            />

            <Text style={FORMS.label}>Password</Text>
            <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.quaternary}
                secureTextEntry
                style={FORMS.input}
            />

            <Text style={FORMS.label}>Confirm Password</Text>
            <TextInput
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Confirm your password"
                placeholderTextColor={COLORS.quaternary}
                secureTextEntry
                style={FORMS.input}
            />

            <Pressable disabled={loading} onPress={onSignup} style={[BUTTONS.primary, { marginTop: 12, opacity: loading ? 0.7 : 1 }]}>
                {loading ? <ActivityIndicator color={COLORS.backgroundn} /> : <Text style={BUTTONS.primaryText}>Sign Up</Text>}
            </Pressable>

            <View style={{ alignItems: 'center', marginTop: 6 }}>
                <Text style={TYPO.muted}>
                    Already have an account? <Link href="/(auth)/login" style={TYPO.link}>Log In</Link>
                </Text>
            </View>
        </View>
    );
}


