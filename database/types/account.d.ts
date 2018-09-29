import { ColumnBase } from "./general";

export class Account extends ColumnBase {
    password: string;
    name: string;
    created: number;
    lastLogin: number;
    freezed: boolean;
}
