import { COLORS } from '@/assets/style/color';
import { BUTTONS, FORMS, LAYOUT, TYPO } from '@/assets/style/stylesheet';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onLogin = () => {
        router.replace('/');
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

            <Pressable onPress={onLogin} style={[BUTTONS.primary, { marginTop: 16 }]}>
                <Text style={BUTTONS.primaryText}>Log In</Text>
            </Pressable>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
                <Text style={TYPO.muted}>Don't have an account? </Text>
                <Link href="/(auth)/signup" style={TYPO.link}>Sign Up</Link>
            </View>
        </View>
    );
}


