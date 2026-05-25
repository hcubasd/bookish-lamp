import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { squeezeText } from 'psychic-potato'
import { findPalettes, generateForegroundSteps } from 'miniature-waffle'
import { fetchDeals } from './api'
import type { Campaign, Contact, Deal, Industry, Organization, Pipeline, PipelineStage, Product, Source, Team, User } from './types'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

type AggRow = { id: string; title: string; amount: number; source: Record<string, unknown> }

function formatTooltip(obj: Record<string, unknown>): string {
  return Object.entries(obj)
    .filter(([k, v]) => {
      if (k === 'id' || k.endsWith('_id')) return false
      if (v === null || v === undefined) return false
      if (Array.isArray(v)) return v.length > 0 && typeof v[0] !== 'object'
      if (typeof v === 'object') return false
      return true
    })
    .map(([k, v]) =>
      Array.isArray(v) ? `${k}: ${(v as unknown[]).join(', ')}` : `${k}: ${v}`
    )
    .join('\n')
}

function lastTwelveMonths() {
  const now = new Date()
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })
}

function formatMonthLabel(year: number, month: number): string {
  const date = new Date(year, month, 1)
  if (month === 0) {
    const name = new Intl.DateTimeFormat(navigator.language, { month: 'short' }).format(date)
    return `${name}/${String(year).slice(-2)}`
  }
  return new Intl.DateTimeFormat(navigator.language, { month: 'long' }).format(date)
}

function uniquePipelines(deals: Deal[]): Pipeline[] {
  const map = new Map<string, Pipeline>()
  deals.forEach(d => map.set(d.stage.pipeline.id, d.stage.pipeline))
  return [...map.values()].sort((a, b) => a.display_order - b.display_order)
}

function stagesForPipeline(deals: Deal[], pipelineId: string): PipelineStage[] {
  const map = new Map<string, PipelineStage>()
  deals
    .filter(d => d.stage.pipeline.id === pipelineId)
    .forEach(d => map.set(d.stage.id, d.stage))
  return [...map.values()].sort((a, b) => a.display_order - b.display_order)
}

function aggregate(deals: Deal[], pipelines: Pipeline[], months: ReturnType<typeof lastTwelveMonths>) {
  return pipelines.map(pipeline =>
    months.map(({ year, month }) =>
      deals
        .filter(d => {
          if (!d.closed_at) return false
          const t = new Date(d.closed_at)
          return d.stage.pipeline.id === pipeline.id && t.getFullYear() === year && t.getMonth() === month
        })
        .reduce((sum, d) => sum + (d.amount ?? 0), 0)
    )
  )
}

function rowsByStage(deals: Deal[], pipelineId: string): AggRow[] {
  return stagesForPipeline(deals, pipelineId).map(stage => ({
    id: stage.id,
    title: stage.title,
    amount: deals.filter(d => d.stage.id === stage.id).reduce((s, d) => s + (d.amount ?? 0), 0),
    source: stage as unknown as Record<string, unknown>,
  }))
}

function rowsByOwner(deals: Deal[], pipelineId: string): AggRow[] {
  const pipelineDeals = deals.filter(d => d.stage.pipeline.id === pipelineId)
  const owners = new Map<string, User>()
  pipelineDeals.forEach(d => { if (d.owner) owners.set(d.owner.id, d.owner) })
  return [...owners.values()]
    .map(owner => ({
      id: `${pipelineId}:${owner.id}`,
      title: owner.full_name,
      amount: pipelineDeals.filter(d => d.owner?.id === owner.id).reduce((s, d) => s + (d.amount ?? 0), 0),
      source: owner as unknown as Record<string, unknown>,
    }))
    .sort((a, b) => b.amount - a.amount)
}

function rowsByOrganization(deals: Deal[], pipelineId: string): AggRow[] {
  const pipelineDeals = deals.filter(d => d.stage.pipeline.id === pipelineId)
  const orgs = new Map<string, Organization>()
  pipelineDeals.forEach(d => { if (d.organization) orgs.set(d.organization.id, d.organization) })
  return [...orgs.values()]
    .map(org => ({
      id: `${pipelineId}:${org.id}`,
      title: org.title,
      amount: pipelineDeals.filter(d => d.organization?.id === org.id).reduce((s, d) => s + (d.amount ?? 0), 0),
      source: org as unknown as Record<string, unknown>,
    }))
    .sort((a, b) => b.amount - a.amount)
}

function rowsByContact(deals: Deal[], pipelineId: string): AggRow[] {
  const pipelineDeals = deals.filter(d => d.stage.pipeline.id === pipelineId)
  const contactMap = new Map<string, Contact>()
  pipelineDeals.forEach(d => d.contacts.forEach(c => contactMap.set(c.id, c)))
  return [...contactMap.values()]
    .map(c => ({
      id: `${pipelineId}:${c.id}`,
      title: c.full_name,
      amount: pipelineDeals.filter(d => d.contacts.some(dc => dc.id === c.id)).reduce((s, d) => s + (d.amount ?? 0), 0),
      source: c as unknown as Record<string, unknown>,
    }))
    .sort((a, b) => b.amount - a.amount)
}

function rowsByProduct(deals: Deal[], pipelineId: string): AggRow[] {
  const pipelineDeals = deals.filter(d => d.stage.pipeline.id === pipelineId)
  const productMap = new Map<string, Product>()
  pipelineDeals.forEach(d => d.products.forEach(p => productMap.set(p.id, p)))
  return [...productMap.values()]
    .map(p => ({
      id: `${pipelineId}:${p.id}`,
      title: p.title,
      amount: pipelineDeals.filter(d => d.products.some(dp => dp.id === p.id)).reduce((s, d) => s + (d.amount ?? 0), 0),
      source: p as unknown as Record<string, unknown>,
    }))
    .sort((a, b) => b.amount - a.amount)
}

const ROW_MODES = [
  { fn: rowsByStage,        label: 'Estágios'      },
  { fn: rowsByOwner,        label: 'Responsáveis'  },
  { fn: rowsByOrganization, label: 'Clientes'      },
  { fn: rowsByContact,      label: 'Contatos'      },
  { fn: rowsByProduct,      label: 'Produtos'      },
  { fn: rowsByCampaign,     label: 'Campanhas'     },
  { fn: rowsBySource,       label: 'Origens'       },
  { fn: rowsByTeam,         label: 'Times'                   },
  { fn: rowsByIndustry,     label: 'Segmentos dos Clientes'  },
]

function rowsByIndustry(deals: Deal[], pipelineId: string): AggRow[] {
  const pipelineDeals = deals.filter(d => d.stage.pipeline.id === pipelineId)
  const industryMap = new Map<string, Industry>()
  pipelineDeals.forEach(d => d.organization?.industries.forEach(i => industryMap.set(i.id, i)))
  return [...industryMap.values()]
    .map(i => ({
      id: `${pipelineId}:${i.id}`,
      title: i.title,
      amount: pipelineDeals.filter(d => d.organization?.industries.some(di => di.id === i.id)).reduce((s, d) => s + (d.amount ?? 0), 0),
      source: i as unknown as Record<string, unknown>,
    }))
    .sort((a, b) => b.amount - a.amount)
}

function rowsByTeam(deals: Deal[], pipelineId: string): AggRow[] {
  const pipelineDeals = deals.filter(d => d.stage.pipeline.id === pipelineId)
  const teamMap = new Map<string, Team>()
  pipelineDeals.forEach(d => { if (d.owner?.team) teamMap.set(d.owner.team.id, d.owner.team) })
  return [...teamMap.values()]
    .map(t => ({
      id: `${pipelineId}:${t.id}`,
      title: t.title,
      amount: pipelineDeals.filter(d => d.owner?.team?.id === t.id).reduce((s, d) => s + (d.amount ?? 0), 0),
      source: t as unknown as Record<string, unknown>,
    }))
    .sort((a, b) => b.amount - a.amount)
}

function rowsBySource(deals: Deal[], pipelineId: string): AggRow[] {
  const pipelineDeals = deals.filter(d => d.stage.pipeline.id === pipelineId)
  const sourceMap = new Map<string, Source>()
  pipelineDeals.forEach(d => { if (d.source) sourceMap.set(d.source.id, d.source) })
  return [...sourceMap.values()]
    .map(s => ({
      id: `${pipelineId}:${s.id}`,
      title: s.title,
      amount: pipelineDeals.filter(d => d.source?.id === s.id).reduce((sum, d) => sum + (d.amount ?? 0), 0),
      source: s as unknown as Record<string, unknown>,
    }))
    .sort((a, b) => b.amount - a.amount)
}

function rowsByCampaign(deals: Deal[], pipelineId: string): AggRow[] {
  const pipelineDeals = deals.filter(d => d.stage.pipeline.id === pipelineId)
  const campaignMap = new Map<string, Campaign>()
  pipelineDeals.forEach(d => { if (d.campaign) campaignMap.set(d.campaign.id, d.campaign) })
  return [...campaignMap.values()]
    .map(c => ({
      id: `${pipelineId}:${c.id}`,
      title: c.title,
      amount: pipelineDeals.filter(d => d.campaign?.id === c.id).reduce((s, d) => s + (d.amount ?? 0), 0),
      source: c as unknown as Record<string, unknown>,
    }))
    .sort((a, b) => b.amount - a.amount)
}

export default function App() {
  const months = lastTwelveMonths()

  const [deals, setDeals] = useState<Deal[]>([])
  useEffect(() => { fetchDeals().then(setDeals).catch(console.error) }, [])

  const pipelines = uniquePipelines(deals)
  const data = aggregate(deals, pipelines, months)

  const monthTotals = months.map((_, mi) =>
    pipelines.reduce((sum, _, pi) => sum + data[pi][mi], 0)
  )
  const maxTotal = Math.max(...monthTotals, 1)

  const pipelineTotals = pipelines.map(pipeline =>
    deals.filter(d => d.stage.pipeline.id === pipeline.id).reduce((s, d) => s + (d.amount ?? 0), 0)
  )

  const [modeIndex, setModeIndex] = useState(() => {
    const v = Number(localStorage.getItem('modeIndex'))
    return v >= 0 && v < ROW_MODES.length ? v : 0
  })
  const { fn: rowFn, label: modeLabel } = ROW_MODES[modeIndex]
  const rowsPerPipeline = pipelines.map(p => rowFn(deals, p.id))
  const rowOffsets = pipelines.map((_, pi) =>
    rowsPerPipeline.slice(0, pi).reduce((sum, rows) => sum + rows.length, 0)
  )

  const [paletteL, setPaletteL] = useState(() => {
    const v = Number(localStorage.getItem('paletteL'))
    return v >= 0 && v <= 100 ? v : 75
  })
  const [paletteRotation, setPaletteRotation] = useState(() => Math.max(0, Number(localStorage.getItem('paletteRotation'))))
  const [autoReloadSeconds, setAutoReloadSeconds] = useState(() => {
    const v = Number(localStorage.getItem('autoReloadSeconds'))
    return v === 0 ? 0 : (v >= 60 ? v : 60)
  })

  useEffect(() => { localStorage.setItem('paletteL', String(paletteL)) }, [paletteL])
  useEffect(() => { localStorage.setItem('paletteRotation', String(paletteRotation)) }, [paletteRotation])
  useEffect(() => { localStorage.setItem('modeIndex', String(modeIndex)) }, [modeIndex])
  useEffect(() => { localStorage.setItem('autoReloadSeconds', String(autoReloadSeconds)) }, [autoReloadSeconds])

  const [isDark, setIsDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const { foregrounds } = generateForegroundSteps(paletteL, isDark ? 'black' : 'white', 7)
    foregrounds.forEach((color, i) => {
      document.documentElement.style.setProperty(`--layer-${i}`, color)
    })
  }, [paletteL, isDark])

  useEffect(() => {
    if (autoReloadSeconds <= 0) return
    const id = setTimeout(() => {
      localStorage.setItem('modeIndex', String((modeIndex + 1) % ROW_MODES.length))
      window.location.reload()
    }, autoReloadSeconds * 1000)
    return () => clearTimeout(id)
  }, [autoReloadSeconds, modeIndex])

  const palettes = useMemo(() => {
    if (pipelines.length === 0) return []
    try { return findPalettes(paletteL, pipelines.length) } catch { return findPalettes(75, pipelines.length) }
  }, [paletteL, pipelines.length])
  const palette = palettes[paletteRotation] ?? palettes[0] ?? []

  // single-element refs for panel headers, legend and palette popover
  const topHeaderDiv  = useRef<HTMLDivElement  | null>(null)
  const topHeaderSpan = useRef<HTMLSpanElement | null>(null)
  const legendDiv     = useRef<HTMLDivElement  | null>(null)
  const legendSpan    = useRef<HTMLSpanElement | null>(null)
  const dialogRef     = useRef<HTMLDialogElement | null>(null)
  const aggDialogRef  = useRef<HTMLDialogElement | null>(null)
  const botHeaderDiv  = useRef<HTMLDivElement  | null>(null)
  const botHeaderSpan = useRef<HTMLSpanElement | null>(null)

  // top panel
  const barChartRef  = useRef<HTMLDivElement | null>(null)
  const barDivs      = useRef<HTMLDivElement[]>([])
  const barSpans     = useRef<HTMLSpanElement[]>([])
  const barStackDivs = useRef<HTMLDivElement[]>([])
  const monthDivs  = useRef<HTMLDivElement[]>([])
  const monthSpans = useRef<HTMLSpanElement[]>([])
  const cellDivs   = useRef<HTMLDivElement[]>([])
  const cellSpans  = useRef<HTMLSpanElement[]>([])

  // bottom panel — pipeline names and aggregator labels are stable (3 columns always)
  const pipelineNameDivs  = useRef<HTMLDivElement[]>([])
  const pipelineNameSpans = useRef<HTMLSpanElement[]>([])
  const aggLabelDivs  = useRef<HTMLDivElement[]>([])
  const aggLabelSpans = useRef<HTMLSpanElement[]>([])

  // rows change per mode
  const rowDivs  = useRef<HTMLDivElement[]>([])
  const rowSpans = useRef<HTMLSpanElement[]>([])

  useMemo(() => {
    rowDivs.current = []
    rowSpans.current = []
  }, [modeIndex])

  useLayoutEffect(() => {
    const run = () => {
      const gap = Math.log(1 + Math.max(window.innerWidth, window.innerHeight))
      document.documentElement.style.setProperty('--gap', `${gap}px`)

      const allDivs: HTMLDivElement[] = [
        ...(topHeaderDiv.current  ? [topHeaderDiv.current]  : []),
        ...(legendDiv.current     ? [legendDiv.current]     : []),
        ...(botHeaderDiv.current  ? [botHeaderDiv.current]  : []),
        ...barDivs.current.filter((_, i) => monthTotals[i] > 0),
        ...monthDivs.current.filter(Boolean),
        ...cellDivs.current.filter(Boolean),
        ...pipelineNameDivs.current.filter(Boolean),
        ...aggLabelDivs.current.filter(Boolean),
        ...rowDivs.current.filter(Boolean),
      ]
      const allSpans: HTMLSpanElement[] = [
        ...(topHeaderSpan.current ? [topHeaderSpan.current] : []),
        ...(legendSpan.current    ? [legendSpan.current]    : []),
        ...(botHeaderSpan.current ? [botHeaderSpan.current] : []),
        ...barSpans.current.filter((_, i) => monthTotals[i] > 0),
        ...monthSpans.current.filter(Boolean),
        ...cellSpans.current.filter(Boolean),
        ...pipelineNameSpans.current.filter(Boolean),
        ...aggLabelSpans.current.filter(Boolean),
        ...rowSpans.current.filter(Boolean),
      ]

      // Reset font sizes
      allDivs.forEach(el => { el.style.fontSize = '' })
      allSpans.forEach(el => { el.style.fontSize = '' })

      // squeezeText fills the content area inside the padding — consistent across all divs
      if (allDivs.length && allDivs.length === allSpans.length) {
        squeezeText(allDivs, allSpans, { axis: 'width' })
      }

      // Set bar-stack heights proportional to data, relative to the tallest stack
      const chartEl = barChartRef.current
      const labelEl = barDivs.current.find((_, i) => monthTotals[i] > 0) ?? null
      if (chartEl && labelEl) {
        const chartHeight = chartEl.getBoundingClientRect().height
        const labelHeight = labelEl.getBoundingClientRect().height
        const maxStackHeight = Math.max(0, chartHeight - labelHeight - gap)
        barStackDivs.current.forEach((stackEl, mi) => {
          if (stackEl) stackEl.style.height = monthTotals[mi] > 0
            ? `${(monthTotals[mi] / maxTotal) * maxStackHeight}px`
            : '0px'
        })
      }
    }

    run()
    window.addEventListener('resize', run)
    return () => window.removeEventListener('resize', run)
  }, [modeIndex, deals])

  return (
    <>
      <div className="panel panel-top">
        <div ref={topHeaderDiv} className="panel-header">
          <span ref={topHeaderSpan} style={{}}>Vendas realizadas</span>
        </div>
        <div className="panel-top-body">
        <div className="bar-section">
          <div ref={legendDiv} className="panel-header" style={{ cursor: 'pointer' }} onClick={() => dialogRef.current?.showModal()}>
            <span ref={legendSpan}>
              {pipelines.map((pipeline, pi) => (
                <span key={pipeline.id} style={{ color: palette[pi] }}>{pi === 0 ? '• ' : ' • '}{pipeline.title}</span>
              ))}
            </span>
          </div>
          <div ref={barChartRef} className="bar-chart">
          {monthTotals.map((total, mi) => (
            <div key={mi} className="bar-column" style={{ visibility: total > 0 ? undefined : 'hidden' }}>
              <div ref={el => { if (el) barDivs.current[mi] = el }} className="bar-label">
                <span ref={el => { if (el) barSpans.current[mi] = el }} style={{}}>
                  {brl.format(total)}
                </span>
              </div>
              <div ref={el => { if (el) barStackDivs.current[mi] = el }} className="bar-stack">
                {pipelines.map((_, pi) => data[pi][mi] > 0 && (
                  <div
                    key={pi}
                    className="bar-segment"
                    style={{ flex: data[pi][mi], backgroundColor: palette[pi] }}
                  />
                ))}
              </div>
            </div>
          ))}
          </div>
        </div>
        <div className="month-headers">
          {months.map(({ year, month }, mi) => (
            <div key={mi} ref={el => { if (el) monthDivs.current[mi] = el }}>
              <span ref={el => { if (el) monthSpans.current[mi] = el }} style={{}}>
                {formatMonthLabel(year, month)}
              </span>
            </div>
          ))}
        </div>
        <div className="data-table">
          {pipelines.map((_, pi) =>
            months.map((__, mi) => {
              const idx = pi * 12 + mi
              return (
                <div key={`${pi}-${mi}`} ref={el => { if (el) cellDivs.current[idx] = el }}>
                  <span ref={el => { if (el) cellSpans.current[idx] = el }} style={{ color: palette[pi] }}>
                    {brl.format(data[pi][mi])}
                  </span>
                </div>
              )
            })
          )}
        </div>
        </div>
      </div>

      <div className="panel pipeline-panel">
        <div ref={botHeaderDiv} className="panel-header">
          <span ref={botHeaderSpan} style={{}}>Vendas em andamento</span>
        </div>
        <div className="pipeline-cols">
          {pipelines.map((pipeline, pi) => {
            const rows = rowsPerPipeline[pi]
            const total = pipelineTotals[pi]
            const maxTitleLen = Math.max(modeLabel.length, ...rows.map(r => r.title.length))
            const maxValLen   = Math.max(brl.format(total).length, ...rows.map(r => brl.format(r.amount).length))
            return (
              <div key={pipeline.id} className="pipeline-col">
                <div ref={el => { if (el) pipelineNameDivs.current[pi] = el }} className="pipeline-name">
                  <span ref={el => { if (el) pipelineNameSpans.current[pi] = el }} style={{ color: palette[pi] }}>
                    {pipeline.title}
                  </span>
                </div>
                <div className="pipeline-body">
                  <div
                    ref={el => { if (el) aggLabelDivs.current[pi] = el }}
                    className="aggregator-label"
                    onClick={() => aggDialogRef.current?.showModal()}
                    style={{ cursor: 'pointer' }}
                  >
                    <span ref={el => { if (el) aggLabelSpans.current[pi] = el }} style={{ fontWeight: 'bold' }}>
                      {`${modeLabel.padStart(maxTitleLen)} ${brl.format(total).padEnd(maxValLen)}`}
                    </span>
                  </div>
                  <div className="stage-scroll">
                    {rows.map((row, ri) => {
                      const idx = rowOffsets[pi] + ri
                      const text = `${row.title.padStart(maxTitleLen)} ${brl.format(row.amount).padEnd(maxValLen)}`
                      return (
                        <div key={row.id} ref={el => { if (el) rowDivs.current[idx] = el }} className="stage-row" title={formatTooltip(row.source)}>
                          <span ref={el => { if (el) rowSpans.current[idx] = el }} style={{}}>
                            {text}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <dialog
        ref={aggDialogRef}
        className="agg-selector"
        onClick={e => { if (e.target === e.currentTarget) e.currentTarget.close() }}
      >
        <select
          value={modeIndex}
          onChange={e => { setModeIndex(Number(e.target.value)); aggDialogRef.current?.close() }}
        >
          {ROW_MODES.map((mode, i) => (
            <option key={i} value={i}>{mode.label}</option>
          ))}
        </select>
        <label>
          Atualização automática (s)
          <input
            type="number"
            min="0"
            value={autoReloadSeconds}
            onChange={e => setAutoReloadSeconds(Number(e.target.value))}
            onBlur={e => { const v = Number(e.target.value); if (v > 0 && v < 60) setAutoReloadSeconds(60) }}
            onKeyDown={e => { if (!['ArrowUp', 'ArrowDown', 'Tab'].includes(e.key)) e.preventDefault() }}
          />
        </label>
      </dialog>

      <dialog
        ref={dialogRef}
        className="palette-popover"
        onClick={e => { if (e.target === e.currentTarget) e.currentTarget.close() }}
      >
        <label>
          Luminosidade
          <input type="range" min="0" max="100" step="1" value={paletteL}
            onChange={e => {
              const newL = Number(e.target.value)
              try {
                const newLen = findPalettes(newL, pipelines.length).length
                const frac = palettes.length > 1 ? paletteRotation / (palettes.length - 1) : 0
                setPaletteRotation(Math.min(Math.round(frac * (newLen - 1)), newLen - 1))
              } catch { setPaletteRotation(0) }
              setPaletteL(newL)
            }} />
        </label>
        <label>
          Variação
          <input type="range" min="0" max={palettes.length - 1} step="1" value={paletteRotation}
            onChange={e => setPaletteRotation(Number(e.target.value))} />
        </label>
      </dialog>
    </>
  )
}
