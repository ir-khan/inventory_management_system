import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { IMGS, ROUTES } from '../constants';
import { AuthService } from '../services';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const authService = new AuthService();

    const validateForm = () => {
        let error = {};

        if (!email) error.email = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(email)) error.email = 'Email is invalid';

        if (!password) error.password = 'Password is required';
        else if (password.length < 6) error.password = 'Password must be at least 6 characters long';

        setError(error);
        return Object.keys(error).length === 0;
    };

    const handleLogin = async () => {
        if (validateForm()) {
            setLoading(true);
            setError('');
    
            try {
                const userCredential = await authService.login(email, password);
                if (userCredential) {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: ROUTES.DRAWER }],
                    });
                }
            } catch (authError) {
                console.error("Authentication Error: ", authError.message);
    
                if (authError.message.includes('No user found with this email.')) {
                    setError('No user found with this email.');
                } else if (authError.message.includes('Incorrect password.')) {
                    setError('Incorrect password. Please try again.');
                } else if (authError.message.includes('invalid email')) {
                    setError('Invalid email address.');
                } else {
                    setError('An unexpected error occurred. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        }
    };
    


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style='dark'></StatusBar>
            <View style={styles.logoContainer}>
                <Image source={IMGS.logo} style={styles.logo}></Image>
                <Text style={styles.firstHalf}>Staff and </Text>
                <Text style={styles.secondHalf}>Inventory Management</Text>
            </View>
            <View>
                <Text style={styles.heading}>Sign in to your account</Text>
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Enter your email'
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor='#C4C4C4'
                    keyboardType='email-address'
                    autoCapitalize='none'
                />
                {error.email ? <Text style={styles.errorText}>{error.email}</Text> : null}
            </View>
            <View style={[styles.inputContainer, { marginTop: error.email ? 0 : styles.inputContainer.marginTop }]}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={{ fontSize: 19 }}
                        placeholder='Enter your password'
                        value={password}
                        onChangeText={setPassword}
                        placeholderTextColor='#C4C4C4'
                        secureTextEntry={!showPassword}
                        autoCapitalize='none'
                        keyboardType='default'
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Icon
                            name={showPassword ? 'visibility-off' : 'visibility'}
                            size={25}
                            color='#004643'
                        />
                    </TouchableOpacity>
                </View>
                {error.password ? <Text style={styles.errorText}>{error.password}</Text> : null}
            </View>
            <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity onPress={() => navigation.navigate(ROUTES.FORGOTPASSWORD)}>
                    <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>
            </View>

            <View style={{ width: '80%' }}>
                <TouchableOpacity onPress={handleLogin} disabled={loading}>
                    <View style={styles.buttonContainer}>
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Sign in</Text>
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate(ROUTES.SIGNUP)}>
                    <Text style={styles.footerTextButton}>Create Account</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    logoContainer: {
        marginTop: 70,
        marginBottom: 30,
        alignItems: 'center',
    },
    logo: {
        width: 100,
        height: 100,
    },
    firstHalf: {
        color: '#C0C0C0',
        fontSize: 25,
        fontWeight: '500',
    },
    secondHalf: {
        color: '#004643',
        fontSize: 25,
        fontWeight: '500',
    },
    heading: {
        color: '#004643',
        fontSize: 20,
        fontWeight: '600',
    },
    inputContainer: {
        width: '80%',
        marginTop: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        paddingHorizontal: 3
    },
    input: {
        height: 50,
        fontSize: 19,
        borderWidth: 1,
        borderColor: '#C4C4C4',
        borderRadius: 10,
        marginTop: 10,
        paddingHorizontal: 10,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 50,
        borderWidth: 1,
        borderColor: '#C4C4C4',
        borderRadius: 10,
        marginTop: 10,
        paddingHorizontal: 10,
    },
    forgotPasswordContainer: {
        width: '80%',
        alignItems: 'flex-end',
        marginTop: 10,
    },
    forgotPassword: {
        color: '#757575',
        fontSize: 14,
        fontWeight: '500',
    },
    buttonContainer: {
        width: '100%',
        height: 48,
        backgroundColor: '#004643',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 19,
        fontWeight: '500',
    },
    footer: {
        marginTop: 70,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#757575',
    },
    footerTextButton: {
        color: '#004643',
        fontSize: 12,
        fontWeight: '500',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        alignSelf: 'flex-start',
        paddingLeft: 6,
        paddingTop: 3,
    },
});
