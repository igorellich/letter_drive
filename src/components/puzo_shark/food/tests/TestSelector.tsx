import React, { useState } from 'react';
import type { IGrade, ITest, ISubject } from './interfaces';

interface Props {
  data: IGrade[];
  onSelectTest: (test: ITest) => void;
}

const TestSelector: React.FC<Props> = ({ data, onSelectTest }) => {
  const [selectedGrade, setSelectedGrade] = useState<IGrade | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<ISubject | null>(null);

  // Сброс при смене уровня
  const handleGradeSelect = (grade: IGrade) => {
    setSelectedGrade(grade);
    setSelectedSubject(null);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Выбор теста</h2>

      {/* Выбор Класса */}
      <div style={{ marginBottom: '15px' }}>
        {data.map((grade) => (
          <button 
            key={grade.title}
            onClick={() => handleGradeSelect(grade)}
            style={{ marginRight: '10px', fontWeight: selectedGrade?.title === grade.title ? 'bold' : 'normal' }}
          >
            {grade.title}
          </button>
        ))}
      </div>

      {/* Выбор Предмета */}
      {selectedGrade && (
        <div style={{ marginBottom: '15px' }}>
          <h4>Предметы в {selectedGrade.title}:</h4>
          {selectedGrade.subjects.map((subject) => (
            <button 
              key={subject.title}
              onClick={() => setSelectedSubject(subject)}
              style={{ marginRight: '10px', background: selectedSubject?.title === subject.title ? '#e0e0e0' : '#fff' }}
            >
              {subject.title}
            </button>
          ))}
        </div>
      )}

      {/* Выбор Теста */}
      {selectedSubject && (
        <div>
          <h4>Доступные тесты:</h4>
          <ul>
            {selectedSubject.tests.map((test) => (
              <li key={test.title} style={{ marginBottom: '5px' }}>
                {test.title} 
                <button 
                  onClick={() => onSelectTest(test)}
                  style={{ marginLeft: '10px' }}
                >
                  Начать
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TestSelector;
