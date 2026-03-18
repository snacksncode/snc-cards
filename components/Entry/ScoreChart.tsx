import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts"

interface Props {
  data: { i: number; score: number }[]
  stroke: string
}

export default function ScoreChart({ data, stroke }: Props) {
  const gradientId = `scoreGrad-${stroke.replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="i" hide />
        <YAxis domain={[0, 100]} hide />
        <Area
          type="monotone"
          dataKey="score"
          stroke={stroke}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
