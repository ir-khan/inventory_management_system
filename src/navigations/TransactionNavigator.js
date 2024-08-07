import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components';
import { BuyProductScreen, SellProductScreen, HistoryProductScreen } from '../screens';
import { ROUTES } from '../constants';

const Tab = createMaterialTopTabNavigator();

const TransactionNavigator = ({ navigation }) => {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', }}>
            <Header
                title="Transactions"
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
                    name={ROUTES.BUY}
                    component={BuyProductScreen}
                    options={{ tabBarLabel: 'Buy' }}
                />
                <Tab.Screen
                    name={ROUTES.SELL}
                    component={SellProductScreen}
                    options={{ tabBarLabel: 'Sell' }}
                />
                <Tab.Screen
                    name={ROUTES.HISTORY}
                    component={HistoryProductScreen}
                    options={{ tabBarLabel: 'History' }}
                />
            </Tab.Navigator>
        </SafeAreaView>
    );
};

export default TransactionNavigator;
