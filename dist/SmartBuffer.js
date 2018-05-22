"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const emptyBuffer = Buffer.allocUnsafe(0);
class SmartBuffer {
    constructor() {
        this.buffers = [];
        this._length = 0;
    }
    get length() {
        return this._length;
    }
    add(buffer) {
        if (buffer.length > 0) {
            this.buffers.push(buffer);
            this._length += buffer.length;
        }
    }
    slice(offset = 0, length = this._length) {
        if (offset < 0) {
            offset = 0;
        }
        else if (offset > this._length) {
            offset = this._length;
        }
        if (offset + length > this._length) {
            length = this._length - offset;
        }
        const buffer = this.toBuffer();
        if (offset == 0 && length == buffer.length) {
            return buffer;
        }
        else {
            return buffer.slice(offset, offset + length);
        }
    }
    discard(length = this._length) {
        if (length > this._length) {
            length = this._length;
        }
        const buffer = this.toBuffer();
        if (length == this._length) {
            this.buffers = [];
            this._length = 0;
        }
        else {
            const remainingBuffer = buffer.slice(length);
            this.buffers = [remainingBuffer];
            this._length = remainingBuffer.length;
        }
    }
    readUInt32LE(offset) {
        if (this.buffers.length > 0 && this.buffers[0].length >= offset + 4) {
            return this.buffers[0].readUInt32LE(offset);
        }
        else {
            const buffer = this.toBuffer();
            return buffer.readUInt32LE(offset);
        }
    }
    toBuffer() {
        if (this.buffers.length == 0) {
            return emptyBuffer;
        }
        else if (this.buffers.length == 1) {
            return this.buffers[0];
        }
        else {
            const buffer = Buffer.concat(this.buffers);
            this.buffers = [buffer];
            return buffer;
        }
    }
    toString() {
        return this.toBuffer().toString();
    }
}
exports.default = SmartBuffer;
//# sourceMappingURL=SmartBuffer.js.map