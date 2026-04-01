import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Building2, Search, TrendingUp, ArrowRight, Plus } from 'lucide-react';
import { api } from '../services/api';
import { isAdmin } from '../services/auth';
import { SkeletonTable } from '../components/ui/Skeleton';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [mineracoes, setMineracoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [min] = await Promise.all([api.listarMineracoes()]);
        setMineracoes(min.slice(0, 6));
        if (isAdmin()) { const s = await api.adminStats(); setStats(s); }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const chartData = [...mineracoes].reverse().slice(-7).map((m) => ({ name: m.nicho.slice(0, 12), leads: m.total_leads || 0 }));

  return (
    <div>
      <div className="page-header"><div><h1 className="page-title">Bem-vindo de volta 👋</h1><p className="page-subtitle">Visão geral do sistema AutoLeads</p></div>
        <Link to="/mineracao"><button className="btn-primary"><Plus size={15} /> Nova Mineração</button></Link></div>

      {isAdmin() && (<div className="stats-grid">
        {loading ? [1,2,3,4].map((i) => (<div key={i} className="stat-card"><div style={{ height: 34, background: 'var(--bg3)', borderRadius: 6, width: 60, marginBottom: 8 }} /><div style={{ height: 12, background: 'var(--bg3)', borderRadius: 4, width: 80 }} /></div>)) : stats ? (
          <><StatCard icon={<Users size={20} />} label="Usuários" value={stats.total_usuarios} color="var(--accent)" /><StatCard icon={<Search size={20} />} label="Leads (Maps)" value={stats.total_leads} color="#10b981" /><StatCard icon={<Building2 size={20} />} label="Leads CNPJ" value={stats.total_cnpj_leads} color="#f59e0b" /><StatCard icon={<TrendingUp size={20} />} label="Minerações" value={stats.total_mineracoes} color="#a855f7" /></>
        ) : null}
      </div>)}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card"><div className="card-header"><div><div className="card-title">Leads por Mineração</div><div className="card-subtitle">Últimas 7 minerações</div></div></div>
          {chartData.length > 0 ? (<ResponsiveContainer width="100%" height={180}><AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}><defs><linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} /><stop offset="95%" stopColor="var(--accent)" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, color: 'var(--text)' }} labelStyle={{ fontWeight: 700 }} /><Area type="monotone" dataKey="leads" stroke="var(--accent)" strokeWidth={2} fill="url(#colorLeads)" dot={{ fill: 'var(--accent)', r: 3 }} /></AreaChart></ResponsiveContainer>) : (<div className="empty-state" style={{ padding: '40px 0' }}><p>Sem dados para o gráfico ainda.</p></div>)}
        </div>

        <div className="card"><div className="card-header"><div className="card-title">Ações Rápidas</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[{ to: '/mineracao', icon: <Search size={18} />, label: 'Minerar leads do Google Maps', desc: 'Apify API', color: 'var(--accent)' }, { to: '/cnpj', icon: <Building2 size={18} />, label: 'Consultar por CNPJ', desc: 'Brasil API', color: '#10b981' }, { to: '/disparo-manual', icon: <Users size={18} />, label: 'Criar disparo manual', desc: 'WhatsApp', color: '#f59e0b' }, { to: '/disparo-ia', icon: <TrendingUp size={18} />, label: 'Disparo inteligente com IA', desc: 'GPT / Claude / Gemini', color: '#a855f7' }].map(({ to, icon, label, desc, color }) => (
              <Link key={to} to={to} style={{ textDecoration: 'none' }}><div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg3)', cursor: 'pointer', transition: 'all 0.15s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = 'var(--bg4)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}><div style={{ width: 36, height: 36, borderRadius: 9, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>{icon}</div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div><div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{desc}</div></div><ArrowRight size={14} color="var(--text-soft)" /></div></Link>
            ))}
          </div>
        </div>
      </div>

      <div className="card"><div className="card-header"><div><div className="card-title">Minerações Recentes</div><div className="card-subtitle">Últimas captações realizadas</div></div><Link to="/mineracao"><button className="btn-secondary btn-sm">Ver todas</button></Link></div>
        {loading ? <SkeletonTable rows={4} cols={5} /> : mineracoes.length === 0 ? (<div className="empty-state"><div className="empty-state-icon"><Search size={40} /></div><p>Nenhuma mineração ainda.</p><Link to="/mineracao"><button className="btn-primary btn-sm" style={{ marginTop: 14 }}>Iniciar primeira mineração</button></Link></div>) : (
          <div className="table-wrapper"><table><thead><tr><th>Nicho</th><th>Cidade</th><th>Status</th><th>Leads</th><th>Data</th><th></th></tr></thead>
            <tbody>{mineracoes.map((m) => (<tr key={m.id}><td style={{ fontWeight: 600 }}>{m.nicho}</td><td style={{ color: 'var(--text-muted)' }}>{m.cidade}</td><td><StatusBadge status={m.status} /></td><td><span style={{ fontWeight: 700, color: 'var(--accent)' }}>{m.total_leads || 0}</span></td><td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(m.created_at).toLocaleDateString('pt-BR')}</td><td>{m.status === 'concluida' && <Link to={`/mineracao/${m.id}`}><button className="btn-secondary btn-sm">Ver leads</button></Link>}</td></tr>))}</tbody></table></div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (<div className="stat-card" style={{ '--accent': color }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}><div><div className="stat-value">{value?.toLocaleString('pt-BR')}</div><div className="stat-label">{label}</div></div><div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div></div></div>);
}

function StatusBadge({ status }) {
  const map = { concluida: { label: 'Concluída', cls: 'badge-green' }, processando: { label: 'Processando', cls: 'badge-yellow' }, pendente: { label: 'Pendente', cls: 'badge-blue' }, erro: { label: 'Erro', cls: 'badge-red' } };
  const s = map[status] || { label: status, cls: 'badge-gray' };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}
