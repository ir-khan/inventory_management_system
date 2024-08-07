import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { ROUTES } from '../constants';
import DatabaseService from '../services/DatabaseService';
import { useFocusEffect } from '@react-navigation/native';

const EmployeeDetailsScreen = ({ navigation }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const databaseService = new DatabaseService();

    const fetchEmployees = useCallback(async () => {
        try {
            setLoading(true);
            const employeeData = await databaseService.getEmployees();
            setEmployees(employeeData);
        } catch (err) {
            setError('Failed to load employees.');
        } finally {
            setLoading(false);
        }
    }, [databaseService]);

    useFocusEffect(
        useCallback(() => {
            fetchEmployees();
        }, [])
    );

    const handleDeleteEmployee = async (id) => {
        try {
            await databaseService.deleteEmployee(id);
            setEmployees((prevEmployees) => prevEmployees.filter(employee => employee.id !== id));
        } catch (err) {
            setError('Failed to delete employee.');
        }
    };

    const renderEmployeeItem = ({ item }) => (
        <View style={styles.employeeItem}>
            <Text style={styles.employeeName}>{item.firstName} {item.lastName}</Text>
            <Text style={styles.employeeEmail}>{item.email}</Text>
            <Text style={styles.employeeDepartment}>{item.department}</Text>
            <Text style={styles.employeeJoiningDate}>Joining Date: {new Date(item.joiningDate).toLocaleDateString()}</Text>
            <TouchableOpacity
                onPress={() => handleDeleteEmployee(item.id)}
                style={styles.deleteButton}
            >
                <FontAwesome name="trash" size={24} color="#ccc" />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header 
                    title="Employees" 
                    navigation={navigation}
                    rightComponent={
                        <TouchableOpacity
                            onPress={() => navigation.navigate(ROUTES.ADDEMPLOYEE)}
                        >
                            <MaterialIcons name="person-add-alt-1" size={28} color="#004643" />
                        </TouchableOpacity>
                    } 
                />
                <View style={styles.content}>
                    <ActivityIndicator size="large" color="#004643" />
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <Header 
                    title="Employees" 
                    navigation={navigation}
                    rightComponent={
                        <TouchableOpacity
                            onPress={() => navigation.navigate(ROUTES.ADDEMPLOYEE)}
                        >
                            <MaterialIcons name="person-add-alt-1" size={28} color="#004643" />
                        </TouchableOpacity>
                    } 
                />
                <View style={styles.content}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header 
                title="Employees" 
                navigation={navigation}
                rightComponent={
                    <TouchableOpacity
                        onPress={() => navigation.navigate(ROUTES.ADDEMPLOYEE)}
                    >
                        <MaterialIcons name="person-add-alt-1" size={28} color="#004643" />
                    </TouchableOpacity>
                } 
            />
            <FlatList
                data={employees}
                renderItem={renderEmployeeItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={<Text style={styles.emptyText}>No employees found.</Text>}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
    },
    errorText: {
        color: 'red',
        fontSize: 18,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
    },
    listContainer: {
        padding: 10,
        paddingVertical: 7,
        paddingHorizontal: 15,
    },
    employeeItem: {
        backgroundColor: '#f7f7f7',
        paddingVertical: 7,
        paddingHorizontal: 15,
        marginHorizontal: 5,
        marginBottom: 15,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
        position: 'relative',
    },
    employeeName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#004643',
    },
    employeeEmail: {
        fontSize: 16,
        color: '#555',
        marginTop: 3,
    },
    employeeDepartment: {
        fontSize: 14,
        color: '#777',
        marginTop: 3,
    },
    employeeJoiningDate: {
        fontSize: 14,
        color: '#777',
        marginTop: 3,
    },
    deleteButton: {
        position: 'absolute',
        top: 20,
        right: 20,
    },
});

export default EmployeeDetailsScreen;
