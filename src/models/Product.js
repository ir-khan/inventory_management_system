class Product {
    constructor({pid = '', pName = '', pQty = 0, pExpire = '', pCode = '', uid = ''} = {}) {
        this.pid = pid;
        this.pName = pName;
        this.pQty = pQty;
        this.pExpire = pExpire;
        this.pCode = pCode;
        this.uid = uid;
    }

    toJSON() {
        return {
            pid: this.pid,
            pName: this.pName,
            pQty: this.pQty,
            pExpire: this.pExpire,
            pCode: this.pCode,
            uid: this.uid,
        };
    }

    static fromJSON(json) {
        return new Product({
            pid: json.pid,
            pName: json.pName,
            pQty: json.pQty,
            pExpire: json.pExpire,
            pCode: json.pCode,
            uid: json.uid,
        });
    }
}

export default Product;
