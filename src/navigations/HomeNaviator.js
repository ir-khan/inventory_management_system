import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen, ProfileScreen } from '../screens';
import { ROUTES } from '../constants';

const Stack = createNativeStackNavigator();

const HomeNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name={ROUTES.HOME} component={HomeScreen} />
            <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
        </Stack.Navigator>
    );
};

export default HomeNavigator;
