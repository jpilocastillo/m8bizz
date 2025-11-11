"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { MissingMoneyData, CostCenter } from '@/app/tools/missing-money/page'

interface MissingMoneyPieChartProps {
  data: MissingMoneyData
}

export function MissingMoneyPieChart({ data }: MissingMoneyPieChartProps) {
  // Calculate the differences for the pie chart
  const pieData = data.costCenters.map(center => {
    const difference = center.proposed - center.current
    return {
      name: center.name,
      value: Math.abs(difference),
      difference: difference,
      color: center.color
    }
  }).filter(item => item.value > 0) // Only show positive values

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-800 p-3 border border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-white">{data.name}</p>
          <p className="text-sm text-gray-300">
            {data.difference >= 0 ? 'Opportunity Cost:' : 'Savings:'} {formatCurrency(data.difference)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>
                {value}: {formatCurrency(entry.payload.difference)}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}




