import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DatabaseService from '../services/DatabaseService';
import { Product, Transaction } from '../models';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BuyProductScreen = () => {
    const [productCode, setProductCode] = useState('');
    const [productName, setProductName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [expireDate, setExpireDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalIcon, setModalIcon] = useState(null);

    const dbService = new DatabaseService();

    const handleConfirm = (date) => {
        setExpireDate(date.toISOString());
        setDatePickerVisibility(false);
    };

    const handleBuy = async () => {
        const currentUser = await dbService.authService.getCurrentUser();

        if (!currentUser) {
            showModal('error', 'No current user found');
            return;
        }

        if (!productCode || !productName || !quantity || !price || !expireDate) {
            showModal('error', 'Please fill in all fields');
            return;
        }

        if (isNaN(productCode) || parseInt(productCode, 10) <= 0) {
            showModal('error', 'Product code must be a valid positive integer');
            return;
        }

        const today = new Date();
        const expireDateObj = new Date(expireDate);

        if (expireDateObj <= today) {
            showModal('error', 'Expiration date must be greater than today');
            return;
        }

        try {
            setLoading(true);

            const existingProductId = await dbService.checkProductExists(parseInt(productCode, 10), currentUser.uid);
            let productId;
            if (existingProductId) {
                productId = existingProductId;
                const productUpdateResult = await dbService.updateProduct({
                    pid: productId,
                    newPName: productName,
                    newPQty: parseInt(quantity, 10),
                    newPExpire: expireDate,
                    newPCode: parseInt(productCode, 10),
                    newUid: currentUser.uid
                });
                if (!productUpdateResult) {
                    showModal('error', 'Failed to update product');
                    setLoading(false);
                    return;
                }
            } else {
                productId = await dbService.createProductDocument();
                if (!productId) {
                    showModal('error', 'Failed to create product document');
                    setLoading(false);
                    return;
                }
                const product = new Product({
                    pid: productId,
                    pName: productName,
                    pQty: parseInt(quantity, 10),
                    pExpire: expireDate,
                    pCode: parseInt(productCode, 10),
                    uid: currentUser.uid,
                });
                const productUpdateResult = await dbService.addProduct(productId, product.toJSON());
                if (!productUpdateResult) {
                    showModal('error', 'Failed to add product');
                    setLoading(false);
                    return;
                }
            }

            const transaction = new Transaction({
                transactionId: await dbService.createTransactionDocument(),
                uid: currentUser.uid,
                productId: productId,
                pName: productName,
                pCode: parseInt(productCode, 10),
                quantity: parseInt(quantity, 10),
                price: parseFloat(price),
                type: 'Buy',
                timestamp: new Date().toISOString(),
            });

            const transactionResult = await dbService.addTransaction(transaction.transactionId, transaction.toJSON());
            if (!transactionResult) {
                showModal('error', 'Failed to create transaction');
                setLoading(false);
                return;
            }

            const userProfileUpdateResult = await dbService.updateUserProfile({
                uid: currentUser.uid,
                newPid: productId,
                newTransaction: transaction.transactionId,
            });

            if (userProfileUpdateResult) {
                showModal('success', 'Product purchased');
                clearFields();
            } else {
                showModal('error', 'Product purchased and transaction created but failed to update user');
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
    };

    const clearFields = () => {
        setProductCode('');
        setProductName('');
        setQuantity('');
        setPrice('');
        setExpireDate(null);
    };

    const handleDateCancel = () => {
        setDatePickerVisibility(false);
    };

    const formatDate = (date) => {
        return date
            ? new Date(date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            })
            : 'dd/mm/yyyy';
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
                <Text style={styles.label}>Expiration Date</Text>
                <View style={styles.datePickerContainer}>
                    <TouchableOpacity onPress={() => setDatePickerVisibility(true)}>
                        <Text style={expireDate ? styles.datePickerText : styles.placeholderText}>
                            {formatDate(expireDate)}
                        </Text>
                    </TouchableOpacity>
                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date"
                        onConfirm={handleConfirm}
                        onCancel={handleDateCancel}
                    />
                </View>
                <View style={styles.buttonSection}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleBuy}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Buy</Text>
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
    datePickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 15,
        padding: 10,
        justifyContent: 'center',
    },
    datePickerText: {
        fontSize: 18,
        color: '#000',
    },
    placeholderText: {
        fontSize: 18,
        color: '#ccc',
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

export default BuyProductScreen;
