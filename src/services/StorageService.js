import { storage } from "../../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

class StorageService {

    async uploadUserPfp(filePath, uid) {
        try {
            if (uid && filePath) {
                const fileExtension = filePath.split('.').pop();
                const storagePath = `users/pfps/${uid}.${fileExtension}`;
                const userPfpRef = ref(storage, storagePath);

                const response = await fetch(filePath);
                const blob = await response.blob();

                const uploadTask = uploadBytesResumable(userPfpRef, blob);

                return new Promise((resolve, reject) => {
                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            // Handle progress if needed
                        },
                        (error) => {
                            console.error("Error uploading profile picture: ", error);
                            reject(error);
                        },
                        async () => {
                            try {
                                const downloadURL = await getDownloadURL(userPfpRef);
                                resolve(downloadURL);
                            } catch (error) {
                                console.error("Error getting download URL: ", error);
                                reject(error);
                            }
                        }
                    );
                });
            } else {
                throw new Error("No user UID provided or filePath");
            }
        } catch (error) {
            console.error("Error in uploadUserPfp method: ", error);
            throw error;
        }
    }
}

export default StorageService;