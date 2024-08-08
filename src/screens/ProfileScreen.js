import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image, ActionSheetIOS, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthService, DatabaseService, LocalStorageService, StorageService, MediaService } from '../services';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IMGS, ROUTES } from '../constants';
import { Entypo, AntDesign } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [fullname, setFullname] = useState('');
    const [imageURL, setImageURL] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const databaseService = new DatabaseService();
    const storageService = new StorageService();
    const authService = new AuthService();

    useEffect(() => {
        const fetchUser = async () => {
            let currentUser = await LocalStorageService.getUser();
            if (!currentUser) {
                currentUser = await databaseService.getUserProfile();
            }
            if (currentUser) {
                setUser(currentUser);
                setFullname(currentUser.fullname);
                setImageURL(currentUser.pfpURL || IMGS.person);
            }
        };

        fetchUser();

        const unsubscribe = NetInfo.addEventListener(state => {
            if (state.isConnected) {
                syncWithFirestore();
            }
        });

        return () => unsubscribe();
    }, []);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            const updatedUser = { ...user, fullname };

            if (selectedImage) {
                const downloadURL = await storageService.uploadUserPfp(selectedImage.uri, user.uid);
                updatedUser.pfpURL = downloadURL;
            }

            await LocalStorageService.updateUser(updatedUser);
            setUser(updatedUser);
            setIsEditing(false);
            setSelectedImage(null);

            const netInfo = await NetInfo.fetch();
            if (netInfo.isConnected) {
                await databaseService.updateUserProfile(updatedUser);
            } else {
                await AsyncStorage.setItem('pendingUpdate', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.log('Error updating user:', error);
        }
    };

    const syncWithFirestore = async () => {
        try {
            const pendingUpdate = await AsyncStorage.getItem('pendingUpdate');
            if (pendingUpdate) {
                const updatedUser = JSON.parse(pendingUpdate);
                await databaseService.updateUserProfile(updatedUser);
                await AsyncStorage.removeItem('pendingUpdate');
            }
        } catch (error) {
            console.log('Error syncing with Firestore:', error);
        }
    };

    const handleImageSelection = () => {
        if (isEditing) {
            if (Platform.OS === 'ios') {
                ActionSheetIOS.showActionSheetWithOptions(
                    {
                        options: ['Cancel', 'Select from Gallery', 'Take Photo'],
                        cancelButtonIndex: 0,
                    },
                    buttonIndex => {
                        if (buttonIndex === 1) {
                            handleImagePick();
                        } else if (buttonIndex === 2) {
                            handleTakePhoto();
                        }
                    }
                );
            } else {
                Alert.alert(
                    'Select Image',
                    'Choose a photo from gallery or take a new one',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Select from Gallery', onPress: handleImagePick },
                        { text: 'Take Photo', onPress: handleTakePhoto }
                    ]
                );
            }
        }
    };

    const handleImagePick = async () => {
        if (isEditing) {
            MediaService.selectImageFromGallery((result) => {
                if (!result.canceled) {
                    setSelectedImage(result.assets[0]);
                    setImageURL(result.assets[0].uri);
                }
            });
        }
    };

    const handleTakePhoto = async () => {
        if (isEditing) {
            MediaService.takePhoto((result) => {
                if (!result.canceled) {
                    setSelectedImage(result.assets[0]);
                    setImageURL(result.assets[0].uri);
                }
            });
        }
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
            navigation.reset({
                index: 0,
                routes: [{ name: ROUTES.LOGIN }],
            });
        } catch (error) {
            Alert.alert('Logout Error', error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.titleContainer}>
                <View style={{ width: 28, height: 28, }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <AntDesign name="arrowleft" size={28} color="#004643" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.title}>Profile</Text>
                <View style={{ width: 28, height: 28, }}>
                    <TouchableOpacity onPress={handleLogout}>
                        <Entypo name="log-out" size={28} color="#004643" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.infoSection}>
                <TouchableOpacity onPress={handleImageSelection} disabled={!isEditing}>
                    <Image source={imageURL ? { uri: imageURL } : IMGS.person} style={styles.image} />
                </TouchableOpacity>
                <Text style={styles.label}>Full Name</Text>
                {isEditing ? (
                    <TextInput
                        style={styles.input}
                        value={fullname}
                        onChangeText={setFullname}
                    />
                ) : (
                    <Text style={styles.value}>{user.fullname}</Text>
                )}
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{user.email}</Text>
            </View>
            <View style={styles.buttonSection}>
                {isEditing ? (
                    <TouchableOpacity style={styles.button} onPress={handleSave}>
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.button} onPress={handleEdit}>
                        <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 8,
        backgroundColor: '#fff',
    },
    titleContainer: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#004643',
    },
    infoSection: {
        flex: 1,
        padding: 8,
    },
    image: {
        width: 148,
        height: 148,
        alignSelf: 'center',
        borderRadius: 74,
        borderWidth: 1,
        borderColor: '#004643',
        padding: 2,
        marginBottom: 20,
    },
    label: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#004643',
        marginHorizontal: 10,
        marginBottom: 10,
    },
    value: {
        fontSize: 18,
        fontWeight: '400',
        marginBottom: 10,
        marginHorizontal: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        marginBottom: 10,
        fontSize: 18,
        marginHorizontal: 8,
        borderRadius: 5,
    },
    buttonSection: {
        marginBottom: 20,
        marginHorizontal: 15,
    },
    button: {
        backgroundColor: '#004643',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;
