import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Database, RefreshCw, CheckCircle, XCircle, Clock, Copy, AlertTriangle } from 'lucide-react';

export default function Admin() {
  const [tab, setTab] = useState('usuarios');
  const [usuarios, setUsuarios] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [novoUsuario, setNovoUsuario] = useState({ email: '', password: '', role: 'user', nome: '', telefone: '', plan_id: '' });
  const [msg, setMsg] = useState(''); const [error, setError] = useState('');
  const [resetId, setResetId] = useState(null); const [novaSenha, setNovaSenha] = useState('');

  useEffect(() => { carregarDados(); }, []);

  async function carregarDados() {
    setLoading(true);
    try { const [u, s, pl] = await Promise.all([api.adminListarUsuarios(), api.adminStats(), api.adminListarPlanos()]); setUsuarios(u); setStats(s); setPlanos(pl); } catch {}
    setLoading(false);
  }

  async function criarUsuario(e) { e.preventDefault(); setMsg(''); setError(''); try { await api.adminCriarUsuario({...novoUsuario, plan_id: novoUsuario.plan_id || null}); setMsg('Cliente criado!'); setNovoUsuario({ email: '', password: '', role: 'user', nome: '', telefone: '', plan_id: '' }); carregarDados(); } catch (err) { setError(err.message); } }
  async function toggleUsuario(id) { try { const r = await api.adminToggleUsuario(id); setUsuarios(p => p.map(u => u.id === id ? { ...u, active: r.active } : u)); } catch (err) { alert(err.message); } }
  async function alterarRole(id, role) { try { await api.adminAlterarRole(id, role); setUsuarios(p => p.map(u => u.id === id ? { ...u, role } : u)); } catch (err) { alert(err.message); } }
  async function resetarSenha(e) { e.preventDefault(); try { await api.adminResetSenha(resetId, novaSenha); alert('Senha alterada!'); setResetId(null); setNovaSenha(''); } catch (err) { alert(err.message); } }
  async function alterarPlanoUsuario(userId, planId) { try { await api.adminAtualizarPlanoUsuario(userId, planId || null); carregarDados(); } catch (err) { alert(err.message); } }

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}><span className="loading" /></div>;

  const TABS = [{ key: 'usuarios', label: '👥 Usuários' }, { key: 'criar', label: '➕ Novo Cliente' }, { key: 'planos', label: '📦 Planos' }];

  return (
    <div>
      <div className="page-header"><div><h1 className="page-title">Painel Admin</h1><p className="page-subtitle">Gestão de clientes, planos e integrações</p></div></div>
      {stats && <div className="stats-grid"><div className="stat-card"><div className="stat-value">{stats.total_usuarios}</div><div className="stat-label">Clientes</div></div><div className="stat-card"><div className="stat-value">{planos.length}</div><div className="stat-label">Planos</div></div><div className="stat-card"><div className="stat-value">{stats.total_leads}</div><div className="stat-label">Leads Maps</div></div><div className="stat-card"><div className="stat-value">{stats.total_cnpj_leads}</div><div className="stat-label">Leads CNPJ</div></div></div>}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>{TABS.map(t => <button key={t.key} className={tab === t.key ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'} onClick={() => setTab(t.key)}>{t.label}</button>)}</div>

      {tab === 'usuarios' && <div className="card">
        {resetId && <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}><div className="card" style={{ width:380 }}><h3 style={{ fontWeight:600, marginBottom:16 }}>Resetar senha</h3><form onSubmit={resetarSenha} style={{ display:'flex', flexDirection:'column', gap:14 }}><div className="form-group"><label>Nova senha</label><input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} minLength={8} required /></div><div style={{ display:'flex', gap:10 }}><button type="submit" className="btn-primary">Salvar</button><button type="button" className="btn-secondary" onClick={() => setResetId(null)}>Cancelar</button></div></form></div></div>}
        <div className="table-wrapper"><table><thead><tr><th>#</th><th>Nome / Email</th><th>Plano</th><th>Role</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>{usuarios.map(u => <tr key={u.id}><td>{u.id}</td><td><div style={{ fontWeight:500 }}>{u.nome || '—'}</div><div style={{ fontSize:12, color:'var(--text-muted)' }}>{u.email}</div></td><td><select value={u.plan_id || ''} onChange={e => alterarPlanoUsuario(u.id, e.target.value)} style={{ width:'auto', padding:'4px 8px', fontSize:12 }}><option value="">Sem plano</option>{planos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></td><td><select value={u.role} onChange={e => alterarRole(u.id, e.target.value)} style={{ width:'auto', padding:'4px 8px', fontSize:12 }}><option value="user">Usuário</option><option value="admin">Admin</option></select></td><td><span className={`badge ${u.active ? 'badge-green' : 'badge-red'}`}>{u.active ? 'Ativo' : 'Bloqueado'}</span></td><td><div style={{ display:'flex', gap:6 }}><button className={`btn-sm ${u.active ? 'btn-danger' : 'btn-secondary'}`} onClick={() => toggleUsuario(u.id)}>{u.active ? 'Bloquear' : 'Ativar'}</button><button className="btn-secondary btn-sm" onClick={() => { setResetId(u.id); setNovaSenha(''); }}>Senha</button></div></td></tr>)}</tbody></table></div>
      </div>}

      {tab === 'criar' && <div className="card"><h3 style={{ fontWeight:600, marginBottom:20 }}>Novo cliente</h3>
        {msg && <div className="alert alert-success" style={{ marginBottom:16 }}>{msg}</div>}
        {error && <div className="alert alert-error" style={{ marginBottom:16 }}>{error}</div>}
        <form onSubmit={criarUsuario} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="form-row"><div className="form-group"><label>Email *</label><input type="email" value={novoUsuario.email} onChange={e => setNovoUsuario({ ...novoUsuario, email: e.target.value })} required /></div><div className="form-group"><label>Senha *</label><input type="password" value={novoUsuario.password} onChange={e => setNovoUsuario({ ...novoUsuario, password: e.target.value })} required minLength={8} /></div></div>
          <div className="form-row"><div className="form-group"><label>Nome</label><input value={novoUsuario.nome} onChange={e => setNovoUsuario({ ...novoUsuario, nome: e.target.value })} /></div><div className="form-group"><label>Telefone</label><input value={novoUsuario.telefone} onChange={e => setNovoUsuario({ ...novoUsuario, telefone: e.target.value })} /></div></div>
          <button type="submit" className="btn-primary" style={{ alignSelf:'flex-start' }}>Criar cliente</button>
        </form></div>}

      {tab === 'planos' && <div className="card"><p style={{ color: 'var(--text-muted)' }}>Gestão de planos disponível na versão completa.</p></div>}
    </div>
  );
}
