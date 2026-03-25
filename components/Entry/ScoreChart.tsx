import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts"

interface Props {
  data: { i: number; score: number }[]
  stroke: string
}

function ScoreTooltip({ active, payload }: { active?: boolean; payload?: { value: number }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-500 border border-bg-600 rounded px-2 py-1 text-xs font-semibold text-text">
      {payload[0].value.toFixed(1)}%
    </div>
  )
}

export default function ScoreChart({ data, stroke }: Props) {
  const gradientId = `scoreGrad-${stroke.replace(/[^a-zA-Z0-9]/g, '')}`
  const best = Math.max(...data.map((d) => d.score))
  const latest = data[data.length - 1]?.score ?? 0

  return (
    <div>
      <div className="flex gap-4 text-[0.65rem] mb-2">
        <span className="text-text-muted">
          Runs:{" "}
          <span className="font-semibold tabular-nums" style={{ color: stroke }}>
            {data.length}
          </span>
        </span>
        <span className="text-text-muted">
          Best:{" "}
          <span className="font-semibold tabular-nums" style={{ color: stroke }}>
            {best.toFixed(1)}%
          </span>
        </span>
        <span className="text-text-muted">
          Latest:{" "}
          <span className="font-semibold tabular-nums" style={{ color: stroke }}>
            {latest.toFixed(1)}%
          </span>
        </span>
      </div>
      <div role="img" aria-label="Score history chart">
      <ResponsiveContainer width="100%" height={64}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="i" hide />
          <YAxis domain={[0, 100]} hide />
          <Tooltip content={<ScoreTooltip />} cursor={{ stroke: stroke, strokeWidth: 1, strokeDasharray: "3 3", strokeOpacity: 0.4 }} />
          <ReferenceLine y={80} stroke={stroke} strokeOpacity={0.2} strokeDasharray="4 4" />
          <Area
            type="monotone"
            dataKey="score"
            stroke={stroke}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={{ fill: stroke, strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: stroke, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </div>
  )
}
