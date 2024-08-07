import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen, RegisterScreen, ForgotPasswordScreen } from '../screens';
import DrawerNavigator from './DrawerNavigator';
import { ROUTES } from '../constants';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName={ROUTES.LOGIN}
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
            <Stack.Screen name={ROUTES.SIGNUP} component={RegisterScreen} />
            <Stack.Screen name={ROUTES.FORGOTPASSWORD} component={ForgotPasswordScreen} />
            <Stack.Screen name={ROUTES.DRAWER} component={DrawerNavigator} />
        </Stack.Navigator>
    );
};

export default AuthNavigator;
