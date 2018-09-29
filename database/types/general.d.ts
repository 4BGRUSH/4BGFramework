import { Message } from "protobufjs";

export abstract class TableInfo extends Message<{}> {
    created: number;
    lastModified: number;
    readonly: boolean;
    createdBy: string;
    columnInfo: ColumnInfo;
}

export abstract class ColumnInfo extends Message<{}> {
    nChunks: number;
    chunkSize: number;
    counter: number;
}

export abstract class ColumnBase extends Message<{}> {
    Id: number;
    deleted: boolean;
}
