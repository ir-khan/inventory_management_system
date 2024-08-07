import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Modal, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DatabaseService, AuthService } from '../services';
import { Employee } from '../models';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DropDownPicker from 'react-native-dropdown-picker';

const AddEmployeeScreen = ({ navigation }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [department, setDepartment] = useState(null);
    const [open, setOpen] = useState(false);
    const [departments, setDepartments] = useState([
        { label: 'Account Sales', value: 'Account Sales' },
        { label: 'HR', value: 'HR' },
    ]);
    const [joiningDate, setJoiningDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalIcon, setModalIcon] = useState(null);

    const databaseService = new DatabaseService();
    const authService = new AuthService();

    const handleAddEmployee = async () => {
        if (!firstName || !lastName || !email || !password || !confirmPassword || !department || !joiningDate) {
            setModalIcon('error');
            setModalMessage('All fields are required.');
            setModalVisible(true);
            return;
        }

        if (password !== confirmPassword) {
            setModalIcon('error');
            setModalMessage('Passwords do not match.');
            setModalVisible(true);
            return;
        }

        try {
            setLoading(true);

            const currentUser = await authService.getCurrentUser();
            if (!currentUser) {
                setModalIcon('error');
                setModalMessage('Unable to get current user.');
                setModalVisible(true);
                setLoading(false);
                return;
            }

            const employeeId = await databaseService.createEmployeeDocument();
            console.log("Generated employee ID: ", employeeId);
            if (!employeeId) {
                setModalIcon('error');
                setModalMessage('Failed to create employee document.');
                setModalVisible(true);
                setLoading(false);
                return;
            }

            const employee = new Employee({
                employerId: currentUser.uid,
                eid: employeeId,
                firstName: firstName,
                lastName: lastName,
                email: email,
                department: department || null,
                joiningDate: joiningDate ? joiningDate.toISOString() : null,
                password: password,
            });

            const success = await databaseService.addEmployee(employee);
            if (success) {
                const updateSuccess = await databaseService.updateUserProfile({
                    uid: currentUser.uid,
                    newEid: employeeId
                });

                if (updateSuccess) {
                    setModalIcon('success');
                    setModalMessage('Employee added successfully.');
                } else {
                    setModalIcon('warning');
                    setModalMessage('Employee added, but failed to update user profile.');
                }

                setModalVisible(true);
                setTimeout(() => {
                    setModalVisible(false);
                    navigation.goBack();
                }, 3000);
            } else {
                setModalIcon('error');
                setModalMessage('Failed to add employee.');
                setModalVisible(true);
            }
        } catch (error) {
            setModalIcon('error');
            setModalMessage(error.message);
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDateConfirm = (date) => {
        setJoiningDate(date);
        setShowDatePicker(false);
    };

    const handleDateCancel = () => {
        setShowDatePicker(false);
    };

    const formatDate = (date) => {
        return date
            ? date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            })
            : 'dd/mm/yyyy';
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.titleContainer}>
                <View style={{ width: 28, height: 28 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <AntDesign name="arrowleft" size={28} color="#004643" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.title}>Add Employee</Text>
                <View style={{ width: 28, height: 28 }}></View>
            </View>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.content}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="First Name"
                        value={firstName}
                        onChangeText={setFirstName}
                    />
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Last Name"
                        value={lastName}
                        onChangeText={setLastName}
                    />
                    <Text style={styles.label}>Email ID</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Email ID"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize='none'
                    />
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry={true}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        secureTextEntry={true}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    <Text style={styles.label}>Department</Text>
                    <View style={open ? styles.pickerContainerOpen : styles.pickerContainer}>
                        <DropDownPicker
                            open={open}
                            value={department}
                            items={departments}
                            setOpen={setOpen}
                            setValue={setDepartment}
                            setItems={setDepartments}
                            style={styles.picker}
                            placeholder="Select Department"
                            placeholderStyle={styles.placeholderText}
                            dropDownContainerStyle={[styles.dropDownPickerContainer, Platform.OS === 'android' && { backgroundColor: '#fff' }]}
                            zIndex={5000}
                        />
                    </View>
                    <Text style={styles.label}>Joining Date</Text>
                    <View style={styles.datePickerContainer}>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                            <Text style={joiningDate ? styles.datePickerText : styles.placeholderText}>
                                {formatDate(joiningDate)}
                            </Text>
                        </TouchableOpacity>
                        <DateTimePickerModal
                            isVisible={showDatePicker}
                            mode="date"
                            onConfirm={handleDateConfirm}
                            onCancel={handleDateCancel}
                            date={joiningDate || new Date()}
                        />
                    </View>
                    <View style={styles.buttonSection}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleAddEmployee}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Add</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
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
        padding: 8,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    titleContainer: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#004643',
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        marginTop: 10,
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
    pickerContainer: {
        borderRadius: 5,
        marginBottom: 15,
        zIndex: 1,
    },
    pickerContainerOpen: {
        borderRadius: 5,
        marginBottom: 15,
        zIndex: 5000,
    },
    picker: {
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        height: 50,
    },
    dropDownPickerContainer: {
        borderColor: '#ccc',
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
        color: '#999',
    },
    buttonSection: {
        alignItems: 'center',
        marginTop: 50,
    },
    button: {
        backgroundColor: '#004643',
        padding: 13,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 20,
    },
    modalText: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        marginVertical: 20,
    },
    closeButton: {
        backgroundColor: '#004643',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
});

export default AddEmployeeScreen;
