import Catalog from './Catalog'
import { PageHeader } from './components'
import GoalCommit from './nudges/GoalCommit'
import OneAction from './nudges/OneAction'
import PeakAlert from './nudges/PeakAlert'
import SocialComparison from './nudges/SocialComparison'
import WeeklyReport from './nudges/WeeklyReport'

// GitHub Pages はサーバーサイドルーティングできないため、
// パスではなく ?id=xxx でページを出し分ける。
const PAGES: Record<string, () => React.JSX.Element> = {
  peak: PeakAlert,
  social: SocialComparison,
  report: WeeklyReport,
  action: OneAction,
  goal: GoalCommit,
}

export default function App() {
  const id = new URLSearchParams(location.search).get('id')
  const Page = id ? PAGES[id] : null

  if (!Page) {
    return <Catalog />
  }

  return (
    <>
      <PageHeader />
      <Page />
      <p style={{ marginTop: 32, textAlign: 'center' }}>
        <a className="back-link" href={location.pathname}>
          ← サンプル一覧（PM向け）にもどる
        </a>
      </p>
    </>
  )
}
