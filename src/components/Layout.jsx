import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Search, Users, Building2, Download, Settings, Shield, Send, Bot, LogOut, Rocket, Sun, Moon, ChevronLeft, ChevronRight, Bell, TrendingUp, Database, FileSearch, Smartphone, GitBranch, RefreshCw, MessageSquare, Menu, X } from 'lucide-react';
import { clearAuth, getUser, isAdmin } from '../services/auth';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';

const NAV_SECTIONS = [
  { label: 'Captação', items: [
    { path: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { path: '/mineracao', label: 'Mineração', Icon: Search },
    { path: '/leads', label: 'Leads', Icon: Users },
    { path: '/cnpj', label: 'CNPJ', Icon: Building2 },
    { path: '/pesquisa-cnpj', label: 'Pesquisa Receita', Icon: FileSearch },
  ]},
  { label: 'Disparos', items: [
    { path: '/meus-whatsapp', label: 'Meus WhatsApp', Icon: Smartphone },
    { path: '/fluxos', label: 'Fluxos', Icon: GitBranch },
    { path: '/disparo-manual', label: 'Manual', Icon: Send },
    { path: '/disparo-ia', label: 'Com IA', Icon: Bot },
    { path: '/follow-up', label: 'Follow-up', Icon: RefreshCw },
    { path: '/chats', label: 'Chats', Icon: MessageSquare, badge: true },
  ]},
  { label: 'Dados', items: [
    { path: '/exportar', label: 'Exportar', Icon: Download },
    { path: '/configuracoes', label: 'Configurações', Icon: Settings },
  ]},
];

const ADMIN_SECTION = { label: 'Sistema', items: [{ path: '/admin', label: 'Admin', Icon: Shield }] };

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [naoLidos, setNaoLidos] = useState(0);
  const pollingRef = useRef(null);

  useEffect(() => {
    function fetchCount() { api.naoLidosCount().then(d => setNaoLidos(d?.total || 0)).catch(() => {}); }
    fetchCount(); pollingRef.current = setInterval(fetchCount, 10000);
    return () => clearInterval(pollingRef.current);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const sections = isAdmin() ? [...NAV_SECTIONS, ADMIN_SECTION] : NAV_SECTIONS;
  function handleLogout() { clearAuth(); navigate('/login'); }
  const pageTitle = getPageTitle(location.pathname);
  const isLight = theme === 'light';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99, display: 'none' }} className="mobile-overlay" />}

      <aside className={mobileOpen ? 'sidebar sidebar-mobile-open' : 'sidebar'} style={{ width: collapsed ? 68 : 'var(--sidebar-w, 240px)', minWidth: collapsed ? 68 : 'var(--sidebar-w, 240px)', background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', transition: 'width 0.25s cubic-bezier(.4,0,.2,1), min-width 0.25s cubic-bezier(.4,0,.2,1)', position: 'relative', overflow: 'hidden', zIndex: 100 }}>
        <div style={{ height: 'var(--header-h, 58px)', display: 'flex', alignItems: 'center', padding: collapsed ? '0 18px' : '0 20px', borderBottom: '1px solid var(--border)', gap: 10, flexShrink: 0, justifyContent: collapsed ? 'center' : 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, var(--accent) 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 10px rgba(99,102,241,0.4)' }}><Rocket size={16} color="#fff" /></div>
            {!collapsed && <div><div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.3px', color: 'var(--text)', lineHeight: 1 }}>AutoLeads</div><div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.05em', marginTop: 2 }}>CRM & Prospecção</div></div>}
          </div>
          {!collapsed && <button onClick={() => setCollapsed(true)} className="btn-ghost btn-icon" style={{ flexShrink: 0 }} title="Recolher sidebar"><ChevronLeft size={15} /></button>}
        </div>

        {collapsed && <button onClick={() => setCollapsed(false)} title="Expandir sidebar" style={{ position: 'absolute', bottom: 80, right: -12, width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', border: '2px solid var(--bg)', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}><ChevronRight size={11} /></button>}

        <nav style={{ flex: 1, padding: '8px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
          {sections.map((section, si) => (
            <div key={si} style={{ marginBottom: 4 }}>
              {!collapsed && <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-soft)', padding: '12px 10px 6px' }}>{section.label}</div>}
              {collapsed && si > 0 && <div style={{ height: 1, background: 'var(--border-soft)', margin: '8px 4px' }} />}
              {section.items.map(({ path, label, Icon, badge }) => {
                const active = location.pathname.startsWith(path);
                const showBadge = badge && naoLidos > 0;
                return (
                  <Link key={path} to={path} title={collapsed ? label : undefined} style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 8, padding: collapsed ? '10px 0' : '9px 12px', justifyContent: collapsed ? 'center' : 'flex-start', marginBottom: 2, textDecoration: 'none', background: active ? 'var(--accent-soft)' : 'transparent', color: active ? 'var(--accent)' : 'var(--text-muted)', fontWeight: active ? 700 : 400, fontSize: 14, position: 'relative', transition: 'all 0.15s' }} onMouseEnter={(e) => !active && (e.currentTarget.style.background = 'var(--bg3)')} onMouseLeave={(e) => !active && (e.currentTarget.style.background = 'transparent')}>
                    {active && <span style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, background: 'var(--accent)', borderRadius: '0 3px 3px 0' }} />}
                    <div style={{ position: 'relative', flexShrink: 0 }}><Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
                      {showBadge && collapsed && <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 14, height: 14, borderRadius: 7, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{naoLidos > 99 ? '99+' : naoLidos}</span>}
                    </div>
                    {!collapsed && <><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{label}</span>{showBadge && <span style={{ minWidth: 18, height: 18, borderRadius: 9, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{naoLidos > 99 ? '99+' : naoLidos}</span>}</>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          {!collapsed && <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--bg3)', marginBottom: 8, border: '1px solid var(--border)' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, var(--accent), #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#fff' }}>{user?.email?.[0]?.toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div><div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{user?.role === 'admin' ? 'Administrador' : 'Usuário'}</div></div>
          </div>}
          <button onClick={handleLogout} title="Sair" className="btn-secondary" style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start', fontSize: 13, padding: '9px 12px' }}><LogOut size={15} />{!collapsed && 'Sair'}</button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <header style={{ height: 'var(--header-h, 58px)', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setMobileOpen(o => !o)} className="btn-ghost btn-icon mobile-menu-btn" style={{ display: 'none', marginRight: 4 }} title="Menu">{mobileOpen ? <X size={18} /> : <Menu size={18} />}</button>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{pageTitle}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={toggleTheme} className="btn-ghost btn-icon" title={isLight ? 'Modo escuro' : 'Modo claro'} style={{ borderRadius: 10, padding: 9, background: 'var(--bg3)', border: '1px solid var(--border)', color: isLight ? '#f59e0b' : '#a5b4fc', transition: 'all 0.2s' }}>{isLight ? <Sun size={17} /> : <Moon size={17} />}</button>
            <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 6px' }} />
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#fff', cursor: 'default' }}>{user?.email?.[0]?.toUpperCase()}</div>
          </div>
        </header>
        <main style={{ flex: 1, padding: 28, overflowY: 'auto', overflowX: 'hidden' }}>{children}</main>
      </div>
    </div>
  );
}

function getPageTitle(pathname) {
  const map = { '/dashboard': 'Dashboard', '/mineracao': 'Mineração de Leads', '/leads': 'Meus Leads', '/cnpj': 'Consulta CNPJ', '/pesquisa-cnpj': 'Pesquisa Receita Federal', '/exportar': 'Exportar Listas', '/meus-whatsapp': 'Meus WhatsApp', '/fluxos': 'Fluxos de Mensagem', '/disparo-manual': 'Disparo Manual', '/disparo-ia': 'Disparo com IA', '/follow-up': 'Follow-up Automático', '/chats': 'Chats', '/configuracoes': 'Configurações', '/admin': 'Painel Admin' };
  const key = Object.keys(map).find((k) => pathname.startsWith(k));
  return map[key] || 'AutoLeads';
}
