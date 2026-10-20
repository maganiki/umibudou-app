/**
 * デモ用: ログイン画面の入力欄に、あらかじめ入れておく値。
 * NEXT_PUBLIC_DEMO_LOGIN_EMAIL / NEXT_PUBLIC_DEMO_LOGIN_PASSWORD の両方があるときだけ使う。
 * 設定しなければ（既定）空欄のまま。認証そのものは変えない（ログインのボタンは押す必要がある）。
 *
 * 注意: NEXT_PUBLIC_ の値は、画面のスクリプトに埋め込まれて誰にでも見える。
 *       デモ用の試験データだけの環境でのみ設定すること。
 */
export function demoLoginDefaults(values: { email?: string; password?: string }): {
  email: string
  password: string
} {
  const email = values.email?.trim() ?? ''
  const password = values.password ?? ''
  // 片方だけでは使わない（誤設定で、半端な値が入るのを防ぐ）
  return email && password ? { email, password } : { email: '', password: '' }
}
