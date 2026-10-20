import { describe, it, expect } from 'vitest'
import { demoLoginDefaults } from '../demoLogin'

describe('demoLoginDefaults(ログイン画面のあらかじめ入れる値)', () => {
  it('メールアドレスとパスワードの両方があれば、その値を返す', () => {
    expect(demoLoginDefaults({ email: 'staff@okidive.com', password: 'test1234' })).toEqual({
      email: 'staff@okidive.com',
      password: 'test1234',
    })
  })

  it('設定がなければ、空欄（既定）', () => {
    expect(demoLoginDefaults({})).toEqual({ email: '', password: '' })
    expect(demoLoginDefaults({ email: '', password: '' })).toEqual({ email: '', password: '' })
  })

  it('片方だけの場合は、どちらも入れない', () => {
    expect(demoLoginDefaults({ email: 'staff@okidive.com' })).toEqual({ email: '', password: '' })
    expect(demoLoginDefaults({ password: 'test1234' })).toEqual({ email: '', password: '' })
    expect(demoLoginDefaults({ email: '   ', password: 'test1234' })).toEqual({ email: '', password: '' })
  })

  it('メールアドレスの前後の空白は取り除き、パスワードはそのまま渡す', () => {
    expect(demoLoginDefaults({ email: '  staff@okidive.com ', password: ' pw ' })).toEqual({
      email: 'staff@okidive.com',
      password: ' pw ',
    })
  })
})
