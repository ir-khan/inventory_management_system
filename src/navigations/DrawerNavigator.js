import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { CustomDrawer } from '../components';
import { ROUTES } from '../constants';
import { Ionicons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import HomeNavigator from './HomeNaviator';
import InventoryNavigator from './InventoryNavigator';
import EmployeeNavigator from './EmployeeNavigator';
import TransactionNavigator from './TransactionNavigator';
import { StyleSheet, View } from 'react-native';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawer {...props} />}
            screenOptions={{
                headerShown: false,
                drawerActiveBackgroundColor: '#fff',
                drawerActiveTintColor: '#004643',
                drawerInactiveTintColor: '#fff',
                drawerLabelStyle: {
                    marginLeft: -20,
                    fontSize: 16,
                },
                drawerStyle: {
                    backgroundColor: '#004643',
                    width: '60%',
                },
            }}
        >
            <Drawer.Screen
                name={ROUTES.HOMENAVIGATOR}
                component={HomeNavigator}
                options={{
                    title: 'HomeNavigator',
                    drawerLabel: 'Index',
                    drawerIcon: ({ focused, color, size }) => {
                        let iconName = focused ? 'home' : 'home-outline';
                        return <View style={styles.iconContainer}>
                            <Ionicons name={iconName} size={size} color={color} />
                        </View>;
                    },
                }}
            />
            <Drawer.Screen
                name={ROUTES.INVENTORYNAVIGATOR}
                component={InventoryNavigator}
                options={{
                    title: 'InventoryNavigator',
                    drawerLabel: 'Inventory',
                    drawerIcon: ({ focused, color, size }) => {
                        let iconName = focused ? 'appstore1' : 'appstore-o';
                        return <View style={styles.iconContainer}>
                            <AntDesign name={iconName} size={size} color={color} />
                        </View>;
                    },
                }}
            />
            <Drawer.Screen
                name={ROUTES.EMPLOYEENAVIGATOR}
                component={EmployeeNavigator}
                options={{
                    title: 'EmployeeNavigator',
                    drawerLabel: 'Employee',
                    drawerIcon: ({ focused, color, size }) => {
                        let iconName = focused ? 'user-alt' : 'user';
                        return <View style={styles.iconContainer}>
                            <FontAwesome5 name={iconName} size={size} color={color} />
                        </View>;
                    },
                }}
            />
            <Drawer.Screen
                name={ROUTES.TRANSACTIONNAVIGATOR}
                component={TransactionNavigator}
                options={{
                    title: 'TransactionNavigator',
                    drawerLabel: 'Transactions',
                    drawerIcon: ({ focused, color, size }) => {
                        let iconName = focused ? 'money-bill' : 'money-bill-alt';
                        return <View style={styles.iconContainer}>
                            <FontAwesome5 name={iconName} size={size} color={color} />
                        </View>;
                    },
                }}
            />
        </Drawer.Navigator>
    );
};

export default DrawerNavigator;

const styles = StyleSheet.create({
    iconContainer: {
        width: 40,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
