import { describe, it, expect } from 'vitest'
import { DEMO_BOOKING, DEMO_QUESTIONNAIRE, demoPrefillEnabled } from '../demoPrefill'
import { validateQuestionnaire } from '../questionnaireValidation'
import { validateQuestionnaireExperience } from '../questionnaireExperience'
import { validateNewReservationInput } from '../reservationValidation'

describe('demoPrefillEnabled', () => {
  it('"true" のときだけオン。設定なし・ほかの値はオフ（既定）', () => {
    expect(demoPrefillEnabled('true')).toBe(true)
    expect(demoPrefillEnabled(undefined)).toBe(false)
    expect(demoPrefillEnabled('')).toBe(false)
    expect(demoPrefillEnabled('1')).toBe(false)
    expect(demoPrefillEnabled('TRUE')).toBe(false)
    expect(demoPrefillEnabled('false')).toBe(false)
  })
})

describe('デモ用の入力済みの内容が、実際の必須チェックを通る', () => {
  it('問診票: 基本・健康・当日・経験・同意のすべてで、エラーが出ない', () => {
    // 問診票の画面は、総本数を文字列で持ち、送るときに数値へ直す
    const payload = { ...DEMO_QUESTIONNAIRE, totalDives: Number(DEMO_QUESTIONNAIRE.totalDives) }

    expect(validateQuestionnaire(payload, 'all')).toEqual({})
    expect(validateQuestionnaireExperience(payload)).toEqual({})
  })

  it('予約フォーム: 公開予約の検証を通る（過去日を許可しない条件でも）', () => {
    const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' })

    const result = validateNewReservationInput(
      { ...DEMO_BOOKING, diveDate: tomorrow, timeSlot: 'morning', courseId: 'CRS-001', channel: 'hp', status: 'STS-01' },
      { allowOta: false, allowPastDate: false }
    )

    expect(result.ok).toBe(true)
  })

  it('予約フォームと問診票は、同じ人物（氏名・電話・メール）', () => {
    expect(`${DEMO_QUESTIONNAIRE.lastName} ${DEMO_QUESTIONNAIRE.firstName}`).toBe(DEMO_BOOKING.guestName)
    expect(DEMO_QUESTIONNAIRE.phone).toBe(DEMO_BOOKING.guestPhone)
    expect(DEMO_QUESTIONNAIRE.email).toBe(DEMO_BOOKING.guestEmail)
  })

  it('架空の連絡先だけを使っている（実在しうるドメインを使わない）', () => {
    expect(DEMO_BOOKING.guestEmail.endsWith('@example.com')).toBe(true)
  })
})
