export const styles = {
  container: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gridTemplateRows: "80px 1fr",
    gridTemplateAreas: `
      "header"
      "main"
    `,
    height: "100vh",
    width: "100%",
    overflow: "hidden",
  },
  
  content: {
    gridArea: "main",
    padding: "24px",
    display: "flex", 
    flexDirection: "column" as const,
    justifyContent: "flex-start",
    alignItems: "center",
    gap: "24px",
    overflow: "hidden",
    margin: "0 auto",
    width: "100%",
    maxWidth: "1400px",
    height: "calc(100vh - 80px)",
    "@media (max-width: 768px)": {
      padding: "16px",
      maxWidth: "95%",
    },
  },

  editor: {
    flex: "1 1 auto",
    minHeight: "40vh",
    width: "100%",
    padding: "16px",
    fontSize: "24px",
    lineHeight: "1.6",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#1a1a1a",
    outline: "none",
    resize: "none" as const,
    overflowY: "auto",
    "@media (max-width: 768px)": {
      fontSize: "16px",
      padding: "12px",
      minHeight: "50vh",
    },
  },
  
  editorContainer: {
    width: "100%",
    height: "calc(100vh - 200px)",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    padding: "20px",
    transition: "background-color 0.2s ease",
    marginBottom: "100px",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
    "@media (max-width: 768px)": {
      height: "calc(100vh - 240px)",
      padding: "12px",
    },
  },

  controlsContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    width: "100%",
    padding: "0 8px",
    "@media (max-width: 768px)": {
      flexWrap: "wrap",
      gap: "8px",
      marginBottom: "12px",
    },
  },

  buttonGroup: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    "@media (max-width: 768px)": {
      gap: "8px",
      flexWrap: "wrap",
    },
  },

  dropdownContainer: {
    marginLeft: "auto",
    position: "relative",
    zIndex: 10,
    "@media (max-width: 768px)": {
      width: "100%",
      marginLeft: 0,
      marginTop: "8px",
    },
  },
} as const;
