import { load, Type, Enum } from 'protobufjs';
import { join } from 'path';
import { account, dbConfig, general } from './config';
import { existsSync, createWriteStream, readFileSync } from 'fs';
import { Agent } from './memorydb';
import { TableInfo, ColumnInfo } from './types/general';
import { EventEmitter } from 'events';

type AgentMap = {
    [name: string]: Agent
};

export enum LoadState {
    Pending,
    Loading,
    Loaded,
    Failed
}

type LoadStates = {
    [name: string]: LoadState
};

const states: LoadStates = {};
const configs = [account];
const agents: AgentMap = {};
const emitter: EventEmitter = new EventEmitter();

let tableType: Type;
let columnType: Type;

function loadColumnInfo(tblCfg: dbConfig) {
    let name = tblCfg.name;
    let protoPath = getProtoPath(name);

    load(protoPath, function (err, root) {
        if (err) throw err;

        // non-null assertion operator ! to suppress the error.
        let colType = root!.lookupType(`${tblCfg.package}.${tblCfg.type}`);
        if (!colType) throw new Error(`Type ${name} not found.`);

        let dbPath = getDbFilePath(name, true);
        let dbTablePath = getDbFilePath(name, false);

        let tableInfo: TableInfo;
        if (!existsSync(dbTablePath)) {
            let now = Date.now();
            let raw = <TableInfo>{
                created: now,
                lastModified: now,
                readonly: false,
                createdBy: '4bg',
                columnInfo: <ColumnInfo>{
                    nChunks: 0,
                    chunkSize: tblCfg.size,
                    counter: 0
                }
            };
            tableInfo = <TableInfo>tableType.create(raw);
            let writer = createWriteStream(dbTablePath);
            let buffer = tableType.encode(tableInfo).finish();
            writer.write(buffer);
            writer.close();
        }
        else {
            let buffer = readFileSync(dbTablePath);
            tableInfo = <TableInfo>tableType.decode(buffer);
        }
        agents[name] = new Agent(tableInfo, colType, [dbPath, dbTablePath]);
        emitter.emit('loaded', name);
    });
}

function getProtoPath(name: string) {
    const protoDir = join(__dirname, 'proto');
    const protoSuffix = 'proto';
    return join(protoDir, `${name}.${protoSuffix}`);
}

function getDbFilePath(name: string, isContent: boolean) {
    const dbDir = join(__dirname, 'db');
    const dbSuffix = 'db';
    return isContent
        ? join(dbDir, `${name}.${dbSuffix}0`)
        : join(dbDir, `${name}.${dbSuffix}1`);
}

function loadTables() {
    for (const config of configs) {
        states[config.name] = LoadState.Loading;
        loadColumnInfo(config);
    }
}

function initStates() {
    states[general.name] = LoadState.Pending;
    for (const config of configs) {
        states[config.name] = LoadState.Pending;
    }
    Object.seal(states);
    emitter.on('loaded', function (name: string) {
        states[name] = LoadState.Loaded;
        check();
    });
    emitter.on('failed', function(name: string) {
        states[name] = LoadState.Failed;
        check();
    });
    function check() {
        for (const key of Object.keys(states)) {
            let state = states[key];
            if (state == LoadState.Pending)
                return;
            if (state == LoadState.Loading)
                return;
        }
        emitter.emit('ready', states);
    }
}

export function initialize() {
    initStates();

    states[general.name] = LoadState.Loading;
    load(getProtoPath(general.name), function (err, root) {
        if (err) throw err;

        tableType = root!.lookupType(`${general.package}.${general.table}`);
        columnType = root!.lookupType(`${general.package}.${general.column}`);

        emitter.emit('loaded', general.name);
        loadTables();
    });
}

export function on(name: string, callback: (...args: any[]) => void) {
    emitter.on(name, callback);
}

export function getTable(name: string) {
    let table = agents[name];
    if (table) return table;
    throw new Error(`Table ${name} not found.`);
}

initialize();
