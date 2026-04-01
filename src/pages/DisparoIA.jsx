import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Bot, Play, Pause, Square, Download, RefreshCw, CheckCircle2, AlertCircle, Zap, FlaskConical } from 'lucide-react';
import { api } from '../services/api';
import { Progress } from '../components/ui/Progress';
import { SkeletonTable } from '../components/ui/Skeleton';

const PROVIDERS = [{ id: 'openai', label: 'OpenAI (GPT-4o Mini)', icon: '🤖', cor: '#10a37f' }, { id: 'anthropic', label: 'Anthropic (Claude)', icon: '🔮', cor: '#d4670f' }, { id: 'gemini', label: 'Google (Gemini Flash)', icon: '✨', cor: '#4285f4' }];
const TONS = ['profissional', 'informal', 'direto', 'descontraído', 'persuasivo', 'empático'];

export default function DisparoIA() {
  const [view, setView] = useState('lista'); const [campanhas, setCampanhas] = useState([]); const [loadingLista, setLoadingLista] = useState(true); const [campanhaMonitorada, setCampanhaMonitorada] = useState(null);
  useEffect(() => { if (view === 'lista') carregarCampanhas(); }, [view]);
  async function carregarCampanhas() { setLoadingLista(true); try { setCampanhas(await api.listarCampanhasIA()); } catch (err) { toast.error(err.message); } setLoadingLista(false); }

  if (view === 'nova') return <NovaCampanhaIA onBack={() => setView('lista')} onCriada={() => setView('lista')} />;
  if (view === 'monitorar') return <MonitorarIA id={campanhaMonitorada} onBack={() => setView('lista')} />;

  return (<div>
    <div className="page-header"><div><h1 className="page-title">Disparo Inteligente com IA</h1><p className="page-subtitle">Mensagens personalizadas geradas por IA</p></div>
      <button className="btn-primary" onClick={() => setView('nova')}><Bot size={16} style={{ marginRight: 6, display: 'inline' }} />Nova Campanha IA</button></div>
    <div className="card">{loadingLista ? <SkeletonTable rows={3} cols={6} /> : campanhas.length === 0 ? <div className="empty-state"><Bot size={40} /><p>Nenhuma campanha de IA criada.</p><button className="btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setView('nova')}>Criar primeira campanha</button></div> : (
      <table><thead><tr><th>Campanha</th><th>IA</th><th>Status</th><th>Enviados</th><th>Data</th><th></th></tr></thead><tbody>{campanhas.map(c => <tr key={c.id}><td style={{ fontWeight: 500 }}>{c.nome}</td><td>{c.ia_utilizada}</td><td><StatusBadge status={c.engine_status || c.status} /></td><td style={{ color: '#10b981' }}>{c.enviados}/{c.total_contatos}</td><td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(c.created_at).toLocaleDateString('pt-BR')}</td><td><button className="btn-secondary btn-sm" onClick={() => { setCampanhaMonitorada(c.id); setView('monitorar'); }}>Gerenciar</button></td></tr>)}</tbody></table>
    )}</div>
  </div>);
}

function NovaCampanhaIA({ onBack, onCriada }) {
  const [nome, setNome] = useState(''); const [provider, setProvider] = useState('openai'); const [promptBase, setPromptBase] = useState(''); const [tom, setTom] = useState('profissional');
  const [mineracoes, setMineracoes] = useState([]); const [mineracaoId, setMineracaoId] = useState(''); const [instancias, setInstancias] = useState([]); const [instancia, setInstancia] = useState('');
  const [delayMin, setDelayMin] = useState(10); const [delayMax, setDelayMax] = useState(25); const [saving, setSaving] = useState(false);
  useEffect(() => { api.listarMineracoes().then(setMineracoes).catch(() => {}); api.listarInstancias().then(setInstancias).catch(() => {}); }, []);

  async function handleCriar() {
    if (!nome.trim() || !promptBase.trim() || !instancia) return toast.error('Preencha todos os campos');
    setSaving(true); try { const r = await api.criarCampanhaIA({ nome, modo: 'primeiro_contato', ia_utilizada: provider, prompt_base: promptBase, tom, mineracao_id: mineracaoId || undefined, delay_min: delayMin, delay_max: delayMax, instancia }); toast.success(`Campanha criada com ${r.total_contatos} contatos!`); onCriada(); } catch (err) { toast.error(err.message); } setSaving(false);
  }

  return (<div><div className="page-header"><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><button className="btn-secondary btn-sm" onClick={onBack}>← Voltar</button><h1 className="page-title">Nova Campanha com IA</h1></div></div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div className="card"><h3 style={{ fontWeight: 600, marginBottom: 16 }}>Configuração</h3><div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-group"><label>Nome *</label><input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Prospecção IA" /></div>
        <div className="form-group"><label>Origem</label><select value={mineracaoId} onChange={e => setMineracaoId(e.target.value)}><option value="">Todos os leads</option>{mineracoes.filter(m => m.status === 'concluida').map(m => <option key={m.id} value={m.id}>{m.nicho} — {m.cidade}</option>)}</select></div>
        <div className="form-group"><label>IA</label><div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{PROVIDERS.map(p => <div key={p.id} onClick={() => setProvider(p.id)} style={{ padding: '10px 14px', borderRadius: 8, cursor: 'pointer', border: `2px solid ${provider === p.id ? p.cor : 'var(--border)'}`, background: provider === p.id ? `${p.cor}15` : 'var(--bg3)', display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontSize: 20 }}>{p.icon}</span><span style={{ fontSize: 13 }}>{p.label}</span></div>)}</div></div>
      </div></div>
      <div className="card"><h3 style={{ fontWeight: 600, marginBottom: 16 }}>Prompt e envio</h3><div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-group"><label>Objetivo *</label><textarea value={promptBase} onChange={e => setPromptBase(e.target.value)} rows={4} placeholder="Descreva o objetivo..." style={{ resize: 'vertical' }} /></div>
        <div className="form-group"><label>Tom</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{TONS.map(t => <button key={t} className={tom === t ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'} onClick={() => setTom(t)} style={{ textTransform: 'capitalize' }}>{t}</button>)}</div></div>
        <div className="form-group"><label>Instância WhatsApp</label><select value={instancia} onChange={e => setInstancia(e.target.value)}><option value="">— Selecione —</option>{instancias.map(i => { const n = i.instance?.instanceName || i.instanceName || String(i); return <option key={n} value={n}>{n}</option>; })}</select></div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}><button className="btn-secondary" onClick={onBack}>Cancelar</button><button className="btn-primary" onClick={handleCriar} disabled={saving}>{saving ? 'Criando...' : 'Criar Campanha IA'}</button></div>
      </div></div>
    </div>
  </div>);
}

function MonitorarIA({ id, onBack }) {
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => { carregarStatus(); const i = setInterval(carregarStatus, 3000); return () => clearInterval(i); }, [id]);
  async function carregarStatus() { try { setData(await api.statusCampanhaIA(id)); } catch {} setLoading(false); }
  async function controlar(acao) { try { await api.controlarCampanhaIA(id, acao); toast.success(`Campanha ${acao}!`); setTimeout(carregarStatus, 500); } catch (err) { toast.error(err.message); } }
  if (loading || !data) return <div style={{ textAlign: 'center', padding: 40 }}><span className="loading" /></div>;
  const { campanha, stats, logs } = data; const engineStatus = campanha.engine_status || campanha.status;
  return (<div><div className="page-header"><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><button className="btn-secondary btn-sm" onClick={onBack}>← Voltar</button><div><h1 className="page-title">{campanha.nome}</h1><StatusBadge status={engineStatus} /></div></div></div>
    <div className="stats-grid" style={{ marginBottom: 20 }}>{[{ l: 'Total', v: stats.total, c: 'var(--accent)' }, { l: 'Enviados', v: stats.enviados, c: '#10b981' }, { l: 'Falhas', v: stats.falhas, c: '#ef4444' }, { l: 'Pendentes', v: stats.pendentes, c: '#f59e0b' }].map(s => <div key={s.l} className="stat-card"><div className="stat-value" style={{ color: s.c }}>{s.v}</div><div className="stat-label">{s.l}</div></div>)}</div>
    <div className="card" style={{ marginBottom: 20 }}><Progress value={parseInt(stats.enviados)+parseInt(stats.falhas)} max={parseInt(stats.total)} />
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>{(engineStatus === 'rascunho' || engineStatus === 'pausada') && <button className="btn-primary" onClick={() => controlar(engineStatus === 'rascunho' ? 'iniciar' : 'retomar')}><Play size={14} /> {engineStatus === 'rascunho' ? 'Iniciar' : 'Retomar'}</button>}{(engineStatus === 'running' || engineStatus === 'em_andamento') && <button className="btn-secondary" onClick={() => controlar('pausar')}><Pause size={14} /> Pausar</button>}</div>
    </div>
    <div className="card"><h3 style={{ fontWeight: 600, marginBottom: 12 }}>Log de envios</h3><div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>{logs.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>Aguardando...</p> : logs.map((log, i) => <div key={i} style={{ padding: '8px 12px', borderRadius: 8, background: log.status === 'enviado' ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)', border: `1px solid ${log.status === 'enviado' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, fontSize: 12 }}><strong>{log.nome_contato || log.telefone}</strong>{log.mensagem_gerada && <p style={{ color: 'var(--text-muted)', marginLeft: 18 }}>"{log.mensagem_gerada}"</p>}{log.erro && <p style={{ color: '#ef4444' }}>{log.erro}</p>}</div>)}</div></div>
  </div>);
}

function StatusBadge({ status }) { const map = { rascunho: { label: 'Rascunho', cls: 'badge-blue' }, em_andamento: { label: 'Em andamento', cls: 'badge-yellow' }, running: { label: 'Em andamento', cls: 'badge-yellow' }, pausada: { label: 'Pausada', cls: 'badge-yellow' }, concluida: { label: 'Concluída', cls: 'badge-green' }, cancelada: { label: 'Cancelada', cls: 'badge-red' } }; const s = map[status] || { label: status, cls: 'badge-blue' }; return <span className={`badge ${s.cls}`}>{s.label}</span>; }
