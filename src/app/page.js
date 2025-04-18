import { Suspense } from 'react'
import SummaryPage from './summary/page'

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <Suspense fallback={<p>Cargando resumen…</p>}>
        <SummaryPage />
      </Suspense>
    </main>
  )
}
