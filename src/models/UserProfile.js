class UserProfile {
    constructor({ uid = '', fullname = '', email = '', pfpURL = '', employees = [], products = [], transactions = [] } = {}) {
        this.uid = uid;
        this.fullname = fullname;
        this.email = email;
        this.pfpURL = pfpURL;
        this.employees = employees;
        this.products = products;
        this.transactions = transactions;
    }

    static fromJson(json) {
        return new UserProfile({
            uid: json.uid,
            fullname: json.fullname,
            email: json.email,
            pfpURL: json.pfpURL || '',
            employees: json.employees || [],
            products: json.products || [],
            transactions: json.transactions || [],
        });
    }

    toJson() {
        return {
            uid: this.uid,
            fullname: this.fullname,
            email: this.email,
            pfpURL: this.pfpURL,
            employees: this.employees,
            products: this.products,
            transactions: this.transactions,
        };
    }
}

export default UserProfile;
