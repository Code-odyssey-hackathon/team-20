import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from "recharts";

export function MasteryChart({ data }: { data: { topic: string; score: number }[] }) {
  if (!data.length) {
    return <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Solve a few challenges to populate your mastery graph.</div>;
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="78%">
          <PolarGrid stroke="oklch(1 0 0 / 0.08)" />
          <PolarAngleAxis dataKey="topic" tick={{ fill: "oklch(0.72 0.02 255)", fontSize: 11 }} />
          <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
          <Radar dataKey="score" stroke="oklch(0.78 0.16 75)" fill="oklch(0.78 0.16 75)" fillOpacity={0.35} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
