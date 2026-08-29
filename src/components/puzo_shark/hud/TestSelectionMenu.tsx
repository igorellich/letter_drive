import { useState, type CSSProperties } from "react";
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

const gradeIcon: Record<string, string> = {
  '2 класс': '👧'
};
const subjectIcon: Record<string, string> = {
  'Математика': '🧮',
  'Английский': '🔤'
};

const TEST_EMOJI = ['🌟', '🚀', '🎲', '🌈', '⚡', '🏆', '🐠', '🍀', '🎯', '🎨'];

const kidBack: CSSProperties = {
  alignSelf: 'flex-start',
  display: 'inline-flex', alignItems: 'center', gap: 8,
  background: 'rgba(0,210,255,0.12)', color: '#7fdfff',
  border: '2px solid rgba(0,210,255,0.5)',
  padding: 'clamp(7px, 1.9vh, 10px) clamp(14px, 3.5vw, 22px)',
  borderRadius: 999, cursor: 'pointer', fontWeight: 'bold',
  fontSize: 'clamp(0.9rem, 2.6vh, 1.1rem)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
};

const homeChip: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(0,210,255,0.12)', color: '#7fdfff',
  border: '2px solid rgba(0,210,255,0.5)',
  minWidth: 'clamp(42px, 12vw, 54px)', minHeight: 'clamp(42px, 12vw, 54px)',
  borderRadius: 999, cursor: 'pointer',
  fontSize: 'clamp(1.2rem, 3.5vh, 1.5rem)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
};

const chipStyle: CSSProperties = {
  ...menuButtonStyle,
  width: '100%',
  padding: 'clamp(12px, 2.8vh, 18px) clamp(16px, 4vw, 28px)',
  fontSize: 'clamp(1.05rem, 3.2vh, 1.4rem)',
  borderRadius: '20px',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(6px, 1.6vw, 12px)',
  background: 'linear-gradient(135deg, #00d2ff 0%, #0078ff 100%)',
  boxShadow: '0 6px 20px rgba(0,150,255,0.35)'
};

const CARD_BGS = [
  'linear-gradient(135deg, rgba(0,210,255,0.24) 0%, rgba(0,120,255,0.08) 100%)',
  'linear-gradient(135deg, rgba(244,114,182,0.24) 0%, rgba(168,85,247,0.08) 100%)',
  'linear-gradient(135deg, rgba(251,191,36,0.24) 0%, rgba(245,158,11,0.08) 100%)',
  'linear-gradient(135deg, rgba(45,212,191,0.24) 0%, rgba(13,148,136,0.08) 100%)'
];

const testCard: CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12,
  padding: 'clamp(10px, 2.6vh, 16px) clamp(12px, 3vw, 18px)',
  borderRadius: 20, cursor: 'pointer', color: '#fff', fontWeight: 'bold',
  fontSize: 'clamp(0.95rem, 2.6vh, 1.15rem)', textAlign: 'left',
  border: '2px solid rgba(255,255,255,0.16)',
  boxShadow: 'inset 0 0 22px rgba(0,0,0,0.25), 0 6px 14px rgba(0,0,0,0.3)',
  transition: 'transform 0.15s'
};

export const TestSelectionMenu = (props: { startGame: (test: ITest) => void, onExitMenu?: () => void }) => {
  const { startGame, onExitMenu } = props;
  const [currentGrade, setCurrentGrade] = useState<IGrade | null>(null)
  const [currentSubject, setCurrentSubject] = useState<ISubject | null>(null)
  return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 10, width: 'min(94vw, 560px)', maxHeight: '92%' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <h1 style={{ color: '#00d2ff', margin: 0, fontSize: 'clamp(1.4rem, 4.5vh, 2rem)', textShadow: '0 0 20px rgba(0,210,255,0.5)' }}>📚 Выбери тест</h1>
      {onExitMenu && (
        <button onClick={onExitMenu} style={homeChip} aria-label="Выйти в главное меню">🏠</button>
      )}
    </div>
    {!currentGrade && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto', flexShrink: 1 }}>
        <p style={{ fontSize: 'clamp(0.95rem, 2.8vh, 1.2rem)', margin: '5px 0' }}>Выберите класс:</p>
        {[TwoGrade].map(g => (
          <button key={g.title} onClick={() => setCurrentGrade(g)} style={chipStyle}>
            <span style={{ fontSize: 'clamp(1.3rem, 4vh, 1.8rem)' }}>{gradeIcon[g.title] ?? '⭐'}</span>
            {g.title}
          </button>
        ))}
      </div>
    )}
    {currentGrade && !currentSubject && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto', flexShrink: 1 }}>
        <button onClick={() => setCurrentGrade(null)} style={kidBack}>◀ К выбору класса</button>
        <h3 style={{ margin: 0 }}>{currentGrade.title}</h3>
        <p style={{ fontSize: 'clamp(0.95rem, 2.8vh, 1.2rem)', margin: '5px' }}>Выберите предмет:</p>
        {currentGrade.subjects.map(g => (
          <button key={g.title} onClick={() => setCurrentSubject(g)} style={chipStyle}>
            <span style={{ fontSize: 'clamp(1.3rem, 4vh, 1.8rem)' }}>{subjectIcon[g.title] ?? '⭐'}</span>
            {g.title}
          </button>
        ))}
      </div>
    )}
    {currentGrade && currentSubject && (
      <div style={{ width: '100%', display: 'flex', flex: 1, minHeight: 0, flexDirection: 'column', gap: 10 }}>
        <button onClick={() => setCurrentSubject(null)} style={kidBack}>◀ К выбору предмета</button>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>{currentGrade.title}</h3>
          <span style={{ fontSize: 'clamp(0.8rem, 2.3vh, 0.95rem)', opacity: 0.7 }}>{currentSubject.title}</span>
        </div>
        <div key={currentSubject.title} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 6px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 235px), 1fr))', gap: 12, alignContent: 'start' }}>
          {currentSubject.tests.map((t, i) => (
            <button key={t.title + i} onClick={() => startGame(t)} style={{ ...testCard, background: CARD_BGS[i % CARD_BGS.length] }}>
              <span style={{ fontSize: 'clamp(1.4rem, 4.5vh, 2rem)' }}>{TEST_EMOJI[i % TEST_EMOJI.length]}</span>
              <span style={{ flex: 1 }}>{t.title}</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.7, flexShrink: 0 }}>{t.questions.length} в.</span>
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
}