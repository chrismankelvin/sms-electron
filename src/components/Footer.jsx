export default function Footer() {
  return (
    <footer
      style={{
        textAlign: "center",
        padding: "1rem",
        backgroundColor: "var(--card-bg)",
        color: "var(--text)",
        borderTop: "1px solid var(--border)",
      }}
    >
      &copy; {new Date().getFullYear()} Phash-C
    </footer>
  );
}
