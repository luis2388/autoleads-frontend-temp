import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Search, Filter, Download, Save, Bell, RefreshCw, ChevronDown, ChevronUp, X, Building2, MapPin, Phone, Mail, Calendar, TrendingUp, CheckSquare, Square, ArrowUpDown, Play, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import ScoreBadge from '../components/ScoreBadge';

const ESTADOS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];
const SITUACOES = [{ value: 'ativa', label: 'Ativa' }, { value: 'suspensa', label: 'Suspensa' }, { value: 'inapta', label: 'Inapta' }, { value: 'baixada', label: 'Baixada' }, { value: 'todas', label: 'Todas' }];

export default function ExtracaoCNPJ() {
  const [filtros, setFiltros] = useState({ uf: [], municipio: [], situacao: 'ativa', cnae: '', porte: [], capital_min: '', capital_max: '', abertura_de: '', abertura_ate: '', ddd: [], tem_telefone: false, tem_email: false });
  const [resultados, setResultados] = useState([]); const [total, setTotal] = useState(0); const [loading, setLoading] = useState(false);
  const [contagem, setContagem] = useState(null); const [contando, setContando] = useState(false);
  const [status, setStatus] = useState(null); const [offset, setOffset] = useState(0); const limite = 100;
  const [selecionados, setSelecionados] = useState(new Set()); const [exportando, setExportando] = useState(false);
  const [municipios, setMunicipios] = useState([]); const [buscaCnae, setBuscaCnae] = useState(''); const [sugestoesCnae, setSugestoesCnae] = useState([]);

  useEffect(() => { api.receitaStatus().then(setStatus).catch(() => {}); }, []);
  useEffect(() => { if (filtros.uf.length > 0) api.receitaMunicipios(filtros.uf).then(setMunicipios).catch(() => {}); else setMunicipios([]); }, [filtros.uf]);

  async function contar() { setContando(true); try { const r = await api.receitaContar(filtros); setContagem(r.total); toast.success(`${r.total.toLocaleString('pt-BR')} empresas encontradas`); } catch (err) { toast.error(err.message); } setContando(false); }

  async function buscar(novoOffset = 0) { setLoading(true); setOffset(novoOffset); try { const r = await api.receitaBuscar(filtros, limite, novoOffset); setResultados(r.empresas || []); setTotal(r.total || 0); } catch (err) { toast.error(err.message); } setLoading(false); }

  async function exportar(formato) {
    setExportando(true);
    try {
      const res = await api.receitaExportar(filtros, formato, 5000);
      if (!res.ok) throw new Error('Erro ao exportar');
      const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = url; a.download = `empresas_receita.${formato}`; a.click(); URL.revokeObjectURL(url); toast.success('Exportação concluída!');
    } catch (err) { toast.error(err.message); }
    setExportando(false);
  }

  function toggleUF(uf) { setFiltros(f => ({ ...f, uf: f.uf.includes(uf) ? f.uf.filter(u => u !== uf) : [...f.uf, uf] })); }

  return (<div>
    <div className="page-header"><div><h1 className="page-title">Pesquisa Receita Federal</h1><p className="page-subtitle">Busque empresas na base de {(status?.total_cnpjs || 0).toLocaleString('pt-BR')} CNPJs</p></div></div>

    <div className="card" style={{ marginBottom: 20 }}>
      <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Filtros de busca</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="form-group"><label>Estados (UF)</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{ESTADOS.map(uf => (<button key={uf} onClick={() => toggleUF(uf)} className={filtros.uf.includes(uf) ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'} style={{ minWidth: 42, fontSize: 11 }}>{uf}</button>))}</div></div>
        {municipios.length > 0 && <div className="form-group"><label>Municípios</label><select multiple value={filtros.municipio} onChange={e => setFiltros(f => ({...f, municipio: Array.from(e.target.selectedOptions, o => o.value)}))} style={{ height: 100 }}>{municipios.map(m => <option key={m} value={m}>{m}</option>)}</select></div>}
        <div className="form-row">
          <div className="form-group"><label>Situação</label><select value={filtros.situacao} onChange={e => setFiltros(f => ({...f, situacao: e.target.value}))}>{SITUACOES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
          <div className="form-group"><label>CNAE (atividade)</label><input value={filtros.cnae} onChange={e => setFiltros(f => ({...f, cnae: e.target.value}))} placeholder="Ex: 5611201 ou restaurante" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>DDD</label><input value={filtros.ddd.join(',')} onChange={e => setFiltros(f => ({...f, ddd: e.target.value.split(',').map(d => d.trim()).filter(Boolean)}))} placeholder="Ex: 11,21,31" /></div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}><input type="checkbox" checked={filtros.tem_telefone} onChange={e => setFiltros(f => ({...f, tem_telefone: e.target.checked}))} style={{ width: 'auto' }} /> Com telefone</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}><input type="checkbox" checked={filtros.tem_email} onChange={e => setFiltros(f => ({...f, tem_email: e.target.checked}))} style={{ width: 'auto' }} /> Com email</label>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={contar} disabled={contando}>{contando ? <><span className="loading" /> Contando...</> : <><Search size={14} /> Contar resultados</>}</button>
          <button className="btn-primary" onClick={() => buscar(0)} disabled={loading}>{loading ? <><span className="loading" /> Buscando...</> : <><Play size={14} /> Buscar empresas</>}</button>
          {contagem !== null && <span style={{ color: 'var(--text-muted)', fontSize: 13, alignSelf: 'center' }}>{contagem.toLocaleString('pt-BR')} empresas encontradas</span>}
        </div>
      </div>
    </div>

    {resultados.length > 0 && <div className="card">
      <div className="card-header"><div><div className="card-title">{total.toLocaleString('pt-BR')} resultados</div></div>
        <div style={{ display: 'flex', gap: 8 }}><button className="btn-secondary btn-sm" onClick={() => exportar('xlsx')} disabled={exportando}><Download size={13} /> XLSX</button><button className="btn-secondary btn-sm" onClick={() => exportar('csv')} disabled={exportando}><Download size={13} /> CSV</button></div>
      </div>
      <div className="table-wrapper"><table><thead><tr><th>CNPJ</th><th>Razão Social</th><th>Fantasia</th><th>UF</th><th>Município</th><th>CNAE</th><th>Telefone</th><th>Email</th><th>Situação</th></tr></thead>
        <tbody>{resultados.map((e, i) => (<tr key={i}><td style={{ fontFamily: 'monospace', fontSize: 11 }}>{e.cnpj}</td><td style={{ fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.razao_social}</td><td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.nome_fantasia || '—'}</td><td>{e.uf}</td><td style={{ fontSize: 12 }}>{e.municipio}</td><td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.cnae_fiscal}</td><td>{e.telefone1 || '—'}</td><td style={{ fontSize: 12 }}>{e.email || '—'}</td><td><span className={`badge ${e.situacao_cadastral === 'ATIVA' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 10 }}>{e.situacao_cadastral}</span></td></tr>))}</tbody>
      </table></div>
      <div className="pagination" style={{ marginTop: 16 }}><button className="btn-secondary btn-sm" onClick={() => buscar(Math.max(0, offset - limite))} disabled={offset === 0 || loading}>← Anterior</button><span>Mostrando {offset + 1} - {Math.min(offset + limite, total)} de {total.toLocaleString('pt-BR')}</span><button className="btn-secondary btn-sm" onClick={() => buscar(offset + limite)} disabled={offset + limite >= total || loading}>Próxima →</button></div>
    </div>}
  </div>);
}
