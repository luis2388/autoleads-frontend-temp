import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw, Plus, Play, Pause, Square, Clock, CheckCircle2, Users, GitBranch, Bot, ChevronRight, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { SkeletonTable } from '../components/ui/Skeleton';

function StatusBadge({ status }) {
  const map = { ativo: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Ativo' }, pausado: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Pausado' }, cancelado: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Cancelado' } };
  const s = map[status] || map.ativo;
  return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: s.color, background: s.bg }}>{s.label}</span>;
}

function NovoFollowUp({ onBack, onCriado }) {
  const [nome, setNome] = useState(''); const [campanhaId, setCampanhaId] = useState(''); const [filtro, setFiltro] = useState('todos');
  const [modo, setModo] = useState('fluxo'); const [fluxoId, setFluxoId] = useState('');
  const [campanhas, setCampanhas] = useState([]); const [fluxos, setFluxos] = useState([]); const [chips, setChips] = useState([]);
  const [chipsSelecionados, setChipsSelecionados] = useState([]); const [saving, setSaving] = useState(false);
  useEffect(() => { api.listarCampanhasManuais().then(setCampanhas).catch(() => {}); api.listarFluxos().then(setFluxos).catch(() => {}); api.listarChips().then(setChips).catch(() => {}); }, []);
  function toggleChip(id) { setChipsSelecionados(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]); }

  async function criar() {
    if (!nome.trim() || !campanhaId || chipsSelecionados.length === 0) return toast.error('Preencha todos os campos');
    if (modo === 'fluxo' && !fluxoId) return toast.error('Selecione um fluxo');
    setSaving(true);
    try { const r = await api.criarFollowup({ nome, campanha_origem_id: parseInt(campanhaId), modo, fluxo_id: modo === 'fluxo' ? fluxoId : null, filtro_destinatarios: filtro, chips_selecionados: chipsSelecionados, horario_inicio: '08:00', horario_fim: '20:00', delay_min_segundos: 10, delay_max_segundos: 30 }); toast.success(`Follow-up criado com ${r.total_leads} leads!`); onCriado(); } catch (err) { toast.error(err.message); }
    setSaving(false);
  }

  return (<div><div className="page-header"><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><button className="btn-secondary btn-sm" onClick={onBack}>← Voltar</button><h1 className="page-title">Novo Follow-up</h1></div></div>
    <div className="card" style={{ maxWidth: 600 }}><div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="form-group"><label>Nome</label><input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Nutrição pós-disparo" /></div>
      <div className="form-group"><label>Campanha de origem</label><select value={campanhaId} onChange={e => setCampanhaId(e.target.value)}><option value="">— Selecione —</option>{campanhas.map(c => <option key={c.id} value={c.id}>{c.nome} ({c.enviados} enviados)</option>)}</select></div>
      <div className="form-group"><label>Filtrar destinatários</label><select value={filtro} onChange={e => setFiltro(e.target.value)}><option value="todos">Todos</option><option value="nao_respondeu">Não respondeu</option><option value="respondeu">Respondeu</option></select></div>
      <div className="form-group"><label>Modo</label><div style={{ display: 'flex', gap: 8 }}><button className={modo === 'fluxo' ? 'btn-primary' : 'btn-secondary'} onClick={() => setModo('fluxo')} style={{ flex: 1 }}><GitBranch size={14} /> Fluxo</button><button className={modo === 'ia' ? 'btn-primary' : 'btn-secondary'} onClick={() => setModo('ia')} style={{ flex: 1 }}><Bot size={14} /> IA</button></div></div>
      {modo === 'fluxo' && <div className="form-group"><label>Fluxo</label><select value={fluxoId} onChange={e => setFluxoId(e.target.value)}><option value="">— Selecione —</option>{fluxos.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}</select></div>}
      <h4 style={{ fontWeight: 600 }}>Chips</h4>
      {chips.filter(c => c.status === 'connected').map(chip => { const sel = chipsSelecionados.includes(chip.id); return <label key={chip.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: `2px solid ${sel ? 'var(--accent)' : 'var(--border)'}`, marginBottom: 6, cursor: 'pointer' }}><input type="checkbox" checked={sel} onChange={() => toggleChip(chip.id)} /><span style={{ fontSize: 13 }}>{chip.phone_number || chip.instance_name}</span></label>; })}
      <button className="btn-primary" style={{ width: '100%' }} onClick={criar} disabled={saving}>{saving ? 'Ativando...' : 'Ativar Follow-up'}</button>
    </div></div>
  </div>);
}

export default function FollowUp() {
  const [view, setView] = useState('lista'); const [followups, setFollowups] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { if (view === 'lista') carregar(); }, [view]);
  async function carregar() { setLoading(true); try { setFollowups(await api.listarFollowups()); } catch (err) { toast.error(err.message); } setLoading(false); }
  async function controlar(id, acao) { try { await api.controlarFollowup(id, acao); toast.success(`Follow-up ${acao}do`); carregar(); } catch (err) { toast.error(err.message); } }
  if (view === 'novo') return <NovoFollowUp onBack={() => setView('lista')} onCriado={() => setView('lista')} />;

  return (<div>
    <div className="page-header"><div><h1 className="page-title">Follow-up Automático</h1><p className="page-subtitle">Recontate leads automaticamente com fluxos ou IA</p></div>
      <button className="btn-primary" onClick={() => setView('novo')}><Plus size={16} style={{ marginRight: 6, display: 'inline' }} />Novo Follow-up</button></div>
    <div className="card">{loading ? <SkeletonTable rows={4} cols={6} /> : followups.length === 0 ? (<div className="empty-state"><RefreshCw size={40} /><p>Nenhum follow-up configurado.</p><button className="btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => setView('novo')}>Criar primeiro follow-up</button></div>) : (
      <table><thead><tr><th>Nome</th><th>Modo</th><th>Status</th><th>Leads</th><th>Concluídos</th><th></th></tr></thead>
        <tbody>{followups.map(f => <tr key={f.id}><td style={{ fontWeight: 500 }}>{f.nome}</td><td>{f.modo === 'fluxo' ? <><GitBranch size={13} /> Fluxo</> : <><Bot size={13} /> IA</>}</td><td><StatusBadge status={f.status} /></td><td>{f.total_leads || 0}</td><td style={{ color: '#10b981' }}>{f.concluidos || 0}</td>
          <td><div style={{ display: 'flex', gap: 6 }}>{f.status === 'ativo' && <button className="btn-secondary btn-sm" onClick={() => controlar(f.id, 'pausar')}><Pause size={12} /> Pausar</button>}{f.status === 'pausado' && <button className="btn-primary btn-sm" onClick={() => controlar(f.id, 'retomar')}><Play size={12} /> Retomar</button>}{f.status !== 'cancelado' && <button className="btn-secondary btn-sm" style={{ color: '#ef4444' }} onClick={() => controlar(f.id, 'cancelar')}><Square size={12} /></button>}</div></td></tr>)}</tbody></table>
    )}</div>
  </div>);
}
