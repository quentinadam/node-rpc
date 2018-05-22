const emptyBuffer = Buffer.allocUnsafe(0);

export default class SmartBuffer {
  
  private buffers: Buffer[];
  private _length: number;

  constructor() {
    this.buffers = [];
    this._length = 0;
  }

  get length(): number {
    return this._length;
  }

  add(buffer: Buffer): void {
    if (buffer.length > 0) {
      this.buffers.push(buffer);
      this._length += buffer.length;
    }
  }

  slice(offset: number = 0, length: number = this._length): Buffer {
    if (offset < 0) {
      offset = 0;
    } else if (offset > this._length) {
      offset = this._length;
    }
    if (offset + length > this._length) {
      length = this._length - offset;
    }
    const buffer: Buffer = this.toBuffer();
    if (offset == 0 && length == buffer.length) {
      return buffer;
    } else {
      return buffer.slice(offset, offset + length);
    }
  }

  discard(length: number = this._length): void {
    if (length > this._length) {
      length = this._length;
    }
    const buffer: Buffer = this.toBuffer();
    if (length == this._length) {
      this.buffers = [];
      this._length = 0;
    } else {
      const remainingBuffer = buffer.slice(length);
      this.buffers = [remainingBuffer];
      this._length = remainingBuffer.length;
    }
  }

  readUInt32LE(offset: number): number {
    if (this.buffers.length > 0 && this.buffers[0].length >= offset + 4) {
      return this.buffers[0].readUInt32LE(offset);
    } else {
      const buffer = this.toBuffer();
      return buffer.readUInt32LE(offset);
    }
  }

  toBuffer(): Buffer {
    if (this.buffers.length == 0) {
      return emptyBuffer;
    } else if (this.buffers.length == 1) {
      return this.buffers[0];
    } else {
      const buffer: Buffer = Buffer.concat(this.buffers);
      this.buffers = [buffer];
      return buffer;
    }
  }

  toString(): string {
    return this.toBuffer().toString();
  }

}
