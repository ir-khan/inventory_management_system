import AsyncStorage from '@react-native-async-storage/async-storage';

class LocalStorageService {
    static async saveUser(user) {
        try {
            await AsyncStorage.setItem('currentUser', JSON.stringify(user));
        } catch (error) {
            console.error("Error saving user to local storage: ", error);
        }
    }

    static async getUser() {
        try {
            const user = await AsyncStorage.getItem('currentUser');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error("Error retrieving user from local storage: ", error);
            return null;
        }
    }

    static async updateUser(user) {
        try {
            await AsyncStorage.mergeItem('currentUser', JSON.stringify(user));
        } catch (error) {
            console.error("Error updating user in local storage: ", error);
        }
    }
}

export default LocalStorageService;
