"use client"

import { useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"

const margin = {
  top: 30,
  right: 0,
  left: -17,
  bottom: 20,
};
type ChartBarProps = {
  data: { "data-key": string; "data-value": number }[];
};

export function ChartBar({ data }: ChartBarProps) {
  const [isTooltipActive, setIsTooltipActive] = useState(true)

  return (
    <div 
      className="mt-1 [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none [&_*]:outline-none" 
      style={{ height: '256px' }}
      onMouseLeave={() => setIsTooltipActive(false)}
      onMouseEnter={() => setIsTooltipActive(true)} 
    >
      <BarChart accessibilityLayer data={data} width="101%" height="100%" margin={margin}>
        <CartesianGrid vertical={false} horizontal={false} />
        <XAxis
          dataKey="data-key"
          tickMargin={5}
          axisLine={{ stroke: '#6D6B6B' }}
          tickLine={{ stroke: '#6D6B6B' }}
          tick={{ fill: '#6D6B6B', fontSize: 14 }}
          angle={-45}
          textAnchor="end"
          height={49}
          interval={0}
        />
        <YAxis
          axisLine={{ stroke: '#6D6B6B' }}
          tickLine={{ stroke: '#6D6B6B' }}
          tick={{ fill: '#3D3D3D', fontSize: 12 }}
          tickMargin={3}
          allowDecimals={false}
          domain={[0, 'auto']}
          label={{ position: 'insideTopLeft', value: 'Dots', angle: -90, dy: 82, dx: 13, fill: '#3D3D3D', fontSize: 14 }}
        />
        <Tooltip
          cursor={{ fill: 'rgba(240, 100, 45, 0.05)' }}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '8px'
          }}
          formatter={(value, _name, props) => {
            const firstName = (props.payload as { "data-key"?: string } | undefined)?.['data-key'] ?? '';
            return [`${value ?? 0} Dots`, firstName];
          }}
          labelFormatter={() => ''}
          wrapperStyle={{ opacity: isTooltipActive ? 1 : 0 }}
        />
        <Bar dataKey="data-value" fill="#F0642D" radius={[4, 4, 0, 0]} barSize={103} />
      </BarChart>
    </div>
  )
} 
