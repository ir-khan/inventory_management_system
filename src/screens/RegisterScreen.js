import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { IMGS, ROUTES } from '../constants';
import { DatabaseService, AuthService } from '../services';
import { UserProfile } from '../models';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

const RegisterScreen = ({ navigation }) => {
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const databaseService = new DatabaseService();
    const authService = new AuthService();

    const validateForm = () => {
        let error = {};

        if (!fullname) {
            error.fullname = 'Full name is required';
        } else if (fullname.length < 2) {
            error.fullname = 'Full name must be at least 2 characters long';
        }

        if (!email) {
            error.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            error.email = 'Email is invalid';
        }

        if (!password) {
            error.password = 'Password is required';
        } else if (password.length < 6) {
            error.password = 'Password must be at least 6 characters long';
        }

        if (password !== confirmPassword) {
            error.confirmPassword = 'Passwords do not match';
        }

        setError(error);

        return Object.keys(error).length === 0;
    };

    const handleRegister = async () => {
        if (validateForm()) {
            setLoading(true);
            setError({});

            try {
                const userCredential = await authService.signup(email, password);
                if (userCredential) {
                    const userProfile = new UserProfile({
                        uid: userCredential.user.uid,
                        fullname: fullname,
                        email: email,
                    });

                    try {
                        const result = await databaseService.createUserProfile(userProfile);
                        if (result) {
                            navigation.navigate(ROUTES.LOGIN);
                        } else {
                            setError({ general: 'Failed to create user profile. Please try again later.' });
                        }
                    } catch (dbError) {
                        console.error("Database Error: ", dbError.message);
                        setError({ general: 'An error occurred while creating your profile. Please try again later.' });
                    }
                }
            } catch (authError) {
                console.error("Authentication Error: ", authError.message);

                if (authError.message.includes('email already in use')) {
                    setError({ email: 'The email address is already in use by another account.' });
                } else if (authError.message.includes('invalid email')) {
                    setError({ email: 'The email address is not valid.' });
                } else if (authError.message.includes('weak password')) {
                    setError({ password: 'The password is too weak.' });
                } else {
                    setError({ general: 'An unexpected error occurred. Please try again.' });
                }
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style='dark'></StatusBar>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.logoContainer}>
                    <Image source={IMGS.logo} style={styles.logo} />
                </View>
                <View>
                    <Text style={styles.heading}>Create a new account</Text>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='Enter your full name'
                        value={fullname}
                        onChangeText={setFullname}
                        placeholderTextColor='#C4C4C4'
                        autoCapitalize='none'
                        keyboardType='default'
                    />
                    {error.fullname && <Text style={styles.errorText}>{error.fullname}</Text>}
                </View>
                <View style={[styles.inputContainer, { marginTop: error.fullname ? 0 : styles.inputContainer.marginTop }]}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='Enter your email'
                        value={email}
                        onChangeText={setEmail}
                        placeholderTextColor='#C4C4C4'
                        autoCapitalize='none'
                        keyboardType='email-address'
                    />
                    {error.email && <Text style={styles.errorText}>{error.email}</Text>}
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
                    {error.password && <Text style={styles.errorText}>{error.password}</Text>}
                </View>
                <View style={[styles.inputContainer, { marginTop: error.password ? 0 : styles.inputContainer.marginTop }]}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={{ fontSize: 19 }}
                            placeholder='Confirm your password'
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholderTextColor='#C4C4C4'
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize='none'
                            keyboardType='default'
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <Icon
                                name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                                size={25}
                                color='#004643'
                            />
                        </TouchableOpacity>
                    </View>
                    {error.confirmPassword && <Text style={styles.errorText}>{error.confirmPassword}</Text>}
                </View>

                <View style={{ width: '80%' }}>
                    <TouchableOpacity onPress={handleRegister} disabled={loading}>
                        <View style={styles.buttonContainer}>
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Register</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
                {error.general && <Text style={styles.errorText}>{error.general}</Text>}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)}>
                        <Text style={styles.footerTextButton}>Back to Sign In</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default RegisterScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 30,
    },
    logoContainer: {
        marginTop: 50,
        marginBottom: 30,
        alignItems: 'center',
    },
    logo: {
        width: 100,
        height: 100,
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
        paddingHorizontal: 3,
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
        marginTop: 50,
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
        marginBottom: 5,
        alignSelf: 'flex-start',
        paddingLeft: 6,
        paddingTop: 3,
    },
});
