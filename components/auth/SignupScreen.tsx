import { register } from '@/api/auth';
import { COLORS } from '@/assets/style/color';
import { BUTTONS, FORMS, LAYOUT, TYPO } from '@/assets/style/stylesheet';
import AuthContext from '@/context/authcontext';
import { Link, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';

export default function SignupScreen() {
    const { setIsAuthenticated } = useContext(AuthContext);

    const router = useRouter();
    const [isOrganizer, setIsOrganizer] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    


    const onContinue = () => {
        if (!username || !email || !password) {
            Alert.alert('Missing info', 'Please fill all required fields.');
            return;
        }
        if (password !== confirm) {
            Alert.alert('Password mismatch', 'Passwords do not match.');
            return;
        }
        
        // Navigate to organizer profile form
        router.push({
            pathname: '/organizerProfileSetup',
            params: {
                username,
                email,
                password,
                confirm,
                isOrganizer: 'true'
            }
        });
    };

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
            const userData: any = {
                username,
                email,
                password,
                verifyPassword: confirm,
                isOrganizer: false,
            };
            
            const data = await register(userData);
            console.log("Registration response:", data);
            
            router.replace("/user");
            setIsAuthenticated(true);
        } catch (err: any) {
            const msg = err?.response?.data?.msg || err?.response?.data?.message || 'Signup failed';
            Alert.alert('Error', String(msg));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <ScrollView 
                style={LAYOUT.screen} 
                contentContainerStyle={{ paddingBottom: 24 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
            <Image 
                source={require('@/assets/images/wainkom-baige.png')} 
                style={{ 
                    width: 120, 
                    height: 120, 
                    alignSelf: 'center', 
                    marginBottom: 16 
                }} 
                resizeMode="contain"
            />

            <Text style={TYPO.h2}>Create your account</Text>

            <Text style={FORMS.label}>Username</Text>
            <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                placeholderTextColor={COLORS.muted}
                style={FORMS.input}
            />

            <Text style={FORMS.label}>Email</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                style={FORMS.input}
            />

            <Text style={FORMS.label}>Password</Text>
            <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.muted}
                secureTextEntry
                style={FORMS.input}
            />

            <Text style={FORMS.label}>Confirm Password</Text>
            <TextInput
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Confirm your password"
                placeholderTextColor={COLORS.muted}
                secureTextEntry
                style={FORMS.input}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={FORMS.label}>Register as organizer</Text>
                <Switch value={isOrganizer} onValueChange={setIsOrganizer} trackColor={{ false: '#555', true: COLORS.primary }} thumbColor={isOrganizer ? COLORS.backgroundn : '#f4f3f4'} />
            </View>

            <Pressable disabled={loading} onPress={isOrganizer ? onContinue : onSignup} style={[BUTTONS.primary, { marginTop: 12, opacity: loading ? 0.7 : 1 }]}>
                {loading ? <ActivityIndicator color={COLORS.backgroundn} /> : <Text style={BUTTONS.primaryText}>{isOrganizer ? 'Continue' : 'Sign Up'}</Text>}
            </Pressable>

            <View style={{ alignItems: 'center', marginTop: 6 }}>
                <Text style={TYPO.muted}>
                    Already have an account? <Link href="/" style={TYPO.link}>Log In</Link>
                </Text>
            </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}


