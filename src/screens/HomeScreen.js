import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { ROUTES } from '../constants';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { DatabaseService } from '../services';
import debounce from 'lodash.debounce';

const HomeScreen = ({ navigation }) => {
    const [totalGrossSales, setTotalGrossSales] = useState([]);
    const [salesPerItem, setSalesPerItem] = useState([]);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const dbService = new DatabaseService();

    useEffect(() => {
        const calculateDates = () => {
            const now = new Date();
            const defaultStartDate = new Date(now.setMonth(now.getMonth() - 1));
            setStartDate(defaultStartDate);
        };

        calculateDates();
    }, []);

    const fetchSales = async () => {
        const handleSuccess = (transactions) => {
            console.log("Fetched Transactions: ", transactions);

            const totalSalesMap = transactions.reduce((acc, transaction) => {
                const date = new Date(transaction.timestamp);
                const dateStr = date.toISOString().split('T')[0]; // Ensure only the date part is used

                if (!acc.total[dateStr]) {
                    acc.total[dateStr] = 0;
                }
                acc.total[dateStr] += transaction.price;

                if (!acc.product[transaction.pName]) {
                    acc.product[transaction.pName] = 0;
                }
                acc.product[transaction.pName] += transaction.price;

                return acc;
            }, { total: {}, product: {} });

            console.log("Total Sales Map: ", totalSalesMap); // Check the aggregation result

            const sortedDates = Object.keys(totalSalesMap.total).sort();
            const formattedSalesData = sortedDates.map(date => {
                const [year, month, day] = date.split('-');
                const formattedDate = `${day}/${month}`; // Format: dd/mm
                return {
                    value: totalSalesMap.total[date],
                    label: formattedDate,
                };
            });

            console.log("Formatted Sales Data: ", formattedSalesData);
            setTotalGrossSales(formattedSalesData);

            const formattedProductData = Object.entries(totalSalesMap.product).map(([pName, total]) => ({
                value: total,
                label: pName,
            }));

            console.log("Formatted Product Data: ", formattedProductData);
            setSalesPerItem(formattedProductData);
        };

        const handleError = (error) => {
            console.error("Error fetching sales data: ", error);
        };

        console.log("Fetching sales from:", startDate.toISOString(), "to", endDate.toISOString());

        dbService.getTotalSales(startDate.toISOString(), endDate.toISOString(), handleSuccess, handleError);
    };

    const debouncedFetchSales = useMemo(() => debounce(fetchSales, 500), [startDate, endDate]);

    useEffect(() => {
        debouncedFetchSales();
        return () => debouncedFetchSales.cancel();
    }, [startDate, endDate]);

    const onStartDateChange = (date) => {
        setStartDate(date);
        setShowStartDatePicker(false);
    };

    const onEndDateChange = (date) => {
        setEndDate(date);
        setShowEndDatePicker(false);
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

    const emptyChartData = [{ value: 0, label: '' }];

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title={'Index'}
                navigation={navigation}
                rightComponent={
                    <TouchableOpacity
                        onPress={() => navigation.navigate(ROUTES.PROFILE)}
                    >
                        <FontAwesome5 name="user-alt" size={23} color="#004643" />
                    </TouchableOpacity>
                }
            />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Select Date Range</Text>
                <View style={styles.datePickerRow}>
                    <View style={styles.datePickerContainer}>
                        <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
                            <Text style={startDate ? styles.datePickerText : styles.placeholderText}>
                                {formatDate(startDate)}
                            </Text>
                        </TouchableOpacity>
                        <DateTimePickerModal
                            isVisible={showStartDatePicker}
                            mode="date"
                            onConfirm={onStartDateChange}
                            onCancel={() => setShowStartDatePicker(false)}
                            date={startDate || new Date()}
                        />
                    </View>
                    <View style={styles.datePickerContainer}>
                        <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
                            <Text style={endDate ? styles.datePickerText : styles.placeholderText}>
                                {formatDate(endDate)}
                            </Text>
                        </TouchableOpacity>
                        <DateTimePickerModal
                            isVisible={showEndDatePicker}
                            mode="date"
                            onConfirm={onEndDateChange}
                            onCancel={() => setShowEndDatePicker(false)}
                            date={endDate || new Date()}
                        />
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.fetchButton, { backgroundColor: startDate && endDate ? '#004643' : '#ccc' }]}
                    onPress={() => debouncedFetchSales()}
                    disabled={!startDate || !endDate}
                >
                    <Text style={styles.buttonText}>Fetch Sales</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Total Gross Sales</Text>
                <View style={styles.chartContainer}>
                    <LineChart
                        data={totalGrossSales.length > 0 ? totalGrossSales : emptyChartData}
                        height={220}
                        width={350}
                        isAnimated
                        color="#004643"
                        yAxisColor={'#004643'}
                        xAxisColor={'#004643'}
                        showDots={false}
                        xAxisLabelTextStyle={{ color: '#004643', fontSize: 8 }}
                    />
                </View>
                <Text style={styles.title}>Sales Per Item</Text>
                <View style={styles.chartContainer}>
                    <BarChart
                        data={salesPerItem.length > 0 ? salesPerItem : emptyChartData}
                        height={220}
                        width={350}
                        isAnimated
                        color={'#004643'}
                        yAxisColor={'#004643'}
                        xAxisColor={'#004643'}
                        xAxisLabelTextStyle={{ color: '#004643', fontSize: 8 }}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 8,
        backgroundColor: '#fff',
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
        color: '#004643',
    },
    datePickerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 15,
    },
    datePickerContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginHorizontal: 5,
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
    fetchButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 5,
        marginBottom: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    chartContainer: {
        marginBottom: 20,
    },
});

export default HomeScreen;
