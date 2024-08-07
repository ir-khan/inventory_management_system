class Employee {
    constructor({eid = '', firstName = '', lastName = '', email = '', employerId = '', department = '', joiningDate = '', password = ''} = {}) {
        this.eid = eid;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.employerId = employerId;
        this.department = department;
        this.joiningDate = joiningDate;
        this.password = password;
    }

    toJSON() {
        return {
            eid: this.eid,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            employerId: this.employerId,
            department: this.department,
            joiningDate: this.joiningDate,
            password: this.password,
        };
    }

    static fromJSON(json) {
        return new Employee({
            eid: json.eid,
            firstName: json.firstName,
            lastName: json.lastName,
            email: json.email,
            employerId: json.employerId,
            department: json.department,
            joiningDate: json.joiningDate,
            password: json.password,
        });
    }
}

export default Employee;
