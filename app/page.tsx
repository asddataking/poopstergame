'use client'

import { useState } from 'react'
import GameRoot from '@/components/GameRoot'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function Home() {
  const [showGame, setShowGame] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Error Loading Game</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  if (!showGame) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-4">🐕💩 Poopster Game</h1>
          <p className="text-blue-600 mb-8">Build your poop-scooping empire!</p>
          <button
            onClick={() => {
              try {
                setShowGame(true)
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error')
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            Start Game
          </button>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-800 mb-4">Game Error</h1>
            <p className="text-red-600 mb-4">Something went wrong loading the game.</p>
            <button
              onClick={() => setShowGame(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Back to Menu
            </button>
          </div>
        </div>
      }
    >
      <GameRoot />
    </ErrorBoundary>
  )
}
