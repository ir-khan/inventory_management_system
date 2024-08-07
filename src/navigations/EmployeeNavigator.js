import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EmployeeDetailsScreen, AddEmployeeScreen } from '../screens';
import { ROUTES } from '../constants';

const Stack = createNativeStackNavigator();

const EmployeeNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name={ROUTES.EMPLOYEEDETAILS} component={EmployeeDetailsScreen} />
            <Stack.Screen name={ROUTES.ADDEMPLOYEE} component={AddEmployeeScreen} />
        </Stack.Navigator>
    );
};

export default EmployeeNavigator;
