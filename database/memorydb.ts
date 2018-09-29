import { Type } from 'protobufjs';
import { TableInfo, ColumnBase } from './types/general';
import { createWriteStream, createReadStream, existsSync } from 'fs';
import { stdoutLog as log, range } from '../utils';
import { OutVar } from '../types';

type mBuffer = Uint8Array | Buffer;

export class Agent {
    protected _info: TableInfo;
    protected _colType: Type;
    protected _dbPath: string;
    protected _dbTablePath: string;
    protected _entries: ColumnBase[];
    protected _modified: number[];

    protected get _chunkSize() {
        return this._info.columnInfo.chunkSize;
    }

    protected set _chunkSize(value: number) {
        this._info.columnInfo.chunkSize = value;
    }

    protected get _nChunks() {
        return this._info.columnInfo.nChunks;
    }

    protected set _nChunks(value: number) {
        this._info.columnInfo.nChunks = value;
    }

    public constructor(info: TableInfo, colType: Type, dbPath: [string, string]) {
        if (info == null) throw new Error('info is null');
        if (colType == null) throw new Error('colType is null');
        if (dbPath == null) throw new Error('dbPath is null');
        if (info.columnInfo == null) throw new Error('columnInfo of info is null');

        this._info = info;
        this._colType = colType;
        this._entries = [];
        this._modified = [];
        [this._dbPath, this._dbTablePath] = dbPath;
        this.load();
    }

    protected load() {
        if (!existsSync(this._dbPath)) return;

        for (const i of range(this._nChunks)) {
            let s = i * this._chunkSize;
            let e = s + this._chunkSize;
            let reader = createReadStream(this._dbPath, { start: s, end: e });
            let buffer = reader.read();
            let data = <ColumnBase>this._colType.decode(buffer);
            this._entries.push(data);
        }
    }

    public save(path?: string, force?: boolean) {
        path = path || this._dbPath;

        let outBuffer: any = [undefined];
        let iter = (force || this._modified == null)
            ? range(this._modified.length)
            : this._modified;

        for (const i of iter) {
            const colData = this._entries[i];
            const iStart = i * this._chunkSize;
            let msg = this.verify(colData, outBuffer);
            if (msg) log(msg);
            else {
                let buffer: mBuffer = outBuffer[0];
                let writer = createWriteStream(path, { start: iStart });
                writer.write(buffer);
                writer.close();
            }
        }
    }

    public verify(colData: ColumnBase, outBuffer?: OutVar<mBuffer>) {
        let msg = this._colType.verify(colData);
        if (msg) return msg;

        if (outBuffer) {
            var buffer = this._colType.encode(colData).finish();
            if (buffer.length > this._info.columnInfo.chunkSize)
                return 'size out of range';
            outBuffer[0] = buffer;
        }
    }

    public append(colData: ColumnBase, raw: boolean) {
        if (raw) {
            let msg = this._colType.verify(colData);
            if (msg) return msg;

            colData = <ColumnBase>this._colType.create(colData);
        }

        this._entries.push(colData);
    }
}
