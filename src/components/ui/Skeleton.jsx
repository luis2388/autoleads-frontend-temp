import React from 'react';

export function Skeleton({ className = '', style = {} }) {
  return (
    <div
      className={className}
      style={{
        background: 'linear-gradient(90deg, var(--bg3) 25%, #2a2e44 50%, var(--bg3) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: 6,
        ...style,
      }}
    />
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} style={{ padding: '12px 16px', background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
                <Skeleton style={{ height: 12, width: '80%' }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} style={{ borderBottom: '1px solid var(--border)' }}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} style={{ padding: '14px 16px' }}>
                  <Skeleton style={{ height: 12, width: `${60 + Math.random() * 35}%` }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}