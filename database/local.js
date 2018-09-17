class localDb {
    constructor() {
        this._data = {};
    }
    /**
     * get value from key
     * @param {string} key 
     */
    getValue(key) {
        return this._data[key];
    }

    /**
     * set value
     * @param {string} key 
     * @param {*} value 
     */
    setValue(key, value) {
        this._data[key] = value;
    }
}

localDb.connect = function () {
    return new localDb();
};

module.exports = localDb;
