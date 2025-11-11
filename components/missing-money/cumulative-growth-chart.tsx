"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { MissingMoneyData } from '@/app/tools/missing-money/page'

interface CumulativeGrowthChartProps {
  data: MissingMoneyData
}

export function CumulativeGrowthChart({ data }: CumulativeGrowthChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Generate data points for each year from 1 to 10
  const chartData = Array.from({ length: 10 }, (_, i) => {
    const year = i + 1
    const cumulativeValue = data.oneYearTotal * year
    return {
      year: `Year ${year}`,
      value: cumulativeValue,
      cumulative: cumulativeValue
    }
  })

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 border border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-white mb-2">{label}</p>
          <p className="text-sm text-green-400">
            Cumulative Missing Money: {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="year" 
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatCurrency}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#16a34a" 
            strokeWidth={3}
            dot={{ fill: '#16a34a', r: 4 }}
            activeDot={{ r: 6 }}
            name="Cumulative Missing Money"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

