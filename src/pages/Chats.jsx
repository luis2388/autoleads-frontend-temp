import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { Search, MessageSquare, SkipForward, PauseCircle, PlayCircle, Send, User, Clock, CheckCheck, AlertCircle, Bot, Zap } from 'lucide-react';

function fmtTime(ts) { if (!ts) return ''; const d = new Date(ts); const now = new Date(); return d.toDateString() === now.toDateString() ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); }
function fmtFull(ts) { return ts ? new Date(ts).toLocaleString('pt-BR') : ''; }
function initials(nome) { if (!nome) return '?'; const p = nome.trim().split(' '); return (p[0]?.[0]||'') + (p[1]?.[0]||''); }

export default function Chats() {
  const [leads, setLeads] = useState([]); const [filtro, setFiltro] = useState('todos'); const [busca, setBusca] = useState('');
  const [leadSel, setLeadSel] = useState(null); const [mensagens, setMensagens] = useState([]); const [chips, setChips] = useState([]);
  const [chipSel, setChipSel] = useState(''); const [texto, setTexto] = useState(''); const [enviando, setEnviando] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false); const [mobileView, setMobileView] = useState('lista');
  const msgEndRef = useRef(null); const pollingRef = useRef(null);

  const carregarChats = useCallback(async () => { try { setLeads(await api.listarChats() || []); } catch {} }, []);
  useEffect(() => { api.listarChips().then(d => { const c = (d||[]).filter(c => c.status === 'connected'); setChips(c); if (c.length) setChipSel(c[0].instance_name); }).catch(() => {}); }, []);
  useEffect(() => { carregarChats(); pollingRef.current = setInterval(carregarChats, 10000); return () => clearInterval(pollingRef.current); }, [carregarChats]);

  const carregarMensagens = useCallback(async (leadId) => { setLoadingMsgs(true); try { setMensagens(await api.mensagensLead(leadId) || []); } catch { toast.error('Erro ao carregar mensagens'); } finally { setLoadingMsgs(false); } }, []);

  async function selecionarLead(lead) { setLeadSel(lead); setMobileView('chat'); await carregarMensagens(lead.id); if (lead.respondeu_nao_lido) { await api.marcarLido(lead.id).catch(() => {}); setLeads(p => p.map(l => l.id === lead.id ? { ...l, respondeu_nao_lido: false } : l)); } }
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensagens]);

  async function enviar(e) { e.preventDefault(); if (!texto.trim() || !leadSel || enviando) return; setEnviando(true); try { await api.enviarManual(leadSel.id, texto.trim(), chipSel || undefined); setTexto(''); await carregarMensagens(leadSel.id); } catch (err) { toast.error(err.message); } finally { setEnviando(false); } }
  async function pularEtapa() { if (!leadSel) return; try { await api.pularEtapa(leadSel.id); toast.success('Etapa pulada'); await carregarMensagens(leadSel.id); await carregarChats(); } catch (err) { toast.error(err.message); } }
  async function togglePausar() { if (!leadSel) return; try { const r = await api.pausarLead(leadSel.id); toast.success(r.status === 'pausado' ? 'Lead pausado' : 'Lead retomado'); setLeadSel(p => ({ ...p, status: r.status })); setLeads(p => p.map(l => l.id === leadSel.id ? { ...l, status: r.status } : l)); await carregarMensagens(leadSel.id); } catch (err) { toast.error(err.message); } }

  const leadsFiltrados = leads.filter(lead => { if (filtro === 'responderam') return lead.respondeu_nao_lido || lead.ultima_mensagem_em; if (filtro === 'ativo') return lead.status === 'ativo'; if (filtro === 'sem_resposta') return !lead.ultima_mensagem_em; return true; }).filter(lead => { if (!busca) return true; const q = busca.toLowerCase(); return (lead.nome_contato || '').toLowerCase().includes(q) || (lead.telefone || '').includes(q); });

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - var(--header-h, 58px) - 56px)', minHeight: 0, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg2)' }}>
      <div style={{ width: 280, minWidth: 280, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', ...(mobileView === 'chat' ? { display: 'none' } : {}) }} className="chats-list-panel">
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Chats</div>
          <div style={{ position: 'relative', marginBottom: 10 }}><Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }} /><input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar lead..." style={{ width: '100%', padding: '7px 10px 7px 32px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, boxSizing: 'border-box' }} /></div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{[{ key: 'todos', label: 'Todos' }, { key: 'responderam', label: 'Responderam' }, { key: 'ativo', label: 'Em andamento' }, { key: 'sem_resposta', label: 'Sem resposta' }].map(f => (<button key={f.key} onClick={() => setFiltro(f.key)} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: '1px solid', borderColor: filtro === f.key ? 'var(--accent)' : 'var(--border)', background: filtro === f.key ? 'var(--accent-soft)' : 'transparent', color: filtro === f.key ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer' }}>{f.label}</button>))}</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {leadsFiltrados.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-soft)', fontSize: 13 }}><MessageSquare size={32} style={{ marginBottom: 8, opacity: 0.3 }} /><div>Nenhum lead encontrado</div></div>}
          {leadsFiltrados.map(lead => (<div key={lead.id} onClick={() => selecionarLead(lead)} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border-soft)', background: leadSel?.id === lead.id ? 'var(--accent-soft)' : 'transparent', transition: 'background 0.1s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0 }}>{initials(lead.nome_contato)}</div>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 13, fontWeight: lead.respondeu_nao_lido ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>{lead.nome_contato || lead.telefone}</span><span style={{ fontSize: 11, color: 'var(--text-soft)', flexShrink: 0 }}>{fmtTime(lead.ultima_mensagem_em)}</span></div><div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.ultima_mensagem_preview || 'Sem mensagens ainda'}</div></div>
            </div>
          </div>))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }} className="chats-chat-panel">
        {!leadSel ? (<div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-soft)' }}><MessageSquare size={56} style={{ opacity: 0.15, marginBottom: 16 }} /><div style={{ fontSize: 16, fontWeight: 600 }}>Selecione um lead</div></div>) : (
          <>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <button className="btn-ghost btn-icon chats-back-btn" onClick={() => setMobileView('lista')} style={{ display: 'none' }}>←</button>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0 }}>{initials(leadSel.nome_contato)}</div>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{leadSel.nome_contato || leadSel.telefone}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{leadSel.telefone}</div></div>
              <div style={{ display: 'flex', gap: 6 }}><button onClick={pularEtapa} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}><SkipForward size={13} /> <span className="hide-xs">Pular</span></button><button onClick={togglePausar} className={leadSel.status === 'pausado' ? 'btn-primary' : 'btn-secondary'} style={{ fontSize: 12, padding: '6px 12px' }}>{leadSel.status === 'pausado' ? <><PlayCircle size={13} /> <span className="hide-xs">Retomar</span></> : <><PauseCircle size={13} /> <span className="hide-xs">Pausar</span></>}</button></div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {loadingMsgs && <div style={{ textAlign: 'center', color: 'var(--text-soft)', fontSize: 13, padding: 20 }}>Carregando...</div>}
              {!loadingMsgs && mensagens.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-soft)', fontSize: 13, padding: 40 }}>Nenhuma mensagem ainda</div>}
              {mensagens.map((msg, i) => {
                if (msg.origem === 'sistema') return <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0', opacity: 0.7 }}><div style={{ flex: 1, height: 1, borderTop: '1px dashed var(--border)' }} /><span style={{ fontSize: 11, color: 'var(--text-soft)', whiteSpace: 'nowrap' }}>{msg.conteudo} · {fmtFull(msg.ocorreu_em)}</span><div style={{ flex: 1, height: 1, borderTop: '1px dashed var(--border)' }} /></div>;
                const isLead = msg.origem === 'lead';
                const color = isLead ? 'var(--bg3)' : msg.origem === 'auto' ? 'rgba(34,197,94,0.12)' : msg.origem === 'usuario' ? 'rgba(139,92,246,0.12)' : 'rgba(6,182,212,0.12)';
                return <div key={i} style={{ display: 'flex', justifyContent: isLead ? 'flex-start' : 'flex-end', marginBottom: 2 }}><div style={{ maxWidth: '70%', padding: '9px 14px', borderRadius: isLead ? '4px 14px 14px 14px' : '14px 4px 14px 14px', background: color, color: 'var(--text)', fontSize: 13, border: '1px solid var(--border)' }}><div>{msg.conteudo || '[Mídia]'}</div><div style={{ fontSize: 10, color: 'var(--text-soft)', marginTop: 4, textAlign: 'right' }}>{fmtFull(msg.ocorreu_em)}</div></div></div>;
              })}
              <div ref={msgEndRef} />
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg2)', flexShrink: 0 }}>
              <form onSubmit={enviar} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <textarea value={texto} onChange={e => setTexto(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(e); } }} placeholder="Digite uma mensagem..." rows={2} style={{ flex: 1, padding: '10px 14px', borderRadius: 10, resize: 'none', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, fontFamily: 'inherit', lineHeight: 1.5 }} />
                <button type="submit" disabled={enviando || !texto.trim()} className="btn-primary" style={{ padding: '10px 18px', borderRadius: 10, flexShrink: 0 }}><Send size={15} /><span style={{ marginLeft: 6 }}>{enviando ? '...' : 'Enviar'}</span></button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
