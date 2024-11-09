import React, { useRef, useState, useEffect } from 'react';
import Draggable from "react-draggable";

interface DraggableWindowProps {
  isOpen: boolean;
  onClose: () => void;
  initialPosition: { x: number; y: number };
  parentRef: React.RefObject<HTMLDivElement>;
  suggestions: string[];
  language: string;
  onWordClick: (word: string) => void;
  height?: number;
}

const DraggableWindow: React.FC<DraggableWindowProps> = ({
  isOpen,
  onClose,
  initialPosition,
  parentRef,
  suggestions,
  language,
  onWordClick,
  height = 300,
}) => {
  const nodeRef = useRef(null);
  const [position, setPosition] = useState(initialPosition);

  useEffect(() => {
    if (parentRef.current) {
      const parentRect = parentRef.current.getBoundingClientRect();
      const windowWidth = 300;
      const windowHeight = height;
      const margin = 20;
      const verticalOffset = 20;

      let xPos = initialPosition.x - parentRect.left - windowWidth / 2;
      let yPos = initialPosition.y - parentRect.top + margin + verticalOffset;

      if (xPos < margin) {
        xPos = margin;
      }

      if (xPos + windowWidth > parentRect.width - margin) {
        xPos = parentRect.width - windowWidth - margin;
      }

      if (yPos + windowHeight > parentRect.height - margin) {
        yPos = initialPosition.y - parentRect.top - windowHeight - margin - verticalOffset;
        if (yPos < margin) {
          yPos = margin;
        }
      }

      setPosition({
        x: xPos,
        y: yPos,
      });
    }
  }, [initialPosition, parentRef, height]);

  if (!isOpen) return null;

  return (
    <Draggable nodeRef={nodeRef} handle=".handle" defaultPosition={position}>
      <div 
        ref={nodeRef} 
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          backgroundColor: "#1a1a1a",
          borderRadius: "16px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
          width: "300px",
          height: height,
          overflow: "auto",
          cursor: "default",
          zIndex: 1000,
          color: "white",
          fontSize: "20px",
          fontFamily: "'Inter', sans-serif",
          transition: "left 0.3s ease, top 0.3s ease",
        }}
      >
        <div 
          className="handle" 
          style={{
            padding: "6px",
            backgroundColor: "#008fee",
            marginBottom: "2px",
            cursor: "grab",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <button 
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: "20px",
              cursor: "pointer",
              padding: "0",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: "12px" }}>
          <div className="flex flex-wrap gap-2">
            {suggestions.length > 0 ? (
              suggestions.map((word, index) => (
                <button
                  key={index}
                  onClick={() => onWordClick(word)}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#000000",
                    borderRadius: "4px",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#c56363";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#2d2d2d";
                  }}
                >
                  {word}
                </button>
              ))
            ) : (
              <div style={{ 
                textAlign: "center", 
                width: "100%",
                color: "#888",
                fontSize: "1.2rem"
              }}>
                No suggestions available
              </div>
            )}
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default DraggableWindow;