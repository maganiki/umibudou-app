/**
 * デモ用: 予約フォームと問診票に、架空の人物の内容をあらかじめ入れておく。
 * NEXT_PUBLIC_DEMO_PREFILL=true のときだけ使う。設定しなければ（既定）従来どおり空欄。
 * 入力欄は残るので、書き換えながら見せることもできる。必須チェックは通常どおり働く。
 *
 * ここにあるのは架空の人物・架空の連絡先だけ（秘密の値は含まない）。
 */
export function demoPrefillEnabled(value: string | undefined): boolean {
  return value === 'true'
}

/** 予約フォームの入力済みの内容 */
export const DEMO_BOOKING = {
  guestName: '山田 太郎',
  guestCount: 1,
  guestPhone: '090-1234-5678',
  guestEmail: 'taro.yamada@example.com',
  staffNote: '初めてのダイビングです。',
} as const

/** 問診票の入力済みの内容（予約フォームの人物と同じ。健康上の該当項目はすべて「なし」） */
export const DEMO_QUESTIONNAIRE = {
  lastName: '山田',
  firstName: '太郎',
  lastNameKana: 'ヤマダ',
  firstNameKana: 'タロウ',
  birthDate: '1992-06-15',
  gender: 'male',
  postalCode: '900-0001',
  address: '沖縄県那覇市おもろまち1-1-1',
  phone: DEMO_BOOKING.guestPhone,
  email: DEMO_BOOKING.guestEmail,
  emergencyName: '山田 花子',
  emergencyRelation: '配偶者',
  emergencyPhone: '090-8765-4321',
  heartDisease: false,
  hypertension: false,
  respiratoryDisease: false,
  earDisease: false,
  epilepsy: false,
  diabetes: false,
  pregnant: false,
  panicDisorder: false,
  latexAllergy: false,
  medication: false,
  medicalCertificate: false,
  sleepCategory: '6時間以上',
  alcoholLastNight: false,
  alcoholToday: false,
  condition: 'good',
  flightWithin48h: false,
  hasCCard: false,
  cCardType: '未取得',
  cCardOrg: '',
  lastDivePeriod: '初めて',
  totalDives: '0',
  agreeRisk: true,
  agreeMedical: true,
  agreePhoto: true,
} as const
