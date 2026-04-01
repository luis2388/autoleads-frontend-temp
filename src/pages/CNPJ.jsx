import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ScoreBadge from '../components/ScoreBadge';

export default function CNPJ() {
  const [tab, setTab] = useState('consultar');
  const [cnpj, setCnpj] = useState('');
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadMsg, setUploadMsg] = useState('');
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ score_min: '', situacao: '', tem_telefone: false, tem_email: false });

  useEffect(() => { if (tab === 'historico') carregarLeads(); }, [tab, page]);

  async function handleConsultar(e) {
    e.preventDefault(); setError(''); setResultado(null); setLoading(true);
    try { const data = await api.consultarCnpj(cnpj); setResultado(data); } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  async function handleUpload(e) {
    e.preventDefault(); if (!file) return; setLoading(true); setUploadMsg('');
    try { const data = await api.uploadCnpjLista(file); setUploadMsg(data.message); setFile(null); } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  async function carregarLeads() {
    setLoading(true);
    try {
      const params = { page };
      if (filters.score_min) params.score_min = filters.score_min;
      if (filters.situacao) params.situacao = filters.situacao;
      if (filters.tem_telefone) params.tem_telefone = 'true';
      if (filters.tem_email) params.tem_email = 'true';
      const data = await api.listarCnpjLeads(params); setLeads(data.leads); setTotal(data.total);
    } catch {} setLoading(false);
  }

  function formatCNPJ(v) {
    return v.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2').slice(0, 18);
  }

  return (
    <div>
      <div className="page-header"><div><h1 className="page-title">Extração por CNPJ</h1><p className="page-subtitle">Consulte dados de empresas via CNPJ</p></div></div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[{ key: 'consultar', label: '🔍 Consultar CNPJ' }, { key: 'lista', label: '📂 Upload de Lista' }, { key: 'historico', label: '📋 Histórico' }].map((t) => (
          <button key={t.key} className={tab === t.key ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {tab === 'consultar' && (
        <div className="card">
          <form onSubmit={handleConsultar}>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 1 }}><label>CNPJ</label><input placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(formatCNPJ(e.target.value))} maxLength={18} required /></div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ flexShrink: 0 }}>{loading ? <span className="loading" /> : 'Consultar'}</button>
            </div>
          </form>
          {resultado && (
            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}><h3 style={{ fontSize: 16, fontWeight: 600 }}>{resultado.razao_social}</h3><ScoreBadge score={resultado.score} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[['CNPJ', resultado.cnpj], ['Nome Fantasia', resultado.fantasia], ['Situação', resultado.situacao], ['CNAE', resultado.cnae], ['Telefone', resultado.telefone], ['Email', resultado.email], ['Endereço', resultado.endereco]].map(([label, value]) => value ? (<div key={label}><div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div><div style={{ fontSize: 14, marginTop: 2 }}>{value}</div></div>) : null)}
              </div>
              {resultado.socios?.length > 0 && (<div style={{ marginTop: 16 }}><div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>SÓCIOS</div>{resultado.socios.map((s, i) => (<div key={i} style={{ fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>{s.nome} — {s.qualificacao}</div>))}</div>)}
            </div>
          )}
        </div>
      )}

      {tab === 'lista' && (
        <div className="card">
          <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Upload de lista de CNPJs</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 13 }}>Envie um arquivo .txt ou .csv com um CNPJ por linha.</p>
          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
          {uploadMsg && <div className="alert alert-success" style={{ marginBottom: 16 }}>{uploadMsg}</div>}
          <form onSubmit={handleUpload} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}><label>Arquivo (.csv ou .txt)</label><input type="file" accept=".csv,.txt" onChange={(e) => setFile(e.target.files[0])} style={{ padding: '8px' }} /></div>
            <button type="submit" className="btn-primary" disabled={loading || !file} style={{ flexShrink: 0 }}>{loading ? <span className="loading" /> : '📤 Enviar'}</button>
          </form>
        </div>
      )}

      {tab === 'historico' && (
        <div>
          <div className="filters">
            <div className="form-group"><label>Score mínimo</label><input type="number" placeholder="0-100" value={filters.score_min} onChange={(e) => setFilters({ ...filters, score_min: e.target.value })} style={{ width: 100 }} /></div>
            <div className="form-group"><label>Situação</label><select value={filters.situacao} onChange={(e) => setFilters({ ...filters, situacao: e.target.value })} style={{ width: 130 }}><option value="">Todas</option><option value="ATIVA">Ativa</option><option value="BAIXADA">Baixada</option><option value="SUSPENSA">Suspensa</option></select></div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" checked={filters.tem_telefone} onChange={(e) => setFilters({ ...filters, tem_telefone: e.target.checked })} style={{ width: 'auto' }} /> Com telefone</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" checked={filters.tem_email} onChange={(e) => setFilters({ ...filters, tem_email: e.target.checked })} style={{ width: 'auto' }} /> Com email</label>
            <button className="btn-primary btn-sm" onClick={() => { setPage(1); carregarLeads(); }}>Filtrar</button>
            <a href={`/api/export/cnpj-leads?token=${localStorage.getItem('token')}`} download><button className="btn-secondary btn-sm">📥 Exportar CSV</button></a>
          </div>
          <div className="card">
            {loading ? (<div style={{ textAlign: 'center', padding: 40 }}><span className="loading" /></div>) : leads.length === 0 ? (<div className="empty-state"><div className="empty-state-icon">🏢</div><p>Nenhum registro encontrado.</p></div>) : (
              <><table><thead><tr><th>CNPJ</th><th>Razão Social</th><th>Situação</th><th>CNAE</th><th>Telefone</th><th>Email</th><th>Score</th></tr></thead>
                <tbody>{leads.map((l) => (<tr key={l.id}><td style={{ fontFamily: 'monospace', fontSize: 12 }}>{l.cnpj}</td><td style={{ fontWeight: 500 }}>{l.razao_social || '—'}</td><td><span className={`badge ${l.situacao?.toUpperCase() === 'ATIVA' ? 'badge-green' : 'badge-red'}`}>{l.situacao || '—'}</span></td><td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{l.cnae || '—'}</td><td>{l.telefone || '—'}</td><td>{l.email || '—'}</td><td><ScoreBadge score={l.score} /></td></tr>))}</tbody></table>
                <div className="pagination"><button className="btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Anterior</button><span>Página {page} — {total} total</span><button className="btn-secondary btn-sm" onClick={() => setPage(p => p + 1)} disabled={leads.length < 50}>Próxima →</button></div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
