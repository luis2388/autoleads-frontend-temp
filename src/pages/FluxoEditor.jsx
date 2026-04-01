import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, { ReactFlowProvider, addEdge, useNodesState, useEdgesState, Controls, MiniMap, Background, Handle, Position, useReactFlow, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Play, Plus, Trash2, X, MessageSquare, Image, Video, Mic, Paperclip, Clock, HelpCircle, GitBranch, Variable, Webhook, Upload } from 'lucide-react';
import { api } from '../services/api';

const NODE_CONFIG = {
  inicio: { label: 'Início', color: '#10b981', bg: 'rgba(16,185,129,0.1)', Icon: Play, handle: 'saida' },
  mensagem: { label: 'Mensagem', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', Icon: MessageSquare, handle: 'saida' },
  delay: { label: 'Delay', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', Icon: Clock, handle: 'saida' },
  pergunta: { label: 'Pergunta', color: '#a855f7', bg: 'rgba(168,85,247,0.1)', Icon: HelpCircle, handle: 'duplo' },
  condicao: { label: 'Condição', color: '#f97316', bg: 'rgba(249,115,22,0.1)', Icon: GitBranch, handle: 'duplo' },
  fim: { label: 'Fim', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', Icon: X, handle: 'entrada' },
};

function FluxoNode({ data, type, selected }) {
  const cfg = NODE_CONFIG[type] || NODE_CONFIG.mensagem; const { Icon } = cfg;
  const isDuplo = cfg.handle === 'duplo'; const isEntrada = cfg.handle === 'entrada';
  const preview = data.label || data.texto || data.legenda || (data.variacoes && data.variacoes[0]) || (type === 'delay' ? `${data.valor || '?'} ${data.unidade || 'min'}` : '(sem conteúdo)');
  return (<div style={{ minWidth: 160, maxWidth: 220, background: 'var(--bg2)', border: `2px solid ${selected ? cfg.color : 'var(--border)'}`, borderRadius: 12, boxShadow: selected ? `0 0 0 3px ${cfg.color}33` : '0 2px 8px rgba(0,0,0,0.2)' }}>
    <div style={{ background: cfg.bg, borderBottom: '1px solid var(--border)', padding: '8px 12px', borderRadius: '10px 10px 0 0', display: 'flex', alignItems: 'center', gap: 7 }}><Icon size={14} color={cfg.color} /><span style={{ fontSize: 12, fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cfg.label}</span></div>
    <div style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4, wordBreak: 'break-word' }}>{typeof preview === 'string' ? preview.substring(0, 80) : preview}</div>
    {type !== 'inicio' && <Handle type="target" position={Position.Top} style={{ background: cfg.color, width: 10, height: 10 }} />}
    {!isEntrada && !isDuplo && <Handle type="source" position={Position.Bottom} style={{ background: cfg.color, width: 10, height: 10 }} />}
    {isDuplo && <><Handle type="source" position={Position.Bottom} id="verdadeiro" style={{ background: '#10b981', width: 10, height: 10, left: '30%' }} /><Handle type="source" position={Position.Bottom} id="falso" style={{ background: '#ef4444', width: 10, height: 10, left: '70%' }} /></>}
  </div>);
}

const nodeTypes = Object.fromEntries(Object.keys(NODE_CONFIG).map(type => [type, (props) => <FluxoNode {...props} />]));

function Editor({ fluxoId }) {
  const navigate = useNavigate(); const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]); const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nomFluxo, setNomFluxo] = useState('Novo Fluxo'); const [selectedNode, setSelectedNode] = useState(null);
  const [saving, setSaving] = useState(false); const [loading, setLoading] = useState(true);

  useEffect(() => { carregarFluxo(); }, [fluxoId]);
  async function carregarFluxo() { setLoading(true); try { const f = await api.buscarFluxo(fluxoId); setNomFluxo(f.nome); const canvas = f.canvas_json || {}; setNodes(canvas.nodes || []); setEdges(canvas.edges || []); } catch (err) { toast.error('Erro: ' + err.message); } setLoading(false); }

  const onConnect = useCallback((params) => { setEdges(eds => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: 'var(--accent)', strokeWidth: 2 }, animated: true }, eds)); }, []);
  const onDragOver = useCallback((e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);
  const onDrop = useCallback((e) => { e.preventDefault(); const type = e.dataTransfer.getData('application/reactflow'); if (!type) return; const position = screenToFlowPosition({ x: e.clientX, y: e.clientY }); const id = `${type}_${Date.now()}`; const defaultData = { inicio: { label: 'Início' }, mensagem: { tipo_midia: 'texto', variacoes: [''] }, delay: { valor: 1, unidade: 'horas' }, pergunta: { texto: '', timeout_horas: 24 }, condicao: { variavel: '', operador: 'contains', valor: '' }, fim: { etiqueta: '' } }[type] || {}; setNodes(nds => nds.concat({ id, type, position, data: defaultData })); }, [screenToFlowPosition]);

  async function salvar() { setSaving(true); try { await api.salvarFluxo(fluxoId, { nome: nomFluxo, canvas_json: { nodes, edges } }); toast.success('Fluxo salvo!'); } catch (err) { toast.error(err.message); } setSaving(false); }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><span className="loading" style={{ width: 36, height: 36 }} /></div>;

  return (<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div style={{ height: 52, background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0 }}>
      <button className="btn-secondary btn-sm" onClick={() => { salvar(); setTimeout(() => navigate('/fluxos'), 300); }}><ArrowLeft size={14} /> Voltar</button>
      <input value={nomFluxo} onChange={e => setNomFluxo(e.target.value)} onKeyDown={e => e.stopPropagation()} style={{ background: 'transparent', border: 'none', fontSize: 15, fontWeight: 700, color: 'var(--text)', outline: 'none', minWidth: 200 }} />
      <div style={{ flex: 1 }} />
      <button className="btn-primary btn-sm" onClick={salvar} disabled={saving}>{saving ? 'Salvando...' : <><Save size={13} /> Salvar</>}</button>
    </div>
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <div style={{ width: 180, background: 'var(--bg2)', borderRight: '1px solid var(--border)', padding: 10, overflowY: 'auto' }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>Nós</div>
        {Object.entries(NODE_CONFIG).filter(([k]) => k !== 'inicio').map(([tipo, cfg]) => (<div key={tipo} draggable onDragStart={e => { e.dataTransfer.setData('application/reactflow', tipo); e.dataTransfer.effectAllowed = 'move'; }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, marginBottom: 4, border: '1px solid var(--border)', background: cfg.bg, cursor: 'grab', userSelect: 'none' }}><cfg.Icon size={14} color={cfg.color} /><span style={{ fontSize: 12, fontWeight: 500 }}>{cfg.label}</span></div>))}
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onDrop={onDrop} onDragOver={onDragOver} onNodeClick={(_, node) => setSelectedNode(node)} onPaneClick={() => setSelectedNode(null)} nodeTypes={nodeTypes} fitView deleteKeyCode={null} style={{ background: 'var(--bg)' }}>
          <Controls style={{ bottom: 80 }} /><MiniMap style={{ bottom: 20, right: 20, background: 'var(--bg2)', border: '1px solid var(--border)' }} nodeColor={n => NODE_CONFIG[n.type]?.color || '#6366f1'} /><Background color="var(--border)" gap={20} />
        </ReactFlow>
      </div>
    </div>
  </div>);
}

export default function FluxoEditor() {
  const { id } = useParams();
  return <ReactFlowProvider><div style={{ height: 'calc(100vh - 58px)', display: 'flex', flexDirection: 'column', margin: -28 }}><Editor fluxoId={id} /></div></ReactFlowProvider>;
}
