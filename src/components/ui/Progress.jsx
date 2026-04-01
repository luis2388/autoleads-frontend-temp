import React from 'react';

export function Progress({ value = 0, max = 100, color, label, showPercent = true }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const bg = color || (pct >= 80 ? '#10b981' : pct >= 40 ? '#6366f1' : '#f59e0b');

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        height: 10, background: 'var(--bg3)', borderRadius: 5, overflow: 'hidden',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: bg,
          borderRadius: 5, transition: 'width 0.5s ease',
        }} />
      </div>
      {(label || showPercent) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 12, color: 'var(--text-muted)' }}>
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      )}
    </div>
  );
}