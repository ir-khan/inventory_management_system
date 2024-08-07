import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components';
import { InventoryScreen, ExpireScreen } from '../screens';
import { ROUTES } from '../constants';

const Tab = createMaterialTopTabNavigator();

const InventoryNavigator = ({ navigation }) => {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', }}>
            <Header
                title="Inventory"
                navigation={navigation}
            />
            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: '#004643',
                    tabBarInactiveTintColor: '#004643',
                    tabBarLabelStyle: { fontSize: 16 },
                    tabBarStyle: { backgroundColor: '#fff' },
                    tabBarIndicatorStyle: { backgroundColor: '#004643' },
                }}
            >
                <Tab.Screen
                    name={ROUTES.INVENTORY}
                    component={InventoryScreen}
                    options={{ tabBarLabel: 'Inventory' }}
                />
                <Tab.Screen
                    name={ROUTES.EXPIRE}
                    component={ExpireScreen}
                    options={{ tabBarLabel: 'Expire' }}
                />
            </Tab.Navigator>
        </SafeAreaView>
    );
};

export default InventoryNavigator;
