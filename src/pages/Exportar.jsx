import React, { useState } from 'react';

export default function Exportar() {
  const [leadsParams, setLeadsParams] = useState({ score_min: '', tem_telefone: false, tem_email: false, formato: 'csv' });
  const [cnpjParams, setCnpjParams] = useState({ score_min: '', situacao: '', tem_telefone: false, tem_email: false, formato: 'csv' });

  function buildUrl(base, params) {
    const token = localStorage.getItem('token');
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === true) p.set(k, 'true');
      else if (v && v !== false) p.set(k, v);
    });
    p.set('token', token);
    return `/api/export/${base}?${p.toString()}`;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Exportar Listas</h1>
          <p className="page-subtitle">Baixe seus leads filtrados em CSV ou Excel</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>📍 Leads do Google Maps</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label>Score mínimo</label>
              <input type="number" placeholder="Ex: 50" value={leadsParams.score_min} onChange={(e) => setLeadsParams({ ...leadsParams, score_min: e.target.value })} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={leadsParams.tem_telefone} onChange={(e) => setLeadsParams({ ...leadsParams, tem_telefone: e.target.checked })} style={{ width: 'auto' }} /> Somente com telefone
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={leadsParams.tem_email} onChange={(e) => setLeadsParams({ ...leadsParams, tem_email: e.target.checked })} style={{ width: 'auto' }} /> Somente com email
            </label>
            <div className="form-group"><label>Formato</label><select value={leadsParams.formato} onChange={(e) => setLeadsParams({ ...leadsParams, formato: e.target.value })}><option value="csv">CSV</option><option value="xlsx">Excel (.xlsx)</option></select></div>
            <a href={buildUrl('leads', leadsParams)} download><button className="btn-primary" style={{ width: '100%' }}>📥 Baixar {leadsParams.formato.toUpperCase()}</button></a>
          </div>
        </div>
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>🏢 Leads de CNPJ</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group"><label>Score mínimo</label><input type="number" placeholder="Ex: 50" value={cnpjParams.score_min} onChange={(e) => setCnpjParams({ ...cnpjParams, score_min: e.target.value })} /></div>
            <div className="form-group"><label>Situação cadastral</label><select value={cnpjParams.situacao} onChange={(e) => setCnpjParams({ ...cnpjParams, situacao: e.target.value })}><option value="">Todas</option><option value="ATIVA">Ativa</option><option value="BAIXADA">Baixada</option><option value="SUSPENSA">Suspensa</option></select></div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><input type="checkbox" checked={cnpjParams.tem_telefone} onChange={(e) => setCnpjParams({ ...cnpjParams, tem_telefone: e.target.checked })} style={{ width: 'auto' }} /> Somente com telefone</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><input type="checkbox" checked={cnpjParams.tem_email} onChange={(e) => setCnpjParams({ ...cnpjParams, tem_email: e.target.checked })} style={{ width: 'auto' }} /> Somente com email</label>
            <div className="form-group"><label>Formato</label><select value={cnpjParams.formato} onChange={(e) => setCnpjParams({ ...cnpjParams, formato: e.target.value })}><option value="csv">CSV</option><option value="xlsx">Excel (.xlsx)</option></select></div>
            <a href={buildUrl('cnpj-leads', cnpjParams)} download><button className="btn-primary" style={{ width: '100%' }}>📥 Baixar {cnpjParams.formato.toUpperCase()}</button></a>
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Limite de exportação</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Cada exportação retorna no máximo 5.000 leads ordenados por score (maior primeiro). Use os filtros para refinar sua lista antes de exportar.</p>
      </div>
    </div>
  );
}