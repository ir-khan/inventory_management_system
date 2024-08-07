import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import DatabaseService from '../services/DatabaseService';

const HistoryProductScreen = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const dbService = new DatabaseService();

    useEffect(() => {
        const unsubscribe = dbService.getRecentTransactionsRealtime(
            (recentTransactions) => {
                setTransactions(recentTransactions);
                setLoading(false);
            },
            (err) => {
                setError('Error fetching transactions');
                setLoading(false);
            }
        );

        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, []);

    const renderHeader = () => (
        <View style={[styles.itemContainer, styles.headerContainer]}>
            <Text style={[styles.itemText, styles.headerText, { width: 50 }]}>Code</Text>
            <Text style={[styles.itemText, styles.headerText, { width: 40 }]}>Type</Text>
            <Text style={[styles.itemText, styles.headerText, { width: 100 }]}>Name</Text>
            <Text style={[styles.itemText, styles.headerText, { width: 40 }]}>Qty</Text>
            <Text style={[styles.itemText, styles.headerText, { width: 70 }]}>Rate</Text>
        </View>
    );

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <Text style={[styles.itemText, { width: 50 }]}>{item.pCode}</Text>
            <Text style={[styles.itemText, { width: 40 }]}>{item.type}</Text>
            <Text style={[styles.itemText, { width: 100 }]}>{item.pName}</Text>
            <Text style={[styles.itemText, { width: 40 }]}>{item.quantity}</Text>
            <Text style={[styles.itemText, { width: 70 }]}>{item.price.toFixed(2)}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#004643" />
                <Text>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={transactions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerContainer: {
        backgroundColor: '#004643',
        padding: 10,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 16,
        textAlign: 'center',
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default HistoryProductScreen;
