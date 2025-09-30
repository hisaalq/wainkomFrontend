import { login } from '@/api/auth';
import { storeToken } from '@/api/storage';
import { COLORS } from '@/assets/style/color';
import { BUTTONS, FORMS, LAYOUT, TYPO } from '@/assets/style/stylesheet';
import AuthContext from '@/context/authcontext';
import { Link } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import { useContext, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
    const { setIsAuthenticated, setIsOrganizer } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const onLogin = async () => {
        if (!email || !password) {
            Alert.alert('Missing info', 'Please enter your email and password.');
            return;
        }
        try {
            setLoading(true);
            const data = await login({ email, password });
            storeToken(data.token);
            try {
                const decoded: any = jwtDecode(data.token);
                setIsOrganizer(Boolean(decoded?.isOrganizer));
            } catch {}
            setIsAuthenticated(true);
        } catch (err: any) {
            console.log("err", err);
            const msg = err?.response?.data?.msg || err?.response?.data?.message || 'Login failed';
            Alert.alert('Error', String(msg));
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[LAYOUT.screen, { gap: 16, justifyContent: 'center' }]}>
            <Text style={[TYPO.h1, { marginBottom: 6 }]}>WainKom</Text>
            <Text style={[TYPO.muted, { marginBottom: 12 }]}>Welcome back</Text>

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

            <Pressable disabled={loading} onPress={onLogin} style={[BUTTONS.primary, { marginTop: 16, opacity: loading ? 0.7 : 1 }]}>
                {loading ? <ActivityIndicator color={COLORS.backgroundn} /> : <Text style={BUTTONS.primaryText}>Log In</Text>}
            </Pressable>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
                <Text style={TYPO.muted}>Don't have an account? </Text>
                <Link href="/signup" style={TYPO.link}>Sign Up</Link>
            </View>
        </View>
    );
}


