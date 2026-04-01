import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ScoreBadge from '../components/ScoreBadge';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ score_min: '', tem_telefone: false, tem_email: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => { carregarLeads(); }, [page]);

  async function carregarLeads() {
    setLoading(true);
    try {
      const params = { page };
      if (filters.score_min) params.score_min = filters.score_min;
      if (filters.tem_telefone) params.tem_telefone = 'true';
      if (filters.tem_email) params.tem_email = 'true';
      const data = await api.listarLeads(params);
      setLeads(data.leads);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  }

  function aplicarFiltros() {
    setPage(1);
    carregarLeads();
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Todos os Leads</h1>
          <p className="page-subtitle">{total} leads no total</p>
        </div>
        <a
          href={`/api/export/leads?${new URLSearchParams(
            Object.fromEntries(
              Object.entries({
                score_min: filters.score_min,
                tem_telefone: filters.tem_telefone ? 'true' : '',
                tem_email: filters.tem_email ? 'true' : '',
              }).filter(([, v]) => v)
            )
          )}&token=${localStorage.getItem('token')}`}
          download
        >
          <button className="btn-secondary">📥 Exportar CSV</button>
        </a>
      </div>

      <div className="filters">
        <div className="form-group">
          <label>Score mínimo</label>
          <input
            type="number"
            placeholder="0-100"
            value={filters.score_min}
            onChange={(e) => setFilters({ ...filters, score_min: e.target.value })}
            style={{ width: 100 }}
          />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={filters.tem_telefone}
            onChange={(e) => setFilters({ ...filters, tem_telefone: e.target.checked })}
            style={{ width: 'auto' }}
          />
          Com telefone
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={filters.tem_email}
            onChange={(e) => setFilters({ ...filters, tem_email: e.target.checked })}
            style={{ width: 'auto' }}
          />
          Com email
        </label>
        <button className="btn-primary btn-sm" onClick={aplicarFiltros}>Filtrar</button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="loading" /></div>
        ) : leads.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p>Nenhum lead encontrado.</p>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Email</th>
                  <th>Cidade/Nicho</th>
                  <th>Avaliação</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td style={{ fontWeight: 500 }}>{lead.nome || '—'}</td>
                    <td>{lead.telefone || '—'}</td>
                    <td>{lead.email || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {lead.cidade && lead.nicho ? `${lead.nicho} • ${lead.cidade}` : '—'}
                    </td>
                    <td>{lead.avaliacao ? `⭐ ${lead.avaliacao}` : '—'}</td>
                    <td><ScoreBadge score={lead.score} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              <button className="btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                ← Anterior
              </button>
              <span>Página {page} — {total} total</span>
              <button className="btn-secondary btn-sm" onClick={() => setPage(p => p + 1)} disabled={leads.length < 50}>
                Próxima →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}