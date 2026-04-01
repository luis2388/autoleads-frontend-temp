const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  return data;
}

export const api = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email, password) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request('/auth/me'),
  getSettings: () => request('/settings'),
  updateSettings: (data) =>
    request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  criarMineracao: (data) =>
    request('/mineracoes', { method: 'POST', body: JSON.stringify(data) }),
  listarMineracoes: () => request('/mineracoes'),
  buscarMineracao: (id) => request(`/mineracoes/${id}`),
  listarLeadsDaMineracao: (id, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/mineracoes/${id}/leads?${qs}`);
  },
  listarLeads: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/leads?${qs}`);
  },
  consultarCnpj: (cnpj) =>
    request('/cnpj/consultar', { method: 'POST', body: JSON.stringify({ cnpj }) }),
  listarCnpjLeads: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/cnpj?${qs}`);
  },
  uploadCnpjLista: async (file) => {
    const token = getToken();
    const form = new FormData();
    form.append('arquivo', file);
    const res = await fetch(`${BASE}/cnpj/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
    return data;
  },
  exportarLeads: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return `${BASE}/export/leads?${qs}&token=${getToken()}`;
  },
  exportarCnpjLeads: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return `${BASE}/export/cnpj-leads?${qs}&token=${getToken()}`;
  },
  adminStats: () => request('/admin/stats'),
  adminListarUsuarios: () => request('/admin/usuarios'),
  adminCriarUsuario: (data) =>
    request('/admin/usuarios', { method: 'POST', body: JSON.stringify(data) }),
  adminToggleUsuario: (id) =>
    request(`/admin/usuarios/${id}/toggle`, { method: 'PATCH' }),
  adminAlterarRole: (id, role) =>
    request(`/admin/usuarios/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  adminResetSenha: (id, nova_senha) =>
    request(`/admin/usuarios/${id}/senha`, { method: 'PATCH', body: JSON.stringify({ nova_senha }) }),
  adminAtualizarPlanoUsuario: (id, plan_id) =>
    request(`/admin/usuarios/${id}/plano`, { method: 'PATCH', body: JSON.stringify({ plan_id }) }),
  adminListarPlanos: () => request('/admin/planos'),
  adminCriarPlano: (data) =>
    request('/admin/planos', { method: 'POST', body: JSON.stringify(data) }),
  adminAtualizarPlano: (id, data) =>
    request(`/admin/planos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeletarPlano: (id) =>
    request(`/admin/planos/${id}`, { method: 'DELETE' }),
  kiwifyGetConfig: () => request('/kiwify/config'),
  kiwifySalvarConfig: (data) =>
    request('/kiwify/config', { method: 'POST', body: JSON.stringify(data) }),
  kiwifyEventos: () => request('/kiwify/eventos'),
  listarInstancias: () => request('/evolution/instancias'),
  statusInstancia: (nome) => request(`/evolution/instancias/${nome}/status`),
  testarIAKey: (provider) => request(`/evolution/testar-ia/${provider}`),
  criarCampanhaManual: (data) =>
    request('/campanhas/manual', { method: 'POST', body: JSON.stringify(data) }),
  listarCampanhasManuais: () => request('/campanhas/manual'),
  statusCampanhaManual: (id) => request(`/campanhas/manual/${id}/status`),
  controlarCampanhaManual: (id, acao) =>
    request(`/campanhas/manual/${id}/controlar`, { method: 'POST', body: JSON.stringify({ acao }) }),
  exportarLogManual: (id) =>
    `${BASE}/campanhas/manual/${id}/export?token=${getToken()}`,
  criarCampanhaIA: (data) =>
    request('/campanhas/ia', { method: 'POST', body: JSON.stringify(data) }),
  listarCampanhasIA: () => request('/campanhas/ia'),
  statusCampanhaIA: (id) => request(`/campanhas/ia/${id}/status`),
  controlarCampanhaIA: (id, acao) =>
    request(`/campanhas/ia/${id}/controlar`, { method: 'POST', body: JSON.stringify({ acao }) }),
  exportarLogIA: (id) =>
    `${BASE}/campanhas/ia/${id}/export?token=${getToken()}`,
  listarFluxos: () => request('/fluxos'),
  criarFluxo: (data) => request('/fluxos', { method: 'POST', body: JSON.stringify(data) }),
  buscarFluxo: (id) => request(`/fluxos/${id}`),
  salvarFluxo: (id, data) => request(`/fluxos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletarFluxo: (id) => request(`/fluxos/${id}`, { method: 'DELETE' }),
  duplicarFluxo: (id) => request(`/fluxos/${id}/duplicar`, { method: 'POST' }),
  uploadMidiaFluxo: (data) => request('/fluxos/midia', { method: 'POST', body: JSON.stringify(data) }),
  testarWebhook: (data) => request('/fluxos/testar-webhook', { method: 'POST', body: JSON.stringify(data) }),
  criarFollowup: (data) => request('/followup', { method: 'POST', body: JSON.stringify(data) }),
  listarFollowups: () => request('/followup'),
  statusFollowup: (id) => request(`/followup/${id}/status`),
  controlarFollowup: (id, acao) => request(`/followup/${id}/controlar`, { method: 'POST', body: JSON.stringify({ acao }) }),
  listarChips: () => request('/chips'),
  criarChip: (nome) => request('/chips', { method: 'POST', body: JSON.stringify({ nome }) }),
  qrcodeChip: (id) => request(`/chips/${id}/qrcode`),
  pairingCodeChip: (id, phone) =>
    request(`/chips/${id}/pairing`, { method: 'POST', body: JSON.stringify({ phone }) }),
  statusChip: (id) => request(`/chips/${id}/status`),
  desconectarChip: (id) => request(`/chips/${id}/disconnect`, { method: 'POST' }),
  deletarChip: (id) => request(`/chips/${id}`, { method: 'DELETE' }),
  receitaStatus: () => request('/receita/status'),
  receitaContar: (filtros) =>
    request('/receita/contar', { method: 'POST', body: JSON.stringify(filtros) }),
  receitaBuscar: (filtros, limite = 100, offset = 0) =>
    request('/receita/buscar', { method: 'POST', body: JSON.stringify({ filtros, limite, offset }) }),
  receitaMunicipios: (ufs) =>
    request(`/receita/municipios?ufs=${ufs.join(',')}`),
  receitaCnaes: (q) => request(`/receita/cnaes?q=${encodeURIComponent(q)}`),
  receitaNaturezas: () => request('/receita/naturezas'),
  receitaExportar: (filtros, formato = 'xlsx', limite = 5000) => {
    const token = getToken();
    return fetch(`/api/receita/exportar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ filtros, formato, limite }),
    });
  },
  receitaSalvarLista: (nome, filtros, limite) =>
    request('/receita/salvar-lista', { method: 'POST', body: JSON.stringify({ nome, filtros, limite }) }),
  receitaAlertas: () => request('/receita/alertas'),
  receitaCriarAlerta: (nome_alerta, filtros) =>
    request('/receita/alertas', { method: 'POST', body: JSON.stringify({ nome_alerta, filtros }) }),
  receitaDeletarAlerta: (id) =>
    request(`/receita/alertas/${id}`, { method: 'DELETE' }),
  receitaNotificacoes: () => request('/receita/notificacoes'),
  receitaMarcarLida: (id) =>
    request(`/receita/notificacoes/${id}/lida`, { method: 'PATCH' }),
  receitaAdminStats: () => request('/receita/admin/stats'),
  receitaAdminForcar: () => request('/receita/admin/forcar', { method: 'POST' }),
  listarChats: () => request('/chats'),
  naoLidosCount: () => request('/chats/nao-lidos/count'),
  mensagensLead: (leadId) => request(`/chats/${leadId}/mensagens`),
  enviarManual: (leadId, mensagem, chip_instance_name) =>
    request(`/chats/${leadId}/enviar`, { method: 'POST', body: JSON.stringify({ mensagem, chip_instance_name }) }),
  marcarLido: (leadId) => request(`/chats/${leadId}/lido`, { method: 'PATCH' }),
  pularEtapa: (leadId) => request(`/chats/${leadId}/pular-etapa`, { method: 'POST' }),
  pausarLead: (leadId) => request(`/chats/${leadId}/pausar`, { method: 'POST' }),
};
