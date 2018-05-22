/// <reference types="node" />
export default class SmartBuffer {
    private buffers;
    private _length;
    constructor();
    readonly length: number;
    add(buffer: Buffer): void;
    slice(offset?: number, length?: number): Buffer;
    discard(length?: number): void;
    readUInt32LE(offset: number): number;
    toBuffer(): Buffer;
    toString(): string;
}
