export const styles = {
  container: {
    height: "100vh",
    minHeight: "100vh",
    width: "1200px",
    position: "relative" as const,
    overflow: "hidden",
    padding: "0 20px"
  },
  editorContainer: {
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    padding: "24px",
    transition: "background-color 0.2s ease",
  },
  editor: {
    border: "1.5px solid black",
    borderRadius: "12px",
    marginTop: "26px",
    marginBottom: "30px",
    padding: "14px",
    fontSize: "24px",
    fontFamily: "'Noto Sans', system-ui, -apple-system, sans-serif",
    flex: "1 1 auto",
    minHeight: "calc(100vh - 500px)",
    maxHeight: "calc(100vh - 300px)",
    overflowY: "auto",
    backgroundColor: "#ffffff",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    transition: "all 0.2s ease",
    lineHeight: "1.8",
  },
  controlsContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
    width: "100%",
  },
  buttonGroup: {
    display: "flex",
    gap: "8px",
  },
  dropdownContainer: {
    marginLeft: "auto",
    position: "relative",
    zIndex: 10,
    marginTop: "10px",
  },
} as const;
