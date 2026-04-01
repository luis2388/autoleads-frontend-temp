import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { Send, Plus, Trash2, Upload, RefreshCw, Play, Pause, Square, Download, CheckCircle2, AlertCircle, Clock, Wifi, WifiOff, Smartphone, RotateCcw, GitBranch, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { Progress } from '../components/ui/Progress';
import { Modal } from '../components/ui/Modal';
import { SkeletonTable } from '../components/ui/Skeleton';

export default function DisparoManual() {
  const [view, setView] = useState('lista'); const [campanhas, setCampanhas] = useState([]); const [loadingLista, setLoadingLista] = useState(true); const [campanhaMonitorada, setCampanhaMonitorada] = useState(null);
  useEffect(() => { if (view === 'lista') carregarCampanhas(); }, [view]);
  async function carregarCampanhas() { setLoadingLista(true); try { setCampanhas(await api.listarCampanhasManuais()); } catch (err) { toast.error(err.message); } setLoadingLista(false); }
  if (view === 'nova') return <NovaCampanha onBack={() => setView('lista')} onCriada={() => setView('lista')} />;
  if (view === 'monitorar') return <MonitorarCampanha id={campanhaMonitorada} onBack={() => setView('lista')} />;
  return (<div>
    <div className="page-header"><div><h1 className="page-title">Disparo Manual em Massa</h1><p className="page-subtitle">Envie mensagens personalizadas via WhatsApp</p></div>
      <button className="btn-primary" onClick={() => setView('nova')}><Plus size={16} style={{ marginRight: 6, display: 'inline' }} />Nova Campanha</button></div>
    <div className="card">{loadingLista ? <SkeletonTable rows={4} cols={6} /> : campanhas.length === 0 ? (<div className="empty-state"><Send size={40} /><p>Nenhuma campanha criada.</p><button className="btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setView('nova')}>Criar primeira campanha</button></div>) : (
      <table><thead><tr><th>Campanha</th><th>Status</th><th>Total</th><th>Enviados</th><th>Falhas</th><th>Data</th><th></th></tr></thead>
        <tbody>{campanhas.map(c => <tr key={c.id}><td style={{ fontWeight: 500 }}>{c.nome}</td><td><StatusBadge status={c.engine_status || c.status} /></td><td>{c.total_contatos}</td><td style={{ color: '#10b981' }}>{c.enviados}</td><td style={{ color: '#ef4444' }}>{c.falhas}</td><td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(c.created_at).toLocaleDateString('pt-BR')}</td><td><button className="btn-secondary btn-sm" onClick={() => { setCampanhaMonitorada(c.id); setView('monitorar'); }}>Gerenciar</button></td></tr>)}</tbody></table>
    )}</div>
  </div>);
}

function NovaCampanha({ onBack, onCriada }) {
  const [nome, setNome] = useState(''); const [origem, setOrigem] = useState('excel'); const [mineracoes, setMineracoes] = useState([]); const [mineracaoId, setMineracaoId] = useState('');
  const [contatosExcel, setContatosExcel] = useState([]); const [variacoes, setVariacoes] = useState(['Olá {{nome}}, tudo bem?']);
  const [chips, setChips] = useState([]); const [chipsSelecionados, setChipsSelecionados] = useState([]); const [saving, setSaving] = useState(false);
  const [delayMin, setDelayMin] = useState(8); const [delayMax, setDelayMax] = useState(20);
  useEffect(() => { api.listarMineracoes().then(setMineracoes).catch(() => {}); api.listarChips().then(setChips).catch(() => {}); }, []);

  const onDropExcel = useCallback((files) => {
    const file = files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => { try { const wb = XLSX.read(e.target.result, { type: 'array' }); const ws = wb.Sheets[wb.SheetNames[0]]; const rows = XLSX.utils.sheet_to_json(ws, { defval: '' }); const validos = rows.filter(r => r.telefone || r.Telefone || r.TELEFONE); const norm = validos.map(r => ({ nome: r.nome || r.Nome || '', telefone: String(r.telefone || r.Telefone || r.TELEFONE || '').replace(/\D/g, ''), dados: r })); setContatosExcel(norm); toast.success(`${norm.length} contatos carregados`); } catch { toast.error('Erro ao ler arquivo'); } };
    reader.readAsArrayBuffer(file);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: onDropExcel, accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'] }, maxFiles: 1 });

  function toggleChip(id) { setChipsSelecionados(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]); }

  async function handleCriar() {
    if (chipsSelecionados.length === 0) return toast.error('Selecione ao menos um chip');
    if (!nome.trim()) return toast.error('Nome obrigatório');
    if (origem === 'excel' && contatosExcel.length === 0) return toast.error('Importe o arquivo Excel');
    setSaving(true);
    try {
      const r = await api.criarCampanhaManual({ nome, origem, mineracao_id: mineracaoId || undefined, contatos_excel: origem === 'excel' ? contatosExcel : undefined, variacoes: variacoes.filter(v => v.trim()), tipo_midia: 'texto', delay_min: delayMin, delay_max: delayMax, chips_selecionados: chipsSelecionados });
      toast.success(`Campanha criada com ${r.total_contatos} contatos!`); onCriada();
    } catch (err) { toast.error(err.message); } setSaving(false);
  }

  return (<div><div className="page-header"><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><button className="btn-secondary btn-sm" onClick={onBack}>← Voltar</button><h1 className="page-title">Nova Campanha Manual</h1></div></div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div className="card"><h3 style={{ fontWeight: 600, marginBottom: 20 }}>Contatos</h3><div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-group"><label>Nome *</label><input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Prospecção SP" /></div>
        <div className="form-group"><label>Origem</label><select value={origem} onChange={e => setOrigem(e.target.value)}><option value="excel">Importar Excel</option><option value="mineracao">Mineração</option><option value="cnpj">Lista CNPJ</option></select></div>
        {origem === 'excel' && <div {...getRootProps()} style={{ border: `2px dashed ${isDragActive ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 8, padding: 24, textAlign: 'center', cursor: 'pointer', background: isDragActive ? 'rgba(99,102,241,0.05)' : 'var(--bg3)' }}><input {...getInputProps()} /><Upload size={24} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} /><p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{contatosExcel.length > 0 ? `✓ ${contatosExcel.length} contatos` : 'Arraste ou clique'}</p></div>}
        {origem === 'mineracao' && <div className="form-group"><label>Mineração</label><select value={mineracaoId} onChange={e => setMineracaoId(e.target.value)}><option value="">Selecione</option>{mineracoes.filter(m => m.status === 'concluida').map(m => <option key={m.id} value={m.id}>{m.nicho} — {m.cidade}</option>)}</select></div>}
      </div></div>
      <div className="card"><h3 style={{ fontWeight: 600, marginBottom: 16 }}>Mensagem e Envio</h3><div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {variacoes.map((v, i) => <div key={i}><label style={{ fontSize: 11, color: 'var(--text-muted)' }}>VARIAÇÃO {i+1}</label><textarea value={v} onChange={e => setVariacoes(variacoes.map((t, j) => j === i ? e.target.value : t))} rows={3} style={{ resize: 'vertical', fontFamily: 'inherit' }} /></div>)}
        <h4 style={{ fontWeight: 600, marginTop: 8 }}>Chips WhatsApp</h4>
        {chips.filter(c => c.status === 'connected').map(chip => { const sel = chipsSelecionados.includes(chip.id); return (<label key={chip.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, cursor: 'pointer', border: `2px solid ${sel ? 'var(--accent)' : 'var(--border)'}`, background: sel ? 'rgba(99,102,241,0.06)' : 'var(--bg3)', marginBottom: 6 }}><input type="checkbox" checked={sel} onChange={() => toggleChip(chip.id)} style={{ accentColor: 'var(--accent)' }} /><Smartphone size={14} /><span style={{ fontSize: 13 }}>{chip.phone_number || chip.instance_name}</span></label>); })}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}><button className="btn-secondary" onClick={onBack}>Cancelar</button><button className="btn-primary" onClick={handleCriar} disabled={saving}>{saving ? 'Criando...' : 'Criar Campanha'}</button></div>
      </div></div>
    </div>
  </div>);
}

function MonitorarCampanha({ id, onBack }) {
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => { carregarStatus(); const i = setInterval(carregarStatus, 3000); return () => clearInterval(i); }, [id]);
  async function carregarStatus() { try { setData(await api.statusCampanhaManual(id)); } catch {} setLoading(false); }
  async function controlar(acao) { try { await api.controlarCampanhaManual(id, acao); toast.success(`Campanha ${acao}!`); setTimeout(carregarStatus, 500); } catch (err) { toast.error(err.message); } }
  if (loading || !data) return <div style={{ textAlign: 'center', padding: 40 }}><span className="loading" /></div>;
  const { campanha, stats, logs } = data; const engineStatus = campanha.engine_status || campanha.status;
  return (<div><div className="page-header"><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><button className="btn-secondary btn-sm" onClick={onBack}>← Voltar</button><div><h1 className="page-title">{campanha.nome}</h1><StatusBadge status={engineStatus} /></div></div><a href={api.exportarLogManual(id)} download><button className="btn-secondary btn-sm"><Download size={14} /> Exportar</button></a></div>
    <div className="stats-grid" style={{ marginBottom: 20 }}>{[{ l: 'Total', v: stats.total, c: 'var(--accent)' }, { l: 'Enviados', v: stats.enviados, c: '#10b981' }, { l: 'Falhas', v: stats.falhas, c: '#ef4444' }, { l: 'Pendentes', v: stats.pendentes, c: '#f59e0b' }].map(s => <div key={s.l} className="stat-card"><div className="stat-value" style={{ color: s.c }}>{s.v}</div><div className="stat-label">{s.l}</div></div>)}</div>
    <div className="card" style={{ marginBottom: 20 }}><Progress value={parseInt(stats.enviados)+parseInt(stats.falhas)} max={parseInt(stats.total)} />
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>{(engineStatus === 'rascunho' || engineStatus === 'pausada') && <button className="btn-primary" onClick={() => controlar(engineStatus === 'rascunho' ? 'iniciar' : 'retomar')}><Play size={14} /> {engineStatus === 'rascunho' ? 'Iniciar' : 'Retomar'}</button>}{(engineStatus === 'running' || engineStatus === 'em_andamento') && <button className="btn-secondary" onClick={() => controlar('pausar')}><Pause size={14} /> Pausar</button>}{engineStatus !== 'concluida' && engineStatus !== 'cancelada' && <button className="btn-danger" onClick={() => { if (confirm('Cancelar?')) controlar('cancelar'); }}><Square size={14} /> Cancelar</button>}</div>
    </div>
    <div className="card"><h3 style={{ fontWeight: 600, marginBottom: 12 }}>Log de envios</h3><div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>{logs.length === 0 ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>Nenhum envio registrado</p> : logs.map((log, i) => <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', borderRadius: 6, background: 'var(--bg3)', fontSize: 12 }}>{log.status === 'enviado' ? <CheckCircle2 size={14} color="#10b981" /> : <AlertCircle size={14} color="#ef4444" />}<div style={{ flex: 1 }}><span style={{ fontWeight: 600 }}>{log.nome_contato || log.telefone}</span>{log.erro && <span style={{ color: '#ef4444', marginLeft: 8 }}>— {log.erro}</span>}</div><span style={{ color: 'var(--text-muted)' }}>{log.enviado_em ? new Date(log.enviado_em).toLocaleTimeString('pt-BR') : ''}</span></div>)}</div></div>
  </div>);
}

function StatusBadge({ status }) { const map = { rascunho: { label: 'Rascunho', cls: 'badge-blue' }, em_andamento: { label: 'Em andamento', cls: 'badge-yellow' }, running: { label: 'Em andamento', cls: 'badge-yellow' }, pausada: { label: 'Pausada', cls: 'badge-yellow' }, paused: { label: 'Pausada', cls: 'badge-yellow' }, concluida: { label: 'Concluída', cls: 'badge-green' }, cancelada: { label: 'Cancelada', cls: 'badge-red' }, cancelled: { label: 'Cancelada', cls: 'badge-red' } }; const s = map[status] || { label: status, cls: 'badge-blue' }; return <span className={`badge ${s.cls}`}>{s.label}</span>; }
