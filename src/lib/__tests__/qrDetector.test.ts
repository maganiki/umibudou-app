import { describe, it, expect, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { QRCodeSVG } from 'qrcode.react'
import { createQrDetector, decodeQrFromImageData } from '../qrDetector'

/** QR コードを SVG で作り、マス目を画像データ（RGBA）に直す。受付QRの表示と同じ部品で作る。 */
function qrImage(value: string, options: { scale?: number; invert?: boolean } = {}) {
  const scale = options.scale ?? 6
  const svg = renderToStaticMarkup(createElement(QRCodeSVG, { value, size: 200, level: 'M', includeMargin: true }))
  const size = Number(/viewBox="0 0 (\d+) \d+"/.exec(svg)?.[1])
  const dark = Array.from(svg.matchAll(/M(\d+)[ ,](\d+)\s?h(\d+)v1/g)).map((m) => ({ x: +m[1], y: +m[2], w: +m[3] }))
  const width = size * scale
  const data = new Uint8ClampedArray(width * width * 4)
  const background = options.invert ? 0 : 255
  for (let i = 0; i < data.length; i += 4) data.set([background, background, background, 255], i)
  for (const { x, y, w } of dark) {
    for (let py = y * scale; py < (y + 1) * scale; py++) {
      for (let px = x * scale; px < (x + w) * scale; px++) {
        const i = (py * width + px) * 4
        const color = options.invert ? 255 : 0
        data.set([color, color, color, 255], i)
      }
    }
  }
  return { data, width, height: width }
}

describe('decodeQrFromImageData(ライブラリでの QR 読み取り)', () => {
  it('受付QRと同じ形式（43文字のトークン）を読み取れる', () => {
    const token = 'QFKqUuqCoFbB_pYuwyEgYQ-abcdefghijklmnopqrs'

    expect(decodeQrFromImageData(qrImage(token))).toBe(token)
  })

  it('小さく写った QR も読み取れる', () => {
    expect(decodeQrFromImageData(qrImage('token-small', { scale: 3 }))).toBe('token-small')
  })

  it('白黒が反転した QR（画面の表示が暗い背景など）も読み取れる', () => {
    expect(decodeQrFromImageData(qrImage('token-invert', { invert: true }))).toBe('token-invert')
  })

  it('QR が写っていない画像は null', () => {
    const blank = { data: new Uint8ClampedArray(100 * 100 * 4).fill(255), width: 100, height: 100 }

    expect(decodeQrFromImageData(blank)).toBeNull()
  })
})

describe('createQrDetector(読み取り方法の選択)', () => {
  const video = {} as HTMLVideoElement

  it('ブラウザ標準の読取機能があれば、それを使う', async () => {
    const detect = vi.fn().mockResolvedValue([{ rawValue: 'native-value' }])
    const Native = vi.fn(function () {
      return { detect }
    })

    const detector = createQrDetector(Native as never)

    await expect(detector.detect(video)).resolves.toBe('native-value')
    expect(Native).toHaveBeenCalledWith({ formats: ['qr_code'] })
  })

  it('標準機能が何も読み取らなかったときは null', async () => {
    const Native = vi.fn(function () {
      return { detect: vi.fn().mockResolvedValue([]) }
    })

    await expect(createQrDetector(Native as never).detect(video)).resolves.toBeNull()
  })

  it('標準機能が QR 形式に対応していない（生成で例外）ときは、ライブラリでの読み取りに切り替える', async () => {
    const Native = vi.fn(function () {
      throw new Error('unsupported format')
    })

    const detector = createQrDetector(Native as never)

    // 映像のサイズが未確定（0）の間は、ライブラリ側は何も読まずに null を返す
    await expect(detector.detect({ videoWidth: 0, videoHeight: 0 } as HTMLVideoElement)).resolves.toBeNull()
  })

  it('標準機能が無い環境では、ライブラリでの読み取りを使う（映像が未確定なら null）', async () => {
    const detector = createQrDetector(undefined)

    await expect(detector.detect({ videoWidth: 0, videoHeight: 0 } as HTMLVideoElement)).resolves.toBeNull()
  })
})
