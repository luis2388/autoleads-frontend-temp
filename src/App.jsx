import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { PrivateRoute, AdminRoute } from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Mineracao, { MineracaoDetalhe } from './pages/Mineracao';
import Leads from './pages/Leads';
import CNPJ from './pages/CNPJ';
import Exportar from './pages/Exportar';
import Configuracoes from './pages/Configuracoes';
import Admin from './pages/Admin';
import DisparoManual from './pages/DisparoManual';
import DisparoIA from './pages/DisparoIA';
import ExtracaoCNPJ from './pages/ExtracaoCNPJ';
import MeusWhatsApp from './pages/MeusWhatsApp';
import Fluxos from './pages/Fluxos';
import FluxoEditor from './pages/FluxoEditor';
import FollowUp from './pages/FollowUp';
import Chats from './pages/Chats';

function AppToaster() {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: dark ? '#1c1f2e' : '#ffffff',
          color: dark ? '#e2e8f0' : '#111827',
          border: `1px solid ${dark ? '#2a2d45' : '#dde1ee'}`,
          fontSize: 13,
          fontWeight: 500,
          borderRadius: 10,
          boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.5)' : '0 4px 24px rgba(0,0,0,0.1)',
        },
        success: { iconTheme: { primary: '#10b981', secondary: dark ? '#1c1f2e' : '#fff' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: dark ? '#1c1f2e' : '#fff' } },
        duration: 3500,
      }}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppToaster />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"      element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/mineracao"      element={<PrivateRoute><Layout><Mineracao /></Layout></PrivateRoute>} />
          <Route path="/mineracao/:id"  element={<PrivateRoute><Layout><MineracaoDetalhe /></Layout></PrivateRoute>} />
          <Route path="/leads"          element={<PrivateRoute><Layout><Leads /></Layout></PrivateRoute>} />
          <Route path="/cnpj"           element={<PrivateRoute><Layout><CNPJ /></Layout></PrivateRoute>} />
          <Route path="/exportar"       element={<PrivateRoute><Layout><Exportar /></Layout></PrivateRoute>} />
          <Route path="/disparo-manual" element={<PrivateRoute><Layout><DisparoManual /></Layout></PrivateRoute>} />
          <Route path="/disparo-ia"     element={<PrivateRoute><Layout><DisparoIA /></Layout></PrivateRoute>} />
          <Route path="/meus-whatsapp"  element={<PrivateRoute><Layout><MeusWhatsApp /></Layout></PrivateRoute>} />
          <Route path="/fluxos"         element={<PrivateRoute><Layout><Fluxos /></Layout></PrivateRoute>} />
          <Route path="/fluxos/:id"     element={<PrivateRoute><Layout><FluxoEditor /></Layout></PrivateRoute>} />
          <Route path="/follow-up"      element={<PrivateRoute><Layout><FollowUp /></Layout></PrivateRoute>} />
          <Route path="/chats"          element={<PrivateRoute><Layout><Chats /></Layout></PrivateRoute>} />
          <Route path="/pesquisa-cnpj"  element={<PrivateRoute><Layout><ExtracaoCNPJ /></Layout></PrivateRoute>} />
          <Route path="/configuracoes"  element={<PrivateRoute><Layout><Configuracoes /></Layout></PrivateRoute>} />
          <Route path="/admin"          element={<AdminRoute><Layout><Admin /></Layout></AdminRoute>} />
          <Route path="*"               element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}