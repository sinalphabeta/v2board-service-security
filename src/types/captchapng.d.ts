declare module 'captchapng' {
  class CaptchaPNG {
    width: number
    height: number
    depth: number
    dispNumber: string
    widthAverage: number
    buffer: Buffer

    constructor(width: number, height: number, dispNumber: number | string)

    index(x: number, y: number): any
    color(r: number, g: number, b: number, a: number): void
    getBase64(): string
  }

  export = CaptchaPNG
}
