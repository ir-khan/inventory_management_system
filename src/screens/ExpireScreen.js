import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import DatabaseService from '../services/DatabaseService';
import Product from '../models/Product';

const ExpireScreen = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [daysLeft, setDaysLeft] = useState(7);
    const databaseService = new DatabaseService();

    useEffect(() => {
        const unsubscribe = databaseService.getProductsRealtime(
            (productData) => {
                const productsList = productData.map(data => Product.fromJSON(data));
                setProducts(productsList);
                filterProducts(productsList, daysLeft);
                setLoading(false);
            },
            (err) => {
                setError('Error fetching products');
                setLoading(false);
            }
        );

        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            } else {
                console.error("Expected unsubscribe to be a function, but got: ", unsubscribe);
            }
        };
    }, []);

    useEffect(() => {
        filterProducts(products, daysLeft);
    }, [daysLeft, products]);

    const filterProducts = (productsList, days) => {
        const now = new Date();
        const filtered = productsList.filter(product => {
            const expireDate = new Date(product.pExpire);
            const diffTime = expireDate - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays === days;
        });
        setFilteredProducts(filtered);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    };

    const renderProduct = ({ item }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">{item.pCode}</Text>
            <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">{item.pName}</Text>
            <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">{item.pQty}</Text>
            <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">{formatDate(item.pExpire)}</Text>
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
            <SegmentedControl
                values={['1', '2', '3', '4', '5', '6', '7']}
                selectedIndex={daysLeft - 1} // Set selectedIndex based on daysLeft
                onChange={(event) => {
                    const selectedDays = event.nativeEvent.selectedSegmentIndex + 1;
                    setDaysLeft(selectedDays);
                }}
                style={styles.segmentedControl}
            />
            <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.pid}
                ListHeaderComponent={renderHeader}
            />
        </View>
    );
};

const renderHeader = () => (
    <View style={[styles.itemContainer, styles.headerContainer]}>
        <Text style={[styles.itemText, styles.headerText]}>Code</Text>
        <Text style={[styles.itemText, styles.headerText]}>Name</Text>
        <Text style={[styles.itemText, styles.headerText]}>Qty</Text>
        <Text style={[styles.itemText, styles.headerText]}>Expire</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
    },
    segmentedControl: {
        marginHorizontal: 16,
        marginBottom: 10,
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
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    headerContainer: {
        backgroundColor: '#004643',
        padding: 10,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 16,
        width: 80,
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

export default ExpireScreen;
