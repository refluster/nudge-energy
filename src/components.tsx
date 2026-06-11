import { useState, type ReactNode } from 'react'

export function PageHeader() {
  return (
    <header className="page-header">
      <span>⚡</span>
      <span className="brand">くらしのエネルギー</span>
    </header>
  )
}

export function Card({ children }: { children: ReactNode }) {
  return <section className="card">{children}</section>
}

/**
 * ワンタップの意思表明ボタン。押した状態は localStorage に保存され、
 * 再訪時も「済み」表示を維持する（バックエンドなしで体験を成立させるため）。
 */
export function CommitButton({
  id,
  label,
  doneLabel,
}: {
  id: string
  label: string
  doneLabel: string
}) {
  const key = `nudge-commit:${id}`
  const [done, setDone] = useState(() => localStorage.getItem(key) === '1')
  return (
    <button
      className={done ? 'btn done' : 'btn'}
      onClick={() => {
        localStorage.setItem(key, '1')
        setDone(true)
      }}
    >
      {done ? doneLabel : label}
    </button>
  )
}
