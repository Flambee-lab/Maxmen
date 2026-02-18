export function GameInstruction() {
  return (
    <p
      style={{
        fontFamily: "var(--font-bitter), serif",
        fontWeight: 600,
        fontSize: "32px",
        color: "#FFFFFF",
        textAlign: "center",
      }}
    >
      <span style={{ color: "#FFFFFF" }}>Click a name </span>
      <span style={{ color: "rgba(255, 255, 255, 0.60)" }}>
        and connect it to the matching photo
      </span>
    </p>
  );
}
