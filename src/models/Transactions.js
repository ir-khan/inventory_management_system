class Transaction {
    constructor({
        transactionId = '',
        uid = '',            
        productId = '',      
        quantity = 0,        
        type = '',           
        timestamp = '',       
        price = 0,
        pName = '',
        pCode = 0,
    } = {}) {
        this.transactionId = transactionId;
        this.uid = uid;
        this.productId = productId;
        this.quantity = quantity;
        this.type = type;
        this.timestamp = timestamp;
        this.price = price;
        this.pName = pName;
        this.pCode = pCode;
    }

    toJSON() {
        return {
            transactionId: this.transactionId,
            uid: this.uid,
            productId: this.productId,
            quantity: this.quantity,
            type: this.type,
            timestamp: this.timestamp,
            price: this.price,
            pName: this.pName,
            pCode: this.pCode,
        };
    }

    static fromJSON(json) {
        return new Transaction({
            transactionId: json.transactionId,
            uid: json.uid,
            productId: json.productId,
            quantity: json.quantity,
            type: json.type,
            timestamp: json.timestamp,
            price: json.price,
            pName: json.pName,
            pCode: json.pCode,
        });
    }
}

export default Transaction;
