import { useState } from "react";
import type { IGrade, ISubject, ITest } from "../food/tests/interfaces";
import { TwoGrade } from '../food/tests/grades/2grade/2Grade';
export const menuButtonStyle = {
  padding: '14px 40px', fontSize: '20px', cursor: 'pointer',
  background: '#00d2ff', color: 'white', border: 'none', borderRadius: '12px',
  fontWeight: 'bold' as const, transition: 'transform 0.2s',
  boxShadow: '0 4px 15px rgba(0,210,255,0.3)'
};
export const testButtonStyle = {
  ...menuButtonStyle,
  background: 'white', color: '#001b26', width: '100%', fontSize: '16px', marginBottom: '8px'
};

const backButtonStyle = {
  background: 'none', color: '#00d2ff', border: '1px solid #00d2ff',
  padding: '5px 15px', borderRadius: '20px', cursor: 'pointer', marginBottom: '10px',
  marginTop: '5px'
};

export const TestSelectionMenu = (props: { startGame: (test: ITest) => void }) => {
  const { startGame } = props;
  const [currentGrade, setCurrentGrade] = useState<IGrade | null>(null)
  const [currentSubject, setCurrentSubject] = useState<ISubject | null>(null)
  return <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <h1 style={{ color: '#00d2ff', margin: 0, fontSize: '3rem', textShadow: '0 0 20px rgba(0,210,255,0.5)' }}>Дай стейк!</h1>
    {!currentGrade && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', overflow:'auto', flexShrink:1 }}>
        <p style={{ fontSize: '1.2rem' }}>Выберите класс:</p>
        {[TwoGrade].map(g => (
          <button key={g.title} onClick={() => setCurrentGrade(g)} style={menuButtonStyle}>{g.title}</button>
        ))}
      </div>
    )}
    {currentGrade && !currentSubject && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', overflow:'auto', flexShrink:1 }}>
        <button onClick={() => setCurrentGrade(null)} style={backButtonStyle}>← К выбору класса</button>
        <h3 style={{ margin: 0 }}>{currentGrade.title}</h3>
        <p style={{ fontSize: '1.2rem', margin:'5px' }}>Выберите предмет:</p>
        {currentGrade.subjects.map(g => (
          <button key={g.title} onClick={() => setCurrentSubject(g)} style={menuButtonStyle}>{g.title}</button>
        ))}
      </div>
    )}
    {currentGrade && currentSubject && (
      <div style={{ width: '400px', display: "flex", flex: 1, overflow: 'auto', flexDirection: "column", maxWidth: '100%', wordBreak: "break-all" }}>
        <button onClick={() => setCurrentSubject(null)} style={backButtonStyle}>← К выбору предмета</button>
        <h3 style={{ margin: 0 }}>{currentGrade.title}</h3>
        <p style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '10px', margin: 0 }}>{currentSubject.title}</p>
        <div key={currentSubject.title} style={{ overflowY: 'auto', marginBottom: '20px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            {currentSubject.tests.map((t, i) => (
              <button key={t.title + i} onClick={() => startGame(t)} style={testButtonStyle}>
                {t.title}
              </button>
            ))}
          </div>
        </div>

      </div>
    )}
  </div>
}