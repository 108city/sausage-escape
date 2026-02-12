import { useState, useEffect } from 'react'
import GameCanvas from './components/GameCanvas'
import './App.css'

function App() {
    const [gameState, setGameState] = useState('menu') // menu, playing, gameover, win
    const [disturbance, setDisturbance] = useState(0)
    const [activeAttack, setActiveAttack] = useState(null)

    const handleAttack = (type) => {
        setActiveAttack({ type, id: Date.now() })
    }

    const handleGameEnd = (reason) => {
        setGameState(reason) // 'gameover' or 'win'
    }

    return (
        <div className="app-container bed-theme">
            <div className="vignette"></div>

            {gameState === 'menu' && (
                <div className="overlay bedroom-overlay">
                    <h1 className="title bed-title">SAUSAGE IN BED</h1>
                    <p className="subtitle pink-text">MISSION: DISTURB THE HUMAN</p>
                    <div className="instructions">
                        <p><strong>ARROWS / WASD</strong>: Roll Around</p>
                        <p><strong>F</strong>: Fart Attack | <strong>S</strong>: Snore | <strong>C</strong>: Cold Feet</p>
                    </div>
                    <button className="start-btn cozy-btn" onClick={() => setGameState('playing')}>
                        START CHAOS
                    </button>
                </div>
            )}

            {gameState === 'playing' && (
                <>
                    <div className="ui-container">
                        <div className="disturbance-bar-wrapper">
                            <span>DISTURBANCE METER</span>
                            <div className="disturbance-bar">
                                <div className="disturbance-fill" style={{ width: `${disturbance}%` }}></div>
                            </div>
                        </div>
                        <div className="attack-buttons">
                            <button className="attack-btn" onClick={() => handleAttack('fart')}>💨 FART</button>
                            <button className="attack-btn" onClick={() => handleAttack('snore')}>💤 SNORE</button>
                            <button className="attack-btn" onClick={() => handleAttack('cold-feet')}>🦶 COLD FEET</button>
                        </div>
                    </div>
                    <GameCanvas
                        disturbance={disturbance}
                        onDisturb={(val) => setDisturbance(prev => Math.min(100, prev + val))}
                        onGameOver={() => handleGameEnd('gameover')}
                        onWin={() => handleGameEnd('win')}
                        activeAttack={activeAttack}
                    />
                </>
            )}

            {(gameState === 'gameover' || gameState === 'win') && (
                <div className="overlay bedroom-overlay">
                    <h1 className="title bed-title">{gameState === 'win' ? 'SUCCESS!' : 'KICKED OUT!'}</h1>
                    <p className="final-score white-text">
                        {gameState === 'win' ? 'The human is awake and grumpy!' : 'You pushed too far and got kicked off the bed.'}
                    </p>
                    <button className="start-btn cozy-btn" onClick={() => { setDisturbance(0); setGameState('playing'); }}>
                        TRY AGAIN
                    </button>
                </div>
            )}
        </div>
    )
}

export default App
