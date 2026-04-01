import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GitBranch, Plus, Edit2, Copy, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { SkeletonTable } from '../components/ui/Skeleton';

export default function Fluxos() {
  const [fluxos, setFluxos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [criando, setCriando] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { carregar(); }, []);
  async function carregar() { setLoading(true); try { setFluxos(await api.listarFluxos()); } catch (err) { toast.error(err.message); } setLoading(false); }
  async function criar() { if (!novoNome.trim()) return toast.error('Informe um nome'); setCriando(true); try { const f = await api.criarFluxo({ nome: novoNome.trim() }); toast.success('Fluxo criado!'); navigate(`/fluxos/${f.id}`); } catch (err) { toast.error(err.message); } setCriando(false); }
  async function duplicar(id) { try { await api.duplicarFluxo(id); toast.success('Fluxo duplicado'); carregar(); } catch (err) { toast.error(err.message); } }
  async function excluir(id, nome) { if (!confirm(`Excluir o fluxo "${nome}"?`)) return; try { await api.deletarFluxo(id); toast.success('Fluxo excluído'); carregar(); } catch (err) { toast.error(err.message); } }

  return (
    <div>
      <div className="page-header"><div><h1 className="page-title">Fluxos de Mensagem</h1><p className="page-subtitle">Construtor visual de sequências de envio</p></div>
        <button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={16} style={{ marginRight: 6, display: 'inline' }} />Criar Fluxo</button></div>

      {showForm && (<div className="card" style={{ marginBottom: 20, border: '2px solid var(--accent)' }}><h3 style={{ fontWeight: 600, marginBottom: 14 }}>Novo Fluxo</h3><div style={{ display: 'flex', gap: 10 }}><input style={{ flex: 1 }} placeholder="Nome do fluxo" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && criar()} autoFocus /><button className="btn-primary" onClick={criar} disabled={criando}>{criando ? <span className="loading" /> : 'Criar e Editar'}</button><button className="btn-secondary" onClick={() => { setShowForm(false); setNovoNome(''); }}>Cancelar</button></div></div>)}

      <div className="card">
        {loading ? <SkeletonTable rows={4} cols={5} /> : fluxos.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon"><GitBranch size={40} /></div><p>Nenhum fluxo criado ainda.</p><p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Crie sequências visuais de mensagens com delays, condições e muito mais.</p><button className="btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}><Plus size={14} style={{ marginRight: 5, display: 'inline' }} />Criar primeiro fluxo</button></div>
        ) : (
          <table><thead><tr><th>Nome</th><th>Nós</th><th>Campanhas ativas</th><th>Última edição</th><th></th></tr></thead>
            <tbody>{fluxos.map((f) => (<tr key={f.id}>
              <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><GitBranch size={15} color="var(--accent)" /></div><span style={{ fontWeight: 500 }}>{f.nome}</span></div></td>
              <td style={{ color: 'var(--text-muted)' }}>{f.total_nos || 0} nós</td>
              <td>{parseInt(f.campanhas_ativas) > 0 ? <span style={{ color: '#10b981', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={13} /> {f.campanhas_ativas} ativo(s)</span> : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>}</td>
              <td style={{ color: 'var(--text-muted)', fontSize: 12 }}><Clock size={12} style={{ display: 'inline', marginRight: 4 }} />{new Date(f.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
              <td><div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}><button className="btn-primary btn-sm" onClick={() => navigate(`/fluxos/${f.id}`)}><Edit2 size={13} style={{ marginRight: 4, display: 'inline' }} />Editar</button><button className="btn-secondary btn-sm" onClick={() => duplicar(f.id)} title="Duplicar"><Copy size={13} /></button><button className="btn-secondary btn-sm" onClick={() => excluir(f.id, f.nome)} disabled={parseInt(f.campanhas_ativas) > 0} title={parseInt(f.campanhas_ativas) > 0 ? 'Em uso' : 'Excluir'} style={parseInt(f.campanhas_ativas) > 0 ? { opacity: 0.4 } : { color: '#ef4444' }}><Trash2 size={13} /></button></div></td>
            </tr>))}</tbody></table>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 20 }}>
        {[{ icon: '💬', titulo: 'Mensagens', desc: 'Texto, imagem, vídeo, áudio e arquivos com variáveis dinâmicas' }, { icon: '⏱️', titulo: 'Delays', desc: 'Pausas configuráveis em segundos, minutos, horas ou dias' }, { icon: '🔀', titulo: 'Condições', desc: 'Ramificações baseadas em respostas, variáveis e webhooks' }].map(({ icon, titulo, desc }) => (
          <div key={titulo} className="card" style={{ padding: 20 }}><div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div><div style={{ fontWeight: 600, marginBottom: 6 }}>{titulo}</div><div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div></div>
        ))}
      </div>
    </div>
  );
}
