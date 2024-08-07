import * as ImagePicker from 'expo-image-picker';

const RequestMediaLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status;
}

const RequestCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status;
}

export { RequestMediaLibrary, RequestCamera };