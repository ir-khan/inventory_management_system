import { 
    auth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    sendPasswordResetEmail, 
    onAuthStateChanged,
} from '../../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../models';

class AuthService {
    #user;

    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (userCredential) {
                await AsyncStorage.setItem('user', JSON.stringify(userCredential.user));
                this.#user = userCredential.user;
                return userCredential;
            }
        } catch (error) {
            console.error("Login Error: ", error.message);
            throw new Error(this.getAuthErrorMessage(error.code));
        }
        return null;
    }

    async signup(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (userCredential) {
                await AsyncStorage.setItem('user', JSON.stringify(userCredential.user));
                this.#user = userCredential.user;
                return userCredential;
            }
        } catch (error) {
            console.error("Signup Error: ", error.message);
            throw new Error(this.getAuthErrorMessage(error.code));
        }
        return null;
    }

    async logout() {
        try {
            await auth.signOut();
            await AsyncStorage.removeItem('user');
            this.#user = null;
            return true;
        } catch (error) {
            console.error("Logout Error: ", error.message);
            throw new Error('An unexpected error occurred during logout.');
        }
    }

    async forgotPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            return true;
        } catch (error) {
            console.error("Forgot Password Error: ", error.message);
            throw new Error(this.getAuthErrorMessage(error.code));
        }
    }

    async getCurrentUser() {
        try {
            const user = await AsyncStorage.getItem('user');
            if (user) {
                const parsedUser = JSON.parse(user);
                this.#user = UserProfile.fromJson(parsedUser);
                return this.#user;
            }
        } catch (error) {
            console.error("Get Current User Error: ", error.message);
            throw new Error('An error occurred while retrieving user information.');
        }
        return null;
    }

    authStateChangesListener(callback) {
        onAuthStateChanged(auth, async (user) => {
            console.log('From auth:: ' + user);
            if (user) {
                await AsyncStorage.setItem('user', JSON.stringify(user));
                this.#user = user;
            } else {
                await AsyncStorage.removeItem('user');
                this.#user = null;
            }
            callback(user);
        });
    }

    getAuthErrorMessage(errorCode) {
        switch (errorCode) {
            case 'auth/email-already-in-use':
                return 'Email already in use';
            case 'auth/invalid-email':
                return 'Invalid email';
            case 'auth/weak-password':
                return 'Weak password';
            case 'auth/user-not-found':
                return 'No user found with this email.';
            case 'auth/wrong-password':
                return 'Incorrect password.';
            case 'auth/too-many-requests':
                return 'Too many requests. Please try again later.';
            default:
                return 'An unexpected error occurred. Please try again.';
        }
    }
}

export default AuthService;
