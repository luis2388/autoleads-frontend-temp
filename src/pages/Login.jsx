import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Mail, Lock, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { saveAuth } from '../services/auth';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api.login(email, password);
      saveAuth(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      <div style={{
        width: '45%',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 48, position: 'relative', overflow: 'hidden',
      }} className="hidden-mobile">
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.15)' }} />
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 32px rgba(99,102,241,0.5)' }}>
            <Rocket size={36} color="#fff" />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: 12 }}>AutoLeads</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: 300 }}>Capture, qualifique e prospecte leads com IA em poucos cliques.</p>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {['🗺️ Mineração via Google Maps', '🏢 Extração por CNPJ', '🤖 Disparos com IA (GPT / Claude)', '📊 Score automático de oportunidade'].map((item) => (
              <div key={item} style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 500, textAlign: 'left' }}>{item}</div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, position: 'relative' }}>
        <button onClick={toggleTheme} className="btn-ghost btn-icon" style={{ position: 'absolute', top: 24, right: 24, background: 'var(--bg3)', border: '1px solid var(--border)', color: theme === 'light' ? '#f59e0b' : '#a5b4fc', borderRadius: 10, padding: 9 }} title="Alternar tema">
          {theme === 'light' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.4px', marginBottom: 6 }}>Entrar na plataforma</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Acesse sua conta para continuar</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (<div className="alert alert-error"><span>⚠️</span> {error}</div>)}
            <div className="form-group">
              <label>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)', pointerEvents: 'none' }} />
                <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ paddingLeft: 40 }} />
              </div>
            </div>
            <div className="form-group">
              <label>Senha</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)', pointerEvents: 'none' }} />
                <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ paddingLeft: 40 }} />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8, justifyContent: 'center', padding: '13px 20px', fontSize: 15 }}>
              {loading ? <><span className="loading" /> Entrando...</> : <><ArrowRight size={17} /> Entrar</>}
            </button>
          </form>
          <p style={{ marginTop: 28, fontSize: 12, color: 'var(--text-soft)', textAlign: 'center' }}>AutoLeads · Sistema de Captação e Qualificação de Leads</p>
        </div>
      </div>
    </div>
  );
}
