class localDb {
    protected _data: {[x: string]: any};

    constructor() {
        this._data = {};
    }

    getValue(key: string) {
        return this._data[key];
    }

    setValue(key: string, value: any) {
        this._data[key] = value;
    }

    static connect() {
        return new localDb();
    }
}

export default localDb;
