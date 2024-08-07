import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import {
    DrawerItem,
    DrawerItemList,
} from '@react-navigation/drawer';
import { IMGS, ROUTES } from '../constants';
import { AuthService, DatabaseService } from '../services';
import { Ionicons } from 'react-native-vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import LocalStorageService from '../services/LocalStorageService';

const CustomDrawer = (props) => {
    const { navigation } = props;

    const [userData, setUserData] = useState({});
    const [imageURL, setImageURL] = useState(null);

    const authService = new AuthService();
    const dataBaseSevice = new DatabaseService();

    useEffect(() => {
        getUserData();
    }, []);

    const getUserData = async () => {
        let data = await LocalStorageService.getUser();
        if (!data) {
            data = await dataBaseSevice.getUserProfile();
            if (data) {
                await LocalStorageService.saveUser(data);
            }
        }
        if (data) {
            setUserData(data);
            setImageURL(data.pfpURL || IMGS.person);
        }
    };

    return (
        <SafeAreaView style={styles.drawerContainer}>
            <View style={styles.profileSection}>
                <Image source={imageURL ? { uri: imageURL } : IMGS.person} style={styles.profileImage} />
                <Text style={styles.profileName}>{userData.fullname}</Text>
            </View>
            <View>
                <DrawerItemList {...props} />
            </View>
        </SafeAreaView>
    );
};

export default CustomDrawer;

const styles = StyleSheet.create({
    drawerContainer: {
        flex: 1,
        paddingTop: 20,
        backgroundColor: '#004643',
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    profileName: {
        marginTop: 10,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    drawerLabelStyle: {
        marginLeft: -20,
        fontSize: 16,
        color: '#fff',
    },
});
