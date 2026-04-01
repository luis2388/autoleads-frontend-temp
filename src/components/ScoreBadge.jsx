import React from 'react';

export default function ScoreBadge({ score }) {
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="score-bar">
      <span style={{ fontSize: 13, fontWeight: 600, color, minWidth: 28 }}>{score}</span>
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}