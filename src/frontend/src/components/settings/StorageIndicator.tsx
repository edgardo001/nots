import { useState, useEffect } from 'react'
import { useT } from '../../i18n'

interface StorageIndicatorProps {
  onClick?: () => void
}

export default function StorageIndicator({ onClick }: StorageIndicatorProps) {
  const t_ = useT()
  const [usage, setUsage] = useState<{ used: number; total: number } | null>(null)

  useEffect(() => {
    if (!navigator.storage?.estimate) return
    navigator.storage.estimate().then(est => {
      if (est.usage != null && est.quota != null) {
        setUsage({ used: est.usage, total: est.quota })
      }
    })
  }, [])

  if (!usage) return null

  const { used, total } = usage
  const pct = Math.min((used / total) * 100, 100)
  const usedMB = (used / 1024 / 1024).toFixed(1)
  const totalMB = (total / 1024 / 1024).toFixed(0)

  const size = 36
  const stroke = 4
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dashoffset = circumference - (pct / 100) * circumference

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick?.() }}
      style={{ position: 'relative', width: size, height: size, flexShrink: 0, cursor: 'pointer' }}
      title={t_('storage.click_details', { used: usedMB, total: totalMB, pct: pct.toFixed(1) })}
      aria-label={t_('storage.aria_label', { used: usedMB, total: totalMB })}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={pct > 80 ? '#e85d3a' : 'var(--accent)'}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 8, fontWeight: 700, color: 'var(--text-secondary)',
      }}>
        {usedMB}
      </span>
    </div>
  )
}
