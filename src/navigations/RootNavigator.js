import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import DrawerNavigator from './DrawerNavigator';
import { AuthService } from '../services';
import { ROUTES } from '../constants';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [loading, setLoading] = useState(true);

    const authService = new AuthService();

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            try {
                const user = await authService.getCurrentUser();
                setIsLoggedIn(!!user);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        checkUserLoggedIn();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#004643" />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isLoggedIn ? (
                <Stack.Screen name={ROUTES.DRAWER} component={DrawerNavigator} />
            ) : (
                <Stack.Screen name={ROUTES.AUTH} component={AuthNavigator} />
            )}
        </Stack.Navigator>
    );
};

export default RootNavigator;
