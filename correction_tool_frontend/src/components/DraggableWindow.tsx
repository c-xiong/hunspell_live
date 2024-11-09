import React, { useRef, useState, useEffect } from 'react';
import Draggable from "react-draggable";

interface DraggableWindowProps {
  isOpen: boolean;
  onClose: () => void;
  initialPosition: { x: number; y: number };
  parentRef: React.RefObject<HTMLDivElement>;
  content: React.ReactNode;
}

const DraggableWindow: React.FC<DraggableWindowProps> = ({
  isOpen,
  onClose,
  initialPosition,
  parentRef,
  content,
}) => {
  const nodeRef = useRef(null);
  const [position, setPosition] = useState(initialPosition);

  useEffect(() => {
    if (parentRef.current) {
      const parentRect = parentRef.current.getBoundingClientRect();
      const windowWidth = 300; // Width of the draggable window
      const windowHeight = 300; // Height of the draggable window
      const margin = 20; // Margin between the cursor and the window
      const verticalOffset = 20; // Additional offset to adjust the window lower

      // Calculate x and y positions relative to the parent container
      let xPos = initialPosition.x - parentRect.left - windowWidth / 2;
      let yPos = initialPosition.y - parentRect.top + margin + verticalOffset; // Added verticalOffset here

      // Ensure the window doesn't overflow to the left
      if (xPos < margin) {
        xPos = margin;
      }

      // Ensure the window doesn't overflow to the right
      if (xPos + windowWidth > parentRect.width - margin) {
        xPos = parentRect.width - windowWidth - margin;
      }

      // Ensure the window doesn't overflow to the bottom
      if (yPos + windowHeight > parentRect.height - margin) {
        // Position above the cursor if there's not enough space below
        yPos = initialPosition.y - parentRect.top - windowHeight - margin - verticalOffset; // Adjusted with verticalOffset
        // Ensure it doesn't overflow the top
        if (yPos < margin) {
          yPos = margin;
        }
      }

      setPosition({
        x: xPos,
        y: yPos,
      });
    }
  }, [initialPosition, parentRef]);

  if (!isOpen) return null;

  return (
    <Draggable nodeRef={nodeRef} handle=".handle" defaultPosition={position}>
      <div 
        ref={nodeRef} 
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          backgroundColor: "white",
          // border: "1px solid #000000",
          borderRadius: "16px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
          width: "300px",
          maxHeight: "500px",
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
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span></span>
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
          {content}
        </div>
      </div>
    </Draggable>
  );
};

export default DraggableWindow;