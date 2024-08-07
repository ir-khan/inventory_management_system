import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, ActivityIndicator } from 'react-native';
import DatabaseService from '../services/DatabaseService';
import Product from '../models/Product';

const InventoryScreen = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const databaseService = new DatabaseService();

    useEffect(() => {
        const unsubscribe = databaseService.getProductsRealtime(
            (productData) => {
                const productsList = productData.map(data => Product.fromJSON(data));
                setProducts(productsList);
                setFilteredProducts(productsList);
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
        const results = products.filter(product =>
            product.pName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredProducts(results);
    }, [searchQuery, products]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = String(date.getUTCFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    };

    const renderHeader = () => (
        <View style={[styles.itemContainer, styles.headerContainer]}>
            <Text style={[styles.itemText, styles.headerText]}>Code</Text>
            <Text style={[styles.itemText, styles.headerText]}>Name</Text>
            <Text style={[styles.itemText, styles.headerText]}>Qty</Text>
            <Text style={[styles.itemText, styles.headerText]}>Expire</Text>
        </View>
    );

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
            <View style={[styles.container, {
                justifyContent: 'center',
                alignItems: 'center',
            }]}>
                <ActivityIndicator size="small" color="#004643" />
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
            <TextInput
                style={styles.searchBox}
                placeholder="Search products..."
                value={searchQuery}
                onChangeText={setSearchQuery}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
    },
    searchBox: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
        backgroundColor: '#fff',
        marginHorizontal: 16,
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

export default InventoryScreen;
