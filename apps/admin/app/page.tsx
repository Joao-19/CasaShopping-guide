// Redirect is handled by next.config.js redirects
// This page is just a fallback
export default function AdminHome() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <p>Redirecionando...</p>
    </div>
  );
}