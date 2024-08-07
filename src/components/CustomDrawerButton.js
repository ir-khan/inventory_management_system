import React from 'react';
import { TouchableOpacity,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomDrawerButton = ({ navigation }) => {

    return (
        <TouchableOpacity
            onPress={() => navigation.openDrawer()}
        >
            <Ionicons name="menu" size={28} color="#004643" />
        </TouchableOpacity>
    );
};

export default CustomDrawerButton;
