import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#000', fontFamily: "'Geist', system-ui, sans-serif", color: '#fff' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', background: '#000' }}>
        {children}
      </main>
    </div>
  );
}
