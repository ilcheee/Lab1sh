import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/axios';
import PublicLayout from './PublicLayout';

const GRID_BG = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
  backgroundSize: '50px 50px',
};

const ROLE_OPTIONS = [
  'General Inquiry',
  'Request Author Role',
  'Request Contributor Role',
  'Request Editor Role',
  'Report a Problem',
  'Other',
];

function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;
    const COUNT = 45;
    const particles = Array.from({ length: COUNT }, () => {
      const r = Math.random() * 0.5 + 1.2;
      return { x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28, r, cr: r };
    });
    const mouse = { x: -9999, y: -9999 };
    const onMM = (e) => { const rect = canvas.getBoundingClientRect(); mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top; };
    window.addEventListener('mousemove', onMM);
    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const dists = particles.map(p => { const dx = p.x - mouse.x, dy = p.y - mouse.y; return Math.sqrt(dx * dx + dy * dy); });
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const i = particles.indexOf(p);
        const prox = Math.max(0, 1 - dists[i] / 80);
        p.cr = p.cr + (p.r + prox * (3.5 - p.r) - p.cr) * 0.15;
        ctx.shadowBlur = prox * 7; ctx.shadowColor = 'rgba(255,255,255,0.8)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.cr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.45 + prox * 0.55})`; ctx.fill(); ctx.shadowBlur = 0;
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            const mg = Math.max(0, 1 - Math.min(dists[i], dists[j]) / 100);
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${Math.min(0.45, 0.18 * (1 - d / 120) + mg * 0.22)})`; ctx.lineWidth = 1; ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { W = canvas.offsetWidth; H = canvas.offsetHeight; canvas.width = W; canvas.height = H; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('mousemove', onMM); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />;
}

const fieldVariants = {
  hidden: { opacity: 0, y: 18 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.09, duration: 0.38 } }),
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '12px 16px',
  color: '#fff',
  fontSize: 14,
  fontFamily: "'Geist', system-ui, sans-serif",
  outline: 'none',
  transition: 'border-color 0.15s',
  marginBottom: 14,
};

function FormField({ custom, children }) {
  return (
    <motion.div custom={custom} variants={fieldVariants} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({ emri: '', email: '', lloji: 'General Inquiry', mesazhi: '' });
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading'); setErrorMsg('');
    try {
      await API.post('/contact', form);
      setStatus('success');
      setForm({ emri: '', email: '', lloji: 'General Inquiry', mesazhi: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.response?.data?.message || 'Failed to submit. Please try again.');
    }
  };

  const onFocus = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.3)'; };
  const onBlur = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; };

  return (
    <PublicLayout>
      <div style={{ background: '#000', ...GRID_BG, minHeight: 'calc(100vh - 60px)', position: 'relative', overflow: 'hidden' }}>
        <ParticleCanvas />
        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: 1100, margin: '0 auto', padding: '72px 24px 96px',
          display: 'flex', gap: 64, alignItems: 'flex-start', flexWrap: 'wrap',
        }}>

          {/* ── Left: Form ── */}
          <div style={{ flex: '0 0 54%', minWidth: 280 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>
                Get in touch
              </div>
              <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 10 }}>
                Contact Us
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
                Have a question or want to request a role? We typically respond within 24–48 hours.
              </p>
            </motion.div>

            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                style={{
                  background: 'rgba(34,197,94,0.07)',
                  border: '1px solid rgba(34,197,94,0.2)',
                  borderRadius: 16, padding: '36px 28px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', marginBottom: 10 }}>Message Sent!</h3>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
                  Your request has been submitted. We'll get back to you soon.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  style={{ marginTop: 20, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontFamily: "'Geist', system-ui, sans-serif" }}
                >
                  Send another
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
                <FormField custom={0}>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6, fontWeight: 500 }}>Name</label>
                  <input
                    type="text" required value={form.emri} onChange={update('emri')}
                    placeholder="Your full name"
                    style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                  />
                </FormField>

                <FormField custom={1}>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6, fontWeight: 500 }}>Email</label>
                  <input
                    type="email" required value={form.email} onChange={update('email')}
                    placeholder="your@email.com"
                    style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                  />
                </FormField>

                <FormField custom={2}>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6, fontWeight: 500 }}>Subject</label>
                  <select
                    required value={form.lloji} onChange={update('lloji')}
                    style={{ ...inputStyle, color: '#fff', cursor: 'pointer' }}
                    onFocus={onFocus} onBlur={onBlur}
                  >
                    {ROLE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </FormField>

                <FormField custom={3}>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6, fontWeight: 500 }}>Message</label>
                  <textarea
                    required rows={6} value={form.mesazhi} onChange={update('mesazhi')}
                    placeholder="Describe your request in detail…"
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 130, lineHeight: 1.7 }}
                    onFocus={onFocus} onBlur={onBlur}
                  />
                </FormField>

                {status === 'error' && (
                  <div style={{ color: '#ff4444', fontSize: 13, marginBottom: 14 }}>{errorMsg}</div>
                )}

                <FormField custom={4}>
                  <motion.button
                    type="submit"
                    disabled={status === 'loading'}
                    whileHover={{ scale: status === 'loading' ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="ubt-btn ubt-btn-primary"
                    style={{ width: '100%', padding: '13px 0', fontSize: 14, fontWeight: 600, opacity: status === 'loading' ? 0.65 : 1, justifyContent: 'center' }}
                  >
                    {status === 'loading' ? 'Sending…' : 'Send Message'}
                  </motion.button>
                </FormField>
              </form>
            )}
          </div>

          {/* ── Right: Info ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            style={{ flex: 1, minWidth: 200, paddingTop: 82 }}
          >
            {/* Mail SVG */}
            <div style={{
              padding: 28, background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 24, display: 'inline-flex', marginBottom: 28,
            }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.4px', marginBottom: 12 }}>
              We'd love to hear from you
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, lineHeight: 1.75, marginBottom: 32, maxWidth: 260 }}>
              Whether you have a question, feedback, or want to join our team — drop us a message.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { icon: '◎', title: 'Role Requests', desc: 'Want to write or edit? Request access through this form.' },
                { icon: '⚑', title: 'Report Issues', desc: 'Found a bug or problem? Let us know and we\'ll fix it.' },
                { icon: '✎', title: 'General Inquiries', desc: 'Any other questions? We read every message.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, color: 'rgba(255,255,255,0.35)',
                  }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{title}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        select option { background: #1a1a1a; color: #fff; }
      `}</style>
    </PublicLayout>
  );
}
