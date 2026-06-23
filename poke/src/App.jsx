import { useState } from 'react'
import { useResort } from './useResort.jsx'
import GatherIsland from './islands/GatherIsland.jsx'
import FriendshipIsland from './islands/FriendshipIsland.jsx'
import TrainingIsland from './islands/TrainingIsland.jsx'
import BerryFarm from './islands/BerryFarm.jsx'
import './App.css'

const ISLANDS = [
  { id: 'gather', label: 'あつめる島', emoji: '🏝️', Component: GatherIsland },
  { id: 'friend', label: 'なかよし島', emoji: '💖', Component: FriendshipIsland },
  { id: 'train', label: 'トレーニング島', emoji: '💪', Component: TrainingIsland },
  { id: 'berry', label: 'きのみ畑', emoji: '🍓', Component: BerryFarm },
]

function App() {
  const resort = useResort()
  const [tab, setTab] = useState('gather')

  const Active = ISLANDS.find((i) => i.id === tab).Component

  return (
    <div className="App">
      <header className="resort-header">
        <h1>🌴 ポケファーム・リゾート</h1>
        <div className="status">
          <span>🐾 {resort.state.pokemons.length}ひき</span>
          <span>🍓 {resort.state.berries}こ</span>
        </div>
      </header>

      <nav className="island-tabs">
        {ISLANDS.map((i) => (
          <button
            key={i.id}
            className={tab === i.id ? 'active' : ''}
            onClick={() => setTab(i.id)}
          >
            <span className="tab-emoji">{i.emoji}</span>
            <span className="tab-label">{i.label}</span>
          </button>
        ))}
      </nav>

      <main>
        <Active resort={resort} />
      </main>
    </div>
  )
}

export default App
