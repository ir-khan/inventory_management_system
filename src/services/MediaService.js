import { RequestCamera, RequestMediaLibrary } from "../components/RequestPermissions";
import * as ImagePicker from 'expo-image-picker';

class MediaService {
    static async selectImageFromGallery(callback) {
        const status = await RequestMediaLibrary();
        if (status === 'granted') {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
            callback(result);
        }
    }

    static async takePhoto(callback) {
        const status = await RequestCamera();
        if (status === 'granted') {
            let result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
            callback(result);
        }
    }
}

export default MediaService;
