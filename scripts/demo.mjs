#!/usr/bin/env node
/**
 * 中間発表のデモ用サーバーを起動する（予約 → 問診 → 顧客登録の流れだけを見せる）。
 *
 * - 保存先は、毎回まっさらにする専用フォルダ（.demo-data）。内蔵のダミーデータで始まる。
 * - Google Sheets / PostgreSQL には接続しない（本物のデータには一切触れない）。
 * - スタッフのログインは、既定で staff@okidive.com / test1234（環境変数で上書き可）。
 *
 * 使い方: npm run demo      （起動のたびにデモ用データを初期状態に戻す）
 *         npm run demo -- --keep   （前回のデータを残して起動する）
 */
import { spawn } from 'node:child_process'
import { rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = path.join(root, '.demo-data')
const port = process.env.PORT || '3030'
const keep = process.argv.includes('--keep')

if (!keep) rmSync(dataDir, { recursive: true, force: true })

const env = {
  ...process.env,
  LOCAL_DATA_DIR: dataDir,
  STAFF_CREDENTIALS: process.env.DEMO_STAFF_CREDENTIALS || 'staff@okidive.com:test1234',
  SESSION_SECRET: process.env.SESSION_SECRET || 'demo-only-session-secret-not-for-production',
}
// ログイン画面の入力欄に、あらかじめスタッフのメールアドレスとパスワードを入れておく
const [demoEmail, ...demoPasswordParts] = env.STAFF_CREDENTIALS.split('|')[0].split(':')
env.NEXT_PUBLIC_DEMO_LOGIN_EMAIL = demoEmail
env.NEXT_PUBLIC_DEMO_LOGIN_PASSWORD = demoPasswordParts.join(':')
// 予約フォームと問診票にも、架空の人物の内容をあらかじめ入れておく（入力の手間を省く）
env.NEXT_PUBLIC_DEMO_PREFILL = 'true'
// 外部のデータ保存先には、つながないようにする
for (const key of [
  'DATA_STORE',
  'DATABASE_URL',
  'GOOGLE_SERVICE_ACCOUNT_EMAIL',
  'GOOGLE_PRIVATE_KEY',
  'GOOGLE_SPREADSHEET_ID',
  'GOOGLE_DATASTORE_LOCK_PROJECT_ID',
  'GOOGLE_FORM_SPREADSHEET_ID',
]) {
  delete env[key]
}

console.log(`デモ用サーバーを起動します → http://127.0.0.1:${port}/booking`)
console.log(`  お客さん側: /booking（予約フォーム。入力済みなので、そのまま送信できる）`)
console.log(`  スタッフ側: /login（メールアドレスとパスワードは入力済み。ログインを押すだけ）`)

const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next')
const child = spawn(process.execPath, [nextBin, 'dev', '--hostname', '127.0.0.1', '--port', port], {
  cwd: root,
  env,
  stdio: 'inherit',
})
child.on('exit', (code) => process.exit(code ?? 0))
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal))
