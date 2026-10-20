import jsQR from 'jsqr'

/** カメラ映像から QR コードを読み取る検出器。読み取れなければ null。 */
export type QrDetector = {
  detect(video: HTMLVideoElement): Promise<string | null>
}

type NativeDetector = {
  detect(video: HTMLVideoElement): Promise<{ rawValue?: string }[]>
}
type NativeDetectorConstructor = new (options?: { formats: string[] }) => NativeDetector

/** 読み取りにかける映像の最大の幅。大きいほど遠くの QR も読めるが、処理が重くなる。 */
const MAX_DECODE_WIDTH = 640

/** 画像データから QR を読み取る（ブラウザの機能に依存しない）。 */
export function decodeQrFromImageData(image: { data: Uint8ClampedArray; width: number; height: number }): string | null {
  const code = jsQR(image.data, image.width, image.height, { inversionAttempts: 'attemptBoth' })
  return code?.data ? code.data : null
}

/** ブラウザ標準の読取機能（BarcodeDetector）。使えない環境（Windows の Chrome/Edge、iPhone の Safari など）では null。 */
function createNativeDetector(NativeClass: NativeDetectorConstructor | undefined): QrDetector | null {
  if (!NativeClass) return null
  try {
    const native = new NativeClass({ formats: ['qr_code'] })
    return {
      async detect(video) {
        const codes = await native.detect(video)
        return codes[0]?.rawValue || null
      },
    }
  } catch {
    // QR 形式に対応していない場合などは、ライブラリでの読み取りに切り替える
    return null
  }
}

/** 映像を縮小した画像データにして、ライブラリで読み取る。 */
function createCanvasDetector(): QrDetector {
  let canvas: HTMLCanvasElement | null = null
  return {
    async detect(video) {
      if (!video.videoWidth || !video.videoHeight) return null
      canvas ??= document.createElement('canvas')
      const scale = Math.min(1, MAX_DECODE_WIDTH / video.videoWidth)
      const width = Math.max(1, Math.round(video.videoWidth * scale))
      const height = Math.max(1, Math.round(video.videoHeight * scale))
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) return null
      context.drawImage(video, 0, 0, width, height)
      return decodeQrFromImageData(context.getImageData(0, 0, width, height))
    },
  }
}

/** 使える方法で QR 検出器を作る。標準機能があればそれを使い、なければライブラリで読み取る。 */
export function createQrDetector(NativeClass?: NativeDetectorConstructor): QrDetector {
  return createNativeDetector(NativeClass) ?? createCanvasDetector()
}
