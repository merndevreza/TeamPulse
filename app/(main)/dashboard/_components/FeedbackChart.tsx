"use client"

import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

type FeedbackChartProps = {
   thumbsUp: number;
   loop: number;
   ok: number;
}

export function FeedbackChart({ thumbsUp, loop, ok }: FeedbackChartProps) {
   const chartData = [
      { name: "thumbsUp", value: thumbsUp, fill: "#F6C2C5" },
      { name: "loop", value: loop, fill: "#F0642D" },
      { name: "ok", value: ok, fill: "#8A8483" },
   ]

   return (
      <ResponsiveContainer width={48} height={48}>
         <PieChart>
            <Pie
               data={chartData}
               dataKey="value"
               nameKey="name"
               innerRadius={14}
               outerRadius={22}
               cx="50%"
               cy="50%"
            />
            <Tooltip 
               position={{ x: 48, y: 0 }}
               wrapperStyle={{ zIndex: 1000 }}
               contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  textTransform: 'capitalize',
               }}
               formatter={(value) => `${value ?? 0}%`}
            />
         </PieChart>
      </ResponsiveContainer>
   )
}
