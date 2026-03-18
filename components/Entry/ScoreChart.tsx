import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface Props {
  data: { i: number; score: number }[]
  stroke: string
}

export default function ScoreChart({ data, stroke }: Props) {
  return (
    <ResponsiveContainer width="100%" height={100}>
      <LineChart data={data}>
        <XAxis dataKey="i" hide />
        <YAxis domain={[0, 100]} hide />
        <Tooltip
          formatter={(v) => `${v}%`}
          contentStyle={{ background: "var(--color-bg-500)", border: "1px solid var(--color-bg-600)", borderRadius: "6px", fontSize: "0.75rem" }}
          labelFormatter={(l) => `Attempt ${l}`}
        />
        <Line type="monotone" dataKey="score" stroke={stroke} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
