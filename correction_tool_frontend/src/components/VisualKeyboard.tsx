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
      }}
    >
      {characters.length > 0 && characters.map((char) => (
        <button
          key={char}
          onMouseDown={(e) => {
            e.preventDefault(); // Prevents the button from taking focus
            onCharacterClick(char);
          }}
          style={{
            margin: '0 4px',
            padding: '8px 12px',
            fontSize: '18px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '8px',
            backgroundColor: '#f9f9f9', // Optional: Enhance button appearance
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e0e0e0';
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f9f9f9';
          }}
        >
          {char}
        </button>
      ))}
    </div>
  );
};

export default VisualKeyboard;