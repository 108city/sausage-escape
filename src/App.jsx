import { useState, useEffect } from 'react'
import GameCanvas from './components/GameCanvas'
import './App.css'

function App() {
    const [gameState, setGameState] = useState('menu') // menu, playing, gameover
    const [score, setScore] = useState(0)

    return (
        <div className="app-container">
            {gameState === 'menu' && (
                <div className="overlay">
                    <h1 className="title">SAUSAGE ESCAPE</h1>
                    <p className="subtitle">High-Tech Kitchen / Gravity Experiment #04</p>
                    <div className="instructions">
                        <p><strong>HOLD SPACE / TAP</strong>: Toggle Anti-Gravity (Upward Drift)</p>
                        <p><strong>RELEASE</strong>: Sizzle Dash (Ground Pound)</p>
                    </div>
                    <button className="start-btn" onClick={() => setGameState('playing')}>
                        BEGIN ESCAPE
                    </button>
                </div>
            )}

            {gameState === 'playing' && (
                <>
                    <div className="score">EXPERIMENT SCORE: {score}</div>
                    <GameCanvas onGameOver={() => setGameState('gameover')} onScore={() => setScore(s => s + 1)} />
                </>
            )}

            {gameState === 'gameover' && (
                <div className="overlay">
                    <h1 className="title">COOKED!</h1>
                    <p className="final-score">Final Score: {score}</p>
                    <button className="start-btn" onClick={() => { setScore(0); setGameState('playing'); }}>
                        REANIMATE
                    </button>
                </div>
            )}
        </div>
    )
}

export default App
