import { database } from "../../firebase";
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, arrayUnion, deleteDoc, orderBy, limit, onSnapshot } from "firebase/firestore";
import AuthService from "./AuthService";
import LocalStorageService from './LocalStorageService';
import { UserProfile } from "../models";

class DatabaseService {
    #usersCollection;
    #employeesCollection;
    #productsCollection;
    #transactionsCollection;
    authService;

    constructor() {
        this.#setupCollectionReferences();
        this.authService = new AuthService();
    }

    #setupCollectionReferences() {
        this.#usersCollection = collection(database, "users");
        this.#employeesCollection = collection(database, "employees");
        this.#productsCollection = collection(database, "products");
        this.#transactionsCollection = collection(database, "transactions");
    }

    async createUserProfile(userProfile) {
        try {
            const userDoc = doc(this.#usersCollection, userProfile.uid);
            await setDoc(userDoc, userProfile.toJson());
            await LocalStorageService.saveUser(userProfile);
            console.log("User profile added successfully");
            return true;
        } catch (error) {
            console.error("Error adding user profile: ", error);
            return false;
        }
    }

    async updateUserProfile({ uid, newFullname = null, newPfpURL = null, newEid = null, newPid = null, newTransaction = null }) {
        try {
            const userDoc = doc(this.#usersCollection, uid);
            const data = {};

            if (newFullname !== null) data.fullname = newFullname;
            if (newPfpURL !== null) data.pfpURL = newPfpURL;
            if (newEid !== null) data.employees = arrayUnion(newEid);
            if (newPid !== null) data.products = arrayUnion(newPid);
            if (newTransaction !== null) data.transactions = arrayUnion(newTransaction);

            await updateDoc(userDoc, data);
            await LocalStorageService.updateUser({ uid, ...data });
            console.log("User profile updated successfully");
            return true;
        } catch (error) {
            console.error("Error updating user profile: ", error);
            return false;
        }
    }


    async getUserProfile() {
        try {
            const user = await this.authService.getCurrentUser();
            if (user) {
                const userDoc = doc(this.#usersCollection, user.uid);
                const docSnapshot = await getDoc(userDoc);
                if (docSnapshot.exists()) {
                    const userData = docSnapshot.data();
                    const userProfile = UserProfile.fromJson(userData);
                    await LocalStorageService.saveUser(userProfile);
                    return userProfile;
                } else {
                    console.error("User profile does not exist");
                    return null;
                }
            } else {
                console.error("User does not exist");
                return null;
            }
        } catch (error) {
            console.error("Error getting user profile: ", error);
            return null;
        }
    }

    async createEmployeeDocument() {
        try {
            const newDocRef = doc(this.#employeesCollection);
            return newDocRef.id;
        } catch (error) {
            console.error("Error creating empty employee document: ", error);
            return null;
        }
    }

    async addEmployee(employee) {
        try {
            const employeeDoc = doc(this.#employeesCollection, employee.eid);
            await setDoc(employeeDoc, employee.toJSON());
            console.log("Employee added successfully");
            return true;
        } catch (error) {
            console.error("Error adding employee: ", error);
            return false;
        }
    }

    async getEmployees() {
        try {
            const currentUser = await this.authService.getCurrentUser();
            if (!currentUser) {
                console.error("No current user found");
                return [];
            }

            const q = query(
                this.#employeesCollection,
                where("employerId", "==", currentUser.uid)
            );

            const employeeSnapshot = await getDocs(q);
            const employeeList = employeeSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return employeeList;
        } catch (error) {
            console.error("Error getting employees: ", error);
            return [];
        }
    }

    async deleteEmployee(employeeId) {
        try {
            const employeeDoc = doc(this.#employeesCollection, employeeId);
            await deleteDoc(employeeDoc);
            console.log("Employee deleted successfully");
            return true;
        } catch (error) {
            console.error("Error deleting employee: ", error);
            return false;
        }
    }

    async createProductDocument() {
        try {
            const newDocRef = doc(this.#productsCollection);
            return newDocRef.id;
        } catch (error) {
            console.error("Error creating empty product document: ", error);
            return null;
        }
    }

    async checkProductExists(pCode, uid) {
        try {
            const q = query(
                this.#productsCollection,
                where("pCode", "==", pCode),
                where("uid", "==", uid)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const docId = querySnapshot.docs[0].id;
                console.log("Product exists with ID:", docId);
                return docId;
            } else {
                console.log("Product does not exist");
                return null;
            }
        } catch (error) {
            console.error("Error checking product existence: ", error);
            return null;
        }
    }

    async addProduct(productId, productData) {
        try {
            const productDocRef = doc(this.#productsCollection, productId);
            await setDoc(productDocRef, productData);
            console.log("Product added successfully");
            return productDocRef.id;
        } catch (error) {
            console.error("Error adding product: ", error);
            return null;
        }
    }

    async getProduct(productId) {
        try {
            const productDoc = doc(this.#productsCollection, productId);
            const docSnapshot = await getDoc(productDoc);

            if (docSnapshot.exists()) {
                return docSnapshot.data();
            } else {
                console.error("Product does not exist");
                return null;
            }
        } catch (error) {
            console.error("Error getting product: ", error);
            return null;
        }
    }

    async updateProduct({ pid, newPName = null, newPQty = null, newPExpire = null, newPCode = null, newUid = null }) {
        try {
            const productDoc = doc(this.#productsCollection, pid);
            const data = {};

            if (newPName !== null) data.pName = newPName;
            if (newPQty !== null) data.pQty = newPQty;
            if (newPExpire !== null) data.pExpire = newPExpire;
            if (newPCode !== null) data.pCode = newPCode;
            if (newUid !== null) data.uid = newUid;

            await updateDoc(productDoc, data);
            console.log("Product updated successfully");
            return true;
        } catch (error) {
            console.error("Error updating product: ", error);
            return false;
        }
    }

    async getProductsRealtime(onSuccess, onError) {
        try {
            const currentUser = await this.authService.getCurrentUser();
            if (!currentUser) {
                console.error("No current user found");
                onError(new Error("No current user found"));
                return () => { };
            }

            const q = query(
                this.#productsCollection,
                where("uid", "==", currentUser.uid),
                orderBy("pCode", "asc"),
            );

            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const products = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    onSuccess(products);
                },
                (error) => {
                    console.error("Error getting products: ", error);
                    onError(error);
                }
            );

            return unsubscribe;
        } catch (error) {
            console.error("Error in getProductsRealtime: ", error);
            onError(error);
            return () => { };
        }
    }

    async createTransactionDocument() {
        try {
            const newDocRef = doc(this.#transactionsCollection);
            return newDocRef.id;
        } catch (error) {
            console.error("Error creating empty transaction document: ", error);
            return null;
        }
    }

    async addTransaction(transactionId, transactionData) {
        try {
            const transactionDoc = doc(this.#transactionsCollection, transactionId);
            await setDoc(transactionDoc, transactionData);

            console.log("Transaction updated successfully");
            return true;
        } catch (error) {
            console.error("Error updating transaction: ", error);
            return false;
        }
    }

    async getRecentTransactionsRealtime(onSuccess, onError, limitNum = 100) {
        try {
            const currentUser = await this.authService.getCurrentUser();
            if (!currentUser) {
                console.error("No current user found");
                onError(new Error("No current user found"));
                return () => { };
            }

            const q = query(
                this.#transactionsCollection,
                where("uid", "==", currentUser.uid),
                orderBy("timestamp", "desc"),
                limit(limitNum)
            );

            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const transactions = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    onSuccess(transactions);
                },
                (error) => {
                    console.error("Error getting recent transactions: ", error);
                    onError(error);
                }
            );

            return unsubscribe;
        } catch (error) {
            console.error("Error in getRecentTransactionsRealtime: ", error);
            onError(error);
            return () => { };
        }
    }

    async getTotalSales(startDate, endDate, onSuccess, onError) {
        try {
            const currentUser = await this.authService.getCurrentUser();
            if (!currentUser) {
                console.error("No current user found");
                onError(new Error("No current user found"));
                return;
            }

            const q = query(
                this.#transactionsCollection,
                where("uid", "==", currentUser.uid),
                where("type", "==", "Sell"),
                where("timestamp", ">=", startDate),
                where("timestamp", "<=", endDate),
                orderBy("timestamp", "desc")
            );

            const querySnapshot = await getDocs(q);
            const transactions = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            onSuccess(transactions);
        } catch (error) {
            console.error("Error getting total gross sales: ", error);
            onError(error);
        }
    }
}

export default DatabaseService;
