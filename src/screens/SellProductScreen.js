import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DatabaseService from '../services/DatabaseService';
import { Product, Transaction } from '../models';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SellProductScreen = () => {
    const [productCode, setProductCode] = useState('');
    const [productName, setProductName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalIcon, setModalIcon] = useState(null);

    const dbService = new DatabaseService();

    const handleSell = async () => {
        const currentUser = await dbService.authService.getCurrentUser();

        if (!currentUser) {
            showModal('error', 'No current user found');
            return;
        }

        if (!productCode || !productName || !quantity || !price) {
            showModal('error', 'Please fill in all fields');
            return;
        }

        if (isNaN(productCode) || parseInt(productCode, 10) <= 0) {
            showModal('error', 'Product code must be a valid positive integer');
            return;
        }

        try {
            setLoading(true);

            const existingProductId = await dbService.checkProductExists(parseInt(productCode, 10), currentUser.uid);

            if (!existingProductId) {
                showModal('error', 'Product does not exist');
                setLoading(false);
                return;
            }

            const productDoc = await dbService.getProduct(existingProductId);
            if (!productDoc) {
                showModal('error', 'Failed to retrieve product details');
                setLoading(false);
                return;
            }

            if (productDoc.pQty < parseInt(quantity, 10)) {
                showModal('error', 'Insufficient product quantity');
                setLoading(false);
                return;
            }

            const productUpdateResult = await dbService.updateProduct({
                pid: existingProductId,
                newPName: productName,
                newPQty: productDoc.pQty - parseInt(quantity, 10),
                newPCode: parseInt(productCode, 10),
                newUid: currentUser.uid
            });

            if (!productUpdateResult) {
                showModal('error', 'Failed to update product');
                setLoading(false);
                return;
            }

            const transactionId = await dbService.createTransactionDocument();
            if (!transactionId) {
                showModal('error', 'Failed to create transaction document');
                setLoading(false);
                return;
            }

            const transaction = new Transaction({
                transactionId: transactionId,
                uid: currentUser.uid,
                productId: existingProductId,
                pName: productName,
                pCode: parseInt(productCode, 10),
                quantity: parseInt(quantity, 10),
                price: parseFloat(price),
                type: 'Sell',
                timestamp: new Date().toISOString(),
            });

            const transactionResult = await dbService.addTransaction(transactionId, transaction.toJSON());
            if (!transactionResult) {
                showModal('error', 'Failed to create transaction');
                setLoading(false);
                return;
            }

            const userProfileUpdateResult = await dbService.updateUserProfile({
                uid: currentUser.uid,
                newPid: existingProductId,
                newTransaction: transactionId,
            });

            if (userProfileUpdateResult) {
                showModal('success', 'Product sold');
            } else {
                showModal('error', 'Product sold and transaction created but failed to update user');
            }
        } catch (error) {
            showModal('error', 'An unexpected error occurred');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const showModal = (icon, message) => {
        setModalIcon(icon);
        setModalMessage(message);
        setModalVisible(true);
        if (icon === 'success') {
            setProductCode('');
            setProductName('');
            setQuantity('');
            setPrice('');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.label}>Product Code</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Product Code"
                    value={productCode}
                    onChangeText={(text) => setProductCode(text.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                />
                <Text style={styles.label}>Product Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Product Name"
                    value={productName}
                    onChangeText={setProductName}
                />
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Quantity"
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                />
                <Text style={styles.label}>Price</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Price"
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                />
                <View style={styles.buttonSection}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSell}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Sell</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(!modalVisible)}
            >
                <View style={styles.modalView}>
                    <Icon
                        name={modalIcon === 'success' ? 'check-circle' : 'error'}
                        size={40}
                        color={modalIcon === 'success' ? 'green' : 'red'}
                    />
                    <Text style={styles.modalText}>{modalMessage}</Text>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setModalVisible(!modalVisible)}
                    >
                        <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 8,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 10,
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#004643',
        paddingHorizontal: 3,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 15,
        fontSize: 18,
        borderRadius: 5,
    },
    buttonSection: {
        paddingVertical: 15,
    },
    button: {
        backgroundColor: '#004643',
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 20,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        color: 'white',
    },
    closeButton: {
        backgroundColor: '#004643',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
});

export default SellProductScreen;
