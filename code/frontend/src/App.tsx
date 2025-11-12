import React, { useState } from 'react'
import TokensPage from './pages/TokensPage'
import SpreadsPage from './pages/SpreadsPage'
import MatrixPage from './pages/MatrixPage'
import FavoritesPage from './pages/FavoritesPage'

type Tab = 'tokens' | 'spreads' | 'matrix' | 'favorites'

export default function App() {
  const [tab, setTab] = useState<Tab>('matrix')

  return (
    <div className="min-h-full bg-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto p-4">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Futures Arbitrage Radar</h1>
          <nav className="flex gap-2">
            <TabButton active={tab==='tokens'} onClick={() => setTab('tokens')}>Tokens</TabButton>
            <TabButton active={tab==='spreads'} onClick={() => setTab('spreads')}>Spreads</TabButton>
            <TabButton active={tab==='matrix'}  onClick={() => setTab('matrix')}>Matrix</TabButton>
            <TabButton active={tab==='favorites'} onClick={() => setTab('favorites')}>Favorites</TabButton> {/* <-- */}
          </nav>
        </header>

        {tab === 'tokens' && <TokensPage/>}
        {tab === 'spreads' && <SpreadsPage/>}
        {tab === 'matrix'  && <MatrixPage/>}
        {tab === 'favorites' && <FavoritesPage/>} {/* <-- */}
      </div>
    </div>
  )
}

function TabButton({active, onClick, children}:{active:boolean; onClick:()=>void; children:React.ReactNode}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg border text-sm ${
        active
          ? 'bg-zinc-200 text-zinc-900 border-zinc-300'
          : 'bg-zinc-900 text-zinc-200 border-zinc-700 hover:bg-zinc-800'
      }`}
    >
      {children}
    </button>
  )
}
