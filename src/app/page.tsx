'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'

export default function RootPage() {
  const user = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user === undefined) return // 認証状態の初期取得中は待つ
    // デモ用: 未ログインなら予約フォーム（お客さん側）から始める
    router.replace(user ? '/reservations' : '/booking')
  }, [user, router])

  return null
}
