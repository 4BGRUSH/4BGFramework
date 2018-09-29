const pkgName = "fourbg";

export type dbConfig = {
    package: string,
    name: string,
    type: string,
    size: number
}

export const general = {
    package: pkgName,
    name: "general",
    table: "TableInfo",
    column: "ColumnInfo"
}

export const account: dbConfig = {
    package: pkgName,
    name: "account",
    type: "Account",
    size: 26
};
