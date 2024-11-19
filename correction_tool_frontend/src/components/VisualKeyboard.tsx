import React from 'react';

interface VisualKeyboardProps {
  onCharacterClick: (character: string) => void;
  characters: string[];
}

const VisualKeyboard: React.FC<VisualKeyboardProps> = ({ onCharacterClick, characters }) => {
  return (
    <div
      style={{
        display: 'flex',
        marginBottom: '16px',
        flexWrap: 'wrap',
        maxWidth: '100%',
        gap: '8px',
      }}
    >
      {characters.length > 0 && characters.map((char) => (
        <button
          key={char}
          onMouseDown={(e) => {
            e.preventDefault();
            onCharacterClick(char);
          }}
          style={{
            width: '40px',
            height: '40px',
            fontSize: '20px',
            border: '1.5px solid #7688a1',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: '#ffffff',
            color: '#374151',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: "'Noto Sans', system-ui, -apple-system, sans-serif",
            padding: '0',
          }}
          onMouseOver={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.backgroundColor = '#9ada23';
            btn.style.borderColor = '#0a3775';
            btn.style.transform = 'translateY(-1px)';
            btn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
          onMouseOut={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.backgroundColor = '#ffffff';
            btn.style.borderColor = '#7688a1';
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
          }}
        >
          {char}
        </button>
      ))}
    </div>
  );
};

export default VisualKeyboard;