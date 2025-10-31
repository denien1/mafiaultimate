export const metadata = { title: 'Mafia Starter', description: 'Clean-room social RPG starter' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'ui-sans-serif, system-ui', padding: 16, maxWidth: 960, margin: '0 auto' }}>
        <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h1>Mafia Starter</h1>
          <a href="/login">Login</a>
        </header>
        {children}
        <footer style={{ marginTop:24, fontSize:12, opacity:0.7 }}>
          Clean-room demo. Replace names/art before launch.
        </footer>
      </body>
    </html>
  );
}
