import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Smartphone, Plus, RefreshCw, LogOut, Trash2, Wifi, WifiOff, Clock, X } from 'lucide-react';
import { api } from '../services/api';

function StatusDot({ status }) {
  const cfg = { connected: { color: '#10b981', label: 'Conectado', Icon: Wifi }, disconnected: { color: '#ef4444', label: 'Desconectado', Icon: WifiOff }, connecting: { color: '#f59e0b', label: 'Conectando...', Icon: Clock }, qr_pending: { color: '#f59e0b', label: 'Aguardando QR', Icon: Clock } };
  const { color, label, Icon } = cfg[status] || cfg.disconnected;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} /><Icon size={13} color={color} /><span style={{ color }}>{label}</span></span>;
}

function QrModal({ chip, onClose, onConectado }) {
  const [qrBase64, setQrBase64] = useState(null); const [loading, setLoading] = useState(true); const [erro, setErro] = useState('');
  const intervalRef = useRef(null); const tentativas = useRef(0);
  async function pollQrEStatus() {
    try { const data = await api.qrcodeChip(chip.id); const qr = data?.qrcode || data?.base64 || data?.qr || null;
      if (data?.status === 'connected') { clearInterval(intervalRef.current); toast.success('WhatsApp conectado!'); onConectado(); return; }
      if (qr) { setQrBase64(qr); setErro(''); } setLoading(false);
    } catch (err) { setErro(err.message); setLoading(false); }
    tentativas.current++; if (tentativas.current > 80) { clearInterval(intervalRef.current); setErro('Tempo esgotado.'); }
  }
  useEffect(() => { pollQrEStatus(); intervalRef.current = setInterval(pollQrEStatus, 3000); return () => clearInterval(intervalRef.current); }, []);
  return (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, width: 380, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}><h3 style={{ fontWeight: 700, fontSize: 16 }}>Escanear QR Code</h3><button onClick={onClose} className="btn-ghost btn-icon"><X size={18} /></button></div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>Abra o WhatsApp no celular → <strong>Dispositivos Conectados</strong> → <strong>Conectar dispositivo</strong></p>
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 260, marginBottom: 16 }}>
        {loading ? <span className="loading" style={{ width: 32, height: 32 }} /> : erro ? <div style={{ textAlign: 'center' }}><p style={{ fontSize: 13, color: '#ef4444', marginBottom: 12 }}>{erro}</p></div> : qrBase64 ? <img src={qrBase64.startsWith('data:') ? qrBase64 : `data:image/png;base64,${qrBase64}`} alt="QR Code" style={{ width: 230, height: 230 }} /> : <p style={{ fontSize: 13, color: '#6b7280' }}>QR Code não disponível</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: 'rgba(245,158,11,0.1)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.3)' }}><span style={{ fontSize: 12, color: '#f59e0b' }}>Aguardando conexão...</span></div>
    </div>
  </div>);
}

export default function MeusWhatsApp() {
  const [chips, setChips] = useState([]); const [loading, setLoading] = useState(true); const [criando, setCriando] = useState(false);
  const [qrChip, setQrChip] = useState(null); const [modalNome, setModalNome] = useState(false); const [nomeInstancia, setNomeInstancia] = useState('');

  async function carregar() { setLoading(true); try { setChips(await api.listarChips()); } catch (err) { toast.error(err.message); } setLoading(false); }
  useEffect(() => { carregar(); }, []);

  async function adicionarChip() { if (!nomeInstancia.trim()) return toast.error('Informe um nome'); setModalNome(false); setCriando(true); try { const chip = await api.criarChip(nomeInstancia.trim()); toast.success('Instância criada!'); setNomeInstancia(''); await carregar(); setQrChip(chip); } catch (err) { toast.error(err.message); } setCriando(false); }
  async function desconectar(chip) { if (!confirm(`Desconectar "${chip.instance_name}"?`)) return; try { await api.desconectarChip(chip.id); toast.success('Desconectado'); carregar(); } catch (err) { toast.error(err.message); } }
  async function remover(chip) { if (!confirm(`Remover "${chip.instance_name}" permanentemente?`)) return; try { await api.deletarChip(chip.id); toast.success('Removido'); carregar(); } catch (err) { toast.error(err.message); } }

  return (<div>
    <div className="page-header"><div><h1 className="page-title">Meus WhatsApp</h1><p className="page-subtitle">Gerencie seus chips e conexões</p></div>
      <button className="btn-primary" onClick={() => setModalNome(true)} disabled={criando}>{criando ? 'Criando...' : <><Plus size={16} style={{ marginRight: 6, display: 'inline' }} />Adicionar WhatsApp</>}</button></div>
    <div className="card">{loading ? <div style={{ textAlign: 'center', padding: 40 }}><span className="loading" /></div> : chips.length === 0 ? (<div className="empty-state"><Smartphone size={40} /><p>Nenhum WhatsApp conectado.</p><button className="btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => setModalNome(true)}>Adicionar primeiro chip</button></div>) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{chips.map(chip => { const connected = chip.status === 'connected'; return (<div key={chip.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: 10, border: `1px solid ${connected ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`, background: connected ? 'rgba(16,185,129,0.04)' : 'var(--bg3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><div style={{ width: 44, height: 44, borderRadius: 12, background: connected ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Smartphone size={20} color={connected ? '#10b981' : 'var(--accent)'} /></div>
          <div><div style={{ fontWeight: 600, fontSize: 14 }}>{chip.phone_number ? `+${chip.phone_number.replace(/\D/g, '')}` : chip.instance_name}</div><div style={{ marginTop: 4 }}><StatusDot status={chip.status} /></div></div></div>
        <div style={{ display: 'flex', gap: 8 }}><button className="btn-secondary btn-sm" onClick={() => carregar()} style={{ padding: '6px 8px' }}><RefreshCw size={13} /></button>
          {!connected && <button className="btn-primary btn-sm" onClick={() => setQrChip(chip)}>Reconectar</button>}
          {connected && <button className="btn-secondary btn-sm" onClick={() => desconectar(chip)}><LogOut size={13} /> Desconectar</button>}
          <button onClick={() => remover(chip)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px 8px' }}><Trash2 size={14} /></button></div>
      </div>); })}</div>
    )}</div>

    {modalNome && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}><div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, width: 380, maxWidth: '90vw' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}><h3 style={{ fontWeight: 700, fontSize: 16 }}>Novo WhatsApp</h3><button onClick={() => { setModalNome(false); setNomeInstancia(''); }} className="btn-ghost btn-icon"><X size={18} /></button></div>
      <input placeholder="Nome da instância" value={nomeInstancia} onChange={e => setNomeInstancia(e.target.value)} onKeyDown={e => e.key === 'Enter' && adicionarChip()} autoFocus style={{ marginBottom: 16, width: '100%' }} />
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}><button className="btn-secondary" onClick={() => { setModalNome(false); setNomeInstancia(''); }}>Cancelar</button><button className="btn-primary" onClick={adicionarChip} disabled={!nomeInstancia.trim()}>Criar e conectar</button></div>
    </div></div>}
    {qrChip && <QrModal chip={qrChip} onClose={() => setQrChip(null)} onConectado={() => { setQrChip(null); carregar(); }} />}
  </div>);
}
