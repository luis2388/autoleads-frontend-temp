import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Configuracoes() {
  const [form, setForm] = useState({
    apify_key: '',
    casa_dados_key: '',
    openai_key: '',
    anthropic_key: '',
    gemini_key: '',
    evolution_url: '',
    evolution_key: '',
  });
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSettings().then((data) => {
      setStatus(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setMsg('');
    setError('');
    setSaving(true);

    const payload = {};
    Object.entries(form).forEach(([k, v]) => {
      if (v.trim()) payload[k] = v.trim();
    });

    try {
      await api.updateSettings(payload);
      setMsg('Configurações salvas com sucesso!');
      setForm({ apify_key: '', casa_dados_key: '', openai_key: '', evolution_url: '', evolution_key: '' });
      const data = await api.getSettings();
      setStatus(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}><span className="loading" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Configurações de API</h1>
          <p className="page-subtitle">Suas chaves ficam armazenadas com segurança no banco de dados</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Status das integrações</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { key: 'apify_key', label: 'Apify (Google Maps)', icon: '🗺️' },
            { key: 'casa_dados_key', label: 'Casa dos Dados', icon: '🏢' },
            { key: 'openai_key', label: 'OpenAI', icon: '🤖' },
            { key: 'anthropic_key', label: 'Anthropic (Claude)', icon: '🔮' },
            { key: 'gemini_key', label: 'Google Gemini', icon: '✨' },
            { key: 'evolution_url', label: 'Evolution API URL', icon: '📱' },
            { key: 'evolution_key', label: 'Evolution API Key', icon: '🔑' },
          ].map(({ key, label, icon }) => (
            <div key={key} style={{
              padding: '12px 16px', background: 'var(--bg3)', borderRadius: 8,
              border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>
                  {status[key] ? (
                    <span style={{ color: '#10b981' }}>✓ Configurado</span>
                  ) : (
                    <span style={{ color: '#ef4444' }}>✗ Não configurado</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 600, marginBottom: 6 }}>Atualizar chaves</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
          Preencha apenas os campos que deseja atualizar. Campos em branco não sobrescrevem o valor atual.
        </p>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {msg && <div className="alert alert-success">{msg}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label>🗺️ Apify API Key</label>
            <input type="password" placeholder="apify_api_xxxxxxxx" value={form.apify_key} onChange={(e) => setForm({ ...form, apify_key: e.target.value })} />
            <small style={{ color: 'var(--text-muted)', fontSize: 12 }}>Usada para mineração de leads via Google Maps</small>
          </div>

          <div className="form-group">
            <label>🏢 Casa dos Dados API Key</label>
            <input type="password" placeholder="Token xxxxxxxx" value={form.casa_dados_key} onChange={(e) => setForm({ ...form, casa_dados_key: e.target.value })} />
            <small style={{ color: 'var(--text-muted)', fontSize: 12 }}>Enriquece dados de CNPJ (complementa a Brasil API gratuita)</small>
          </div>

          <div className="form-group">
            <label>🤖 OpenAI API Key</label>
            <input type="password" placeholder="sk-xxxxxxxx" value={form.openai_key} onChange={(e) => setForm({ ...form, openai_key: e.target.value })} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>🔮 Anthropic API Key (Claude)</label>
              <input type="password" placeholder="sk-ant-xxxxxxxx" value={form.anthropic_key} onChange={(e) => setForm({ ...form, anthropic_key: e.target.value })} />
            </div>
            <div className="form-group">
              <label>✨ Google Gemini API Key</label>
              <input type="password" placeholder="AIzaSy..." value={form.gemini_key} onChange={(e) => setForm({ ...form, gemini_key: e.target.value })} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>📱 Evolution API URL</label>
              <input type="url" placeholder="https://evolution.seuservidor.com" value={form.evolution_url} onChange={(e) => setForm({ ...form, evolution_url: e.target.value })} />
            </div>
            <div className="form-group">
              <label>🔑 Evolution API Key</label>
              <input type="password" placeholder="Chave de autenticação" value={form.evolution_key} onChange={(e) => setForm({ ...form, evolution_key: e.target.value })} />
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <><span className="loading" style={{ marginRight: 8 }} /> Salvando...</> : 'Salvar configurações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
