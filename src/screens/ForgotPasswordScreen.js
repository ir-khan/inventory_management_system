import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthService } from '../services';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const authService = new AuthService();

    const validateForm = () => {
        let error = {};
        if (!email) error.email = 'Email is required';
        setError(error);
        return Object.keys(error).length === 0;
    };

    const handleResetPassword = async () => {
        if (validateForm()) {
            setLoading(true);
            setSuccess(false);
            setError({});
    
            try {
                await authService.forgotPassword(email);
                setSuccess(true);
            } catch (authError) {
                console.error("Forgot Password Error: ", authError.message);
    
                if (authError.message.includes('Invalid email address.')) {
                    setError({ email: 'Invalid email address.' });
                } else if (authError.message.includes('No user found with this email.')) {
                    setError({ email: 'No user found with this email.' });
                } else {
                    setError({ general: 'Failed to send reset email. Please try again.' });
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
                <Icon name="lock" size={100} color="#004643" />
            </View>
            <View>
                <Text style={styles.heading}>Forgot Password</Text>
            </View>
            <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsText}>
                    If you've forgotten your password, don't worry. Just enter the email address associated with your account, and we’ll send you a link to reset it.
                </Text>
            </View>
            <View style={styles.inputContainer}>
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
                {error.general && <Text style={styles.errorText}>{error.general}</Text>}
            </View>
            {success ? (
                <View style={styles.successContainer}>
                    <Text style={styles.successText}>Check your inbox for the reset link!</Text>
                </View>
            ) : (

                <View style={{width: '80%'}}>
                    <TouchableOpacity onPress={handleResetPassword} disabled={loading}>
                        <View style={styles.buttonContainer}>
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Send Reset Link</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

            )
            }
            <View style={styles.footer}>
                <Text style={styles.footerText}>Remember your password? </Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.footerTextButton}>Back to Sign In</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView >
    );
}

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        marginTop: 30,
        marginBottom: 30,
        alignItems: 'center',
    },
    heading: {
        color: '#004643',
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
    },
    instructionsContainer: {
        width: '80%',
        marginTop: 20,
        paddingHorizontal: 10,
        alignItems: 'center',
    },
    instructionsText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
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
    successContainer: {
        width: '80%',
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    successText: {
        color: '#004643',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
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
