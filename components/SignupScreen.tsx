import { register } from '@/api/auth';
import { COLORS } from '@/assets/style/color';
import { BUTTONS, FORMS, LAYOUT, TYPO } from '@/assets/style/stylesheet';
import AuthContext from '@/context/authcontext';
import { Link, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Switch, Text, TextInput, View } from 'react-native';

export default function SignupScreen() {
    const { setIsAuthenticated } = useContext(AuthContext);

    const router = useRouter();
    const [isOrganizer, setIsOrganizer] = useState(false);
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
            console.log("isOrganizer", isOrganizer);
            const userData = {
                username,
                email,
                password,
                verifyPassword: confirm,
                isOrganizer,
            }
            console.log("userData", userData);
            const data = await register(userData);
            console.log("data", data);
            router.replace(isOrganizer ? "/organizer" : "/user");
            setIsAuthenticated(true);
        } catch (err: any) {
            const msg = err?.response?.data?.msg || err?.response?.data?.message || 'Signup failed';
            Alert.alert('Error', String(msg));
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[LAYOUT.screen, { gap: 14 }]}>
            <View style={{ height: 140, borderRadius: 16, backgroundColor: '#111', marginBottom: 12, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={TYPO.muted}>WainKom Logo</Text>
            </View>

            <Text style={TYPO.h2}>Create your account</Text>

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

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={FORMS.label}>Register as organizer</Text>
                <Switch value={isOrganizer} onValueChange={setIsOrganizer} trackColor={{ false: '#555', true: COLORS.primary }} thumbColor={isOrganizer ? COLORS.backgroundn : '#f4f3f4'} />
            </View>

            <Pressable disabled={loading} onPress={onSignup} style={[BUTTONS.primary, { marginTop: 12, opacity: loading ? 0.7 : 1 }]}>
                {loading ? <ActivityIndicator color={COLORS.backgroundn} /> : <Text style={BUTTONS.primaryText}>Sign Up</Text>}
            </Pressable>

            <View style={{ alignItems: 'center', marginTop: 6 }}>
                <Text style={TYPO.muted}>
                    Already have an account? <Link href="/" style={TYPO.link}>Log In</Link>
                </Text>
            </View>
        </View>
    );
}


