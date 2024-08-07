import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import CustomDrawerButton from './CustomDrawerButton';

const Header = ({ title, navigation, rightComponent }) => {
    return (
        <View style={styles.header}>
            <CustomDrawerButton navigation={navigation} />
            <Text style={styles.headerTitle}>{title}</Text>
            {rightComponent ? (
                rightComponent
            ) : (
                <View style={{ width: 28, height: 28, }}></View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        paddingHorizontal: 12,
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#004643',
    },
});

export default Header;
