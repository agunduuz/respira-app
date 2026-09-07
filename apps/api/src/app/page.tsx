export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 48, lineHeight: 1.6 }}>
      <h1 style={{ marginBottom: 8 }}>Respira API</h1>
      <p style={{ color: "#666", marginTop: 0 }}>
        Bu servis Respira mobil uygulamasının backend&apos;idir. Kullanıcı arayüzü yoktur.
      </p>
      <p>
        Sağlık kontrolü: <code>GET /api/health</code>
      </p>
    </main>
  );
}
