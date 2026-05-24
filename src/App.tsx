import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { squeezeText } from 'psychic-potato'
import { findPalettes } from 'miniature-waffle'
import { mockDeals } from './mocks'
import type { Deal, Pipeline, PipelineStage, User } from './types'

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
    .sort((a, b) => a.full_name.localeCompare(b.full_name))
    .map(owner => ({
      id: `${pipelineId}:${owner.id}`,
      title: owner.full_name,
      amount: pipelineDeals.filter(d => d.owner?.id === owner.id).reduce((s, d) => s + (d.amount ?? 0), 0),
      source: owner as unknown as Record<string, unknown>,
    }))
}

const ROW_MODES = [
  { fn: rowsByStage,  label: 'Estágios'      },
  { fn: rowsByOwner,  label: 'Responsáveis'  },
]

export default function App() {
  const months = lastTwelveMonths()
  const pipelines = uniquePipelines(mockDeals)
  const data = aggregate(mockDeals, pipelines, months)

  const monthTotals = months.map((_, mi) =>
    pipelines.reduce((sum, _, pi) => sum + data[pi][mi], 0)
  )
  const maxTotal = Math.max(...monthTotals, 1)

  const pipelineTotals = pipelines.map(pipeline =>
    mockDeals.filter(d => d.stage.pipeline.id === pipeline.id).reduce((s, d) => s + (d.amount ?? 0), 0)
  )

  const [modeIndex, setModeIndex] = useState(0)
  const { fn: rowFn, label: modeLabel } = ROW_MODES[modeIndex]
  const rowsPerPipeline = pipelines.map(p => rowFn(mockDeals, p.id))
  const rowOffsets = pipelines.map((_, pi) =>
    rowsPerPipeline.slice(0, pi).reduce((sum, rows) => sum + rows.length, 0)
  )

  const paletteL = 75
  const paletteRotation = 0
  const palette = findPalettes(paletteL, pipelines.length)[paletteRotation]

  // single-element refs for panel headers
  const topHeaderDiv  = useRef<HTMLDivElement  | null>(null)
  const topHeaderSpan = useRef<HTMLSpanElement | null>(null)
  const botHeaderDiv  = useRef<HTMLDivElement  | null>(null)
  const botHeaderSpan = useRef<HTMLSpanElement | null>(null)

  // top panel
  const barDivs   = useRef<HTMLDivElement[]>([])
  const barSpans  = useRef<HTMLSpanElement[]>([])
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
    const squeeze = () => {
      const allDivs: HTMLDivElement[] = [
        ...(topHeaderDiv.current  ? [topHeaderDiv.current]  : []),
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
        ...(botHeaderSpan.current ? [botHeaderSpan.current] : []),
        ...barSpans.current.filter((_, i) => monthTotals[i] > 0),
        ...monthSpans.current.filter(Boolean),
        ...cellSpans.current.filter(Boolean),
        ...pipelineNameSpans.current.filter(Boolean),
        ...aggLabelSpans.current.filter(Boolean),
        ...rowSpans.current.filter(Boolean),
      ]
      if (allDivs.length && allDivs.length === allSpans.length) {
        allDivs.forEach(el => { el.style.fontSize = '' })
        allSpans.forEach(el => { el.style.fontSize = '' })
        squeezeText(allDivs, allSpans, { axis: 'width' })
      }
    }

    squeeze()
    window.addEventListener('resize', squeeze)
    return () => window.removeEventListener('resize', squeeze)
  }, [modeIndex])

  return (
    <>
      <div className="panel panel-top">
        <div ref={topHeaderDiv} className="panel-header">
          <span ref={topHeaderSpan} style={{ color: 'white' }}>Vendas realizadas</span>
        </div>
        <div className="bar-chart">
          {monthTotals.map((total, mi) => {
            const pct = (total / maxTotal) * 100
            return (
              <div key={mi} className="bar-column" style={{ height: `${pct}%` }}>
                <div ref={el => { if (el) barDivs.current[mi] = el }} className="bar-label">
                  <span ref={el => { if (el) barSpans.current[mi] = el }} style={{ color: 'white' }}>
                    {brl.format(total)}
                  </span>
                </div>
                <div className="bar-stack">
                  {pipelines.map((_, pi) => (
                    <div
                      key={pi}
                      className="bar-segment"
                      style={{ flex: data[pi][mi], backgroundColor: palette[pi] }}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        <div className="month-headers">
          {months.map(({ year, month }, mi) => (
            <div key={mi} ref={el => { if (el) monthDivs.current[mi] = el }}>
              <span ref={el => { if (el) monthSpans.current[mi] = el }} style={{ color: 'white' }}>
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

      <div className="panel pipeline-panel">
        <div ref={botHeaderDiv} className="panel-header">
          <span ref={botHeaderSpan} style={{ color: 'white' }}>Vendas em andamento</span>
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
                <div
                  ref={el => { if (el) aggLabelDivs.current[pi] = el }}
                  className="aggregator-label"
                  onClick={() => setModeIndex(i => (i + 1) % ROW_MODES.length)}
                  style={{ cursor: 'pointer' }}
                >
                  <span ref={el => { if (el) aggLabelSpans.current[pi] = el }} style={{ color: 'white', fontWeight: 'bold' }}>
                    {`${modeLabel.padStart(maxTitleLen)} ${brl.format(total).padEnd(maxValLen)}`}
                  </span>
                </div>
                <div className="stage-scroll">
                  {rows.map((row, ri) => {
                    const idx = rowOffsets[pi] + ri
                    const text = `${row.title.padStart(maxTitleLen)} ${brl.format(row.amount).padEnd(maxValLen)}`
                    return (
                      <div key={row.id} ref={el => { if (el) rowDivs.current[idx] = el }} className="stage-row" title={formatTooltip(row.source)}>
                        <span ref={el => { if (el) rowSpans.current[idx] = el }} style={{ color: 'white' }}>
                          {text}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
