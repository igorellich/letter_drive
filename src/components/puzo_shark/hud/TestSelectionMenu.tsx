import { useState } from "react";
import type { IGrade, ITest } from "../food/tests/interfaces";
import { TwoGrade } from '../food/tests/grades/2grade/2Grade';
export const menuButtonStyle = {
  padding: '14px 40px', fontSize: '20px', cursor: 'pointer',
  background: '#00d2ff', color: 'white', border: 'none', borderRadius: '12px',
  fontWeight: 'bold' as const, transition: 'transform 0.2s',
  boxShadow: '0 4px 15px rgba(0,210,255,0.3)'
};
const testButtonStyle = {
  ...menuButtonStyle,
  background: 'white', color: '#001b26', width: '100%', fontSize: '16px', marginBottom: '8px'
};

const backButtonStyle = {
  background: 'none', color: '#00d2ff', border: '1px solid #00d2ff',
  padding: '5px 15px', borderRadius: '20px', cursor: 'pointer', marginBottom: '10px'
};

export const TestSelectionMenu = (props: { startGame: (test: ITest) => void }) => {
  const { startGame } = props;
  const [currentGrade, setCurrentGrade] = useState<IGrade | null>(null)
  return <>
    <h1 style={{ color: '#00d2ff', marginBottom: '30px', fontSize: '3rem', textShadow: '0 0 20px rgba(0,210,255,0.5)' }}>Дай стейк!</h1>

    {!currentGrade ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <p style={{ fontSize: '1.2rem' }}>Выберите класс:</p>
        {[TwoGrade].map(g => (
          <button key={g.title} onClick={() => setCurrentGrade(g)} style={menuButtonStyle}>{g.title}</button>
        ))}
      </div>
    ) : (
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <button onClick={() => setCurrentGrade(null)} style={backButtonStyle}>← К выбору класса</button>
        <h3 style={{ margin: '20px 0' }}>{currentGrade.title}</h3>
        {currentGrade.subjects.map(subject => (
          <div key={subject.title} style={{ marginBottom: '20px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
            <p style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '10px' }}>{subject.title}</p>
            {subject.tests.map(t => (
              <button key={t.title} onClick={() => startGame(t)} style={testButtonStyle}>
                Начать: {t.title}
              </button>
            ))}
          </div>
        ))}
      </div>
    )}
  </>
}