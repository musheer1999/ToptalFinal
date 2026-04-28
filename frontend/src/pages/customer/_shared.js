import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/ui/NavBar';
import { fmtDateFull } from '../../components/ui';

export function PageShell({ children }) {
  return (
    <div style={{ background: '#F7F8FC', minHeight: '100vh' }}>
      <NavBar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px 80px' }}>
        {children}
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle, right, back }) {
  const navigate = useNavigate();
  return (
    <div style={{ marginBottom: 20 }}>
      {back && (
        <button
          onClick={() => navigate(back.to)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#4A5568',
            fontSize: 13,
            cursor: 'pointer',
            padding: '0 0 8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontFamily: 'inherit',
          }}
        >
          ← {back.label}
        </button>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(22px, 6vw, 32px)',
              fontWeight: 800,
              color: '#1A202C',
              letterSpacing: -0.5,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#718096', lineHeight: 1.5 }}>
              {subtitle}
            </p>
          )}
        </div>
        {right && <div style={{ flexShrink: 0 }}>{right}</div>}
      </div>
    </div>
  );
}

export function SummaryRow({ label, value, valueColor, large }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: large ? '4px 0' : '5px 0',
      }}
    >
      <span
        style={{
          fontSize: large ? 15 : 14,
          color: large ? '#1A202C' : '#718096',
          fontWeight: large ? 700 : 400,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: large ? 20 : 14,
          fontWeight: large ? 800 : 600,
          color: valueColor || '#1A202C',
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function Timeline({ history, currentStatus }) {
  const STAGES = ['Placed', 'Processing', 'In Route', 'Delivered', 'Received'];
  const completed = new Map((history || []).map((h) => [h.status, h.changed_at]));
  const isCanceled = currentStatus === 'Canceled';

  if (isCanceled) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {(history || []).map((h, i) => (
          <TimelineRow
            key={i}
            status={h.status}
            at={h.changed_at}
            done
            canceled={h.status === 'Canceled'}
            last={i === history.length - 1}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {STAGES.map((stage, i) => (
        <TimelineRow
          key={stage}
          status={stage}
          at={completed.get(stage)}
          done={!!completed.get(stage)}
          last={i === STAGES.length - 1}
        />
      ))}
    </div>
  );
}

function TimelineRow({ status, at, done, last, canceled }) {
  const color = canceled ? '#E53E3E' : done ? '#38A169' : '#CBD5E0';
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', minHeight: 48 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 999,
            flexShrink: 0,
            background: done ? color : 'white',
            border: `2px solid ${color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {done && (canceled ? '×' : '✓')}
        </div>
        {!last && (
          <div
            style={{
              flex: 1,
              width: 2,
              background: done ? color : '#EDF0F5',
              minHeight: 18,
              marginTop: 2,
            }}
          />
        )}
      </div>
      <div style={{ paddingTop: 2, paddingBottom: last ? 0 : 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: done ? '#1A202C' : '#A0AEC0' }}>
          {status}
        </div>
        <div style={{ fontSize: 12, color: '#718096', marginTop: 1 }}>
          {at ? fmtDateFull(at) : 'Pending'}
        </div>
      </div>
    </div>
  );
}
