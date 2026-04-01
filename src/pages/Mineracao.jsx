import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import ScoreBadge from '../components/ScoreBadge';

export default function Mineracao() {
  const navigate = useNavigate();
  const [mineracoes, setMineracoes] = useState([]);
  const [form, setForm] = useState({ cidade: '', nicho: '', raio: 5000 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { carregarMineracoes(); }, []);

  async function carregarMineracoes() {
    try { const data = await api.listarMineracoes(); setMineracoes(data); } catch {}
  }

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    try {
      const result = await api.criarMineracao(form);
      setSuccess(`Mineração #${result.id} iniciada! Os leads aparecerão quando concluir.`);
      setForm({ cidade: '', nicho: '', raio: 5000 });
      setTimeout(carregarMineracoes, 2000);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-header"><div><h1 className="page-title">Mineração Google Maps</h1><p className="page-subtitle">Extraia leads de negócios por cidade e nicho</p></div></div>
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Nova Mineração</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}
          <div className="form-row-3" style={{ marginBottom: 16 }}>
            <div className="form-group"><label>Nicho de negócio *</label><input placeholder="Ex: Restaurante, Clínica, Academia" value={form.nicho} onChange={(e) => setForm({ ...form, nicho: e.target.value })} required /></div>
            <div className="form-group"><label>Cidade *</label><input placeholder="Ex: São Paulo, SP" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} required /></div>
            <div className="form-group"><label>Raio de busca (metros)</label><select value={form.raio} onChange={(e) => setForm({ ...form, raio: parseInt(e.target.value) })}><option value={2000}>2 km</option><option value={5000}>5 km</option><option value={10000}>10 km</option><option value={20000}>20 km</option><option value={50000}>50 km</option></select></div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? <><span className="loading" style={{ marginRight: 8 }} /> Iniciando...</> : '🔍 Iniciar Mineração'}</button>
        </form>
      </div>
      <div className="card">
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Histórico de Minerações</h2>
        {mineracoes.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🔍</div><p>Nenhuma mineração encontrada.</p></div>
        ) : (
          <table><thead><tr><th>#</th><th>Nicho</th><th>Cidade</th><th>Raio</th><th>Status</th><th>Leads</th><th>Data</th><th></th></tr></thead>
            <tbody>{mineracoes.map((m) => (
              <tr key={m.id}>
                <td style={{ color: 'var(--text-muted)' }}>{m.id}</td>
                <td style={{ fontWeight: 500 }}>{m.nicho}</td><td>{m.cidade}</td>
                <td>{(m.raio / 1000).toFixed(0)} km</td>
                <td><StatusBadge status={m.status} /></td><td>{m.total_leads || 0}</td>
                <td style={{ color: 'var(--text-muted)' }}>{new Date(m.created_at).toLocaleDateString('pt-BR')}</td>
                <td>{m.status === 'concluida' && (<Link to={`/mineracao/${m.id}`}><button className="btn-secondary btn-sm">Ver leads</button></Link>)}</td>
              </tr>
            ))}</tbody></table>
        )}
      </div>
    </div>
  );
}

export function MineracaoDetalhe() {
  const { id } = useParams();
  const [mineracao, setMineracao] = useState(null);
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ score_min: '', tem_telefone: false, tem_email: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.buscarMineracao(id).then(setMineracao).catch(console.error); }, [id]);
  useEffect(() => { carregarLeads(); }, [id, page, filters]);

  async function carregarLeads() {
    setLoading(true);
    try {
      const params = { page };
      if (filters.score_min) params.score_min = filters.score_min;
      if (filters.tem_telefone) params.tem_telefone = 'true';
      if (filters.tem_email) params.tem_email = 'true';
      const data = await api.listarLeadsDaMineracao(id, params);
      setLeads(data.leads); setTotal(data.total);
    } catch {}
    setLoading(false);
  }

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">{mineracao ? `${mineracao.nicho} — ${mineracao.cidade}` : 'Carregando...'}</h1><p className="page-subtitle">{total} leads encontrados</p></div>
        <a href={`/api/export/leads?mineracao_id=${id}&token=${localStorage.getItem('token')}`} download><button className="btn-secondary">📥 Exportar CSV</button></a>
      </div>
      <div className="filters">
        <div className="form-group"><label>Score mínimo</label><input type="number" placeholder="0-100" value={filters.score_min} onChange={(e) => setFilters({ ...filters, score_min: e.target.value })} style={{ width: 100 }} /></div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" checked={filters.tem_telefone} onChange={(e) => setFilters({ ...filters, tem_telefone: e.target.checked })} style={{ width: 'auto' }} /> Com telefone</label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" checked={filters.tem_email} onChange={(e) => setFilters({ ...filters, tem_email: e.target.checked })} style={{ width: 'auto' }} /> Com email</label>
        <button className="btn-primary btn-sm" onClick={() => { setPage(1); carregarLeads(); }}>Filtrar</button>
      </div>
      <div className="card">
        {loading ? (<div style={{ textAlign: 'center', padding: 40 }}><span className="loading" /></div>) : leads.length === 0 ? (<div className="empty-state"><div className="empty-state-icon">👥</div><p>Nenhum lead encontrado.</p></div>) : (
          <><table><thead><tr><th>Nome</th><th>Telefone</th><th>Email</th><th>Endereço</th><th>Avaliação</th><th>Reviews</th><th>Score</th></tr></thead>
            <tbody>{leads.map((lead) => (<tr key={lead.id}><td style={{ fontWeight: 500 }}>{lead.nome || '—'}</td><td>{lead.telefone || '—'}</td><td>{lead.email || '—'}</td><td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.endereco || '—'}</td><td>{lead.avaliacao ? `⭐ ${lead.avaliacao}` : '—'}</td><td>{lead.reviews || 0}</td><td><ScoreBadge score={lead.score} /></td></tr>))}</tbody></table>
            <div className="pagination"><button className="btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Anterior</button><span>Página {page}</span><button className="btn-secondary btn-sm" onClick={() => setPage(p => p + 1)} disabled={leads.length < 50}>Próxima →</button></div>
          </>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { concluida: { label: 'Concluída', cls: 'badge-green' }, processando: { label: 'Processando', cls: 'badge-yellow' }, pendente: { label: 'Pendente', cls: 'badge-blue' }, erro: { label: 'Erro', cls: 'badge-red' } };
  const s = map[status] || { label: status, cls: 'badge-blue' };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}
