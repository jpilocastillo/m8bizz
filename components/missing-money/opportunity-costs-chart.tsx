"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'
import { MissingMoneyData, CostCenter } from '@/app/tools/missing-money/page'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface OpportunityCostsChartProps {
  data: MissingMoneyData
}

export function OpportunityCostsChart({ data }: OpportunityCostsChartProps) {
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Summary view data
  const summaryChartData = [
    {
      period: '1 Year',
      value: data.oneYearTotal,
      color: '#16a34a'
    },
    {
      period: '5 Years',
      value: data.fiveYearTotal,
      color: '#3b82f6'
    },
    {
      period: '10 Years',
      value: data.tenYearTotal,
      color: '#9333ea'
    }
  ]

  // Detailed view data - showing each cost center
  const detailedChartData = data.costCenters.map(center => {
    const difference = center.proposed - center.current
    return {
      name: center.name,
      '1 Year': difference,
      '5 Years': difference * 5,
      '10 Years': difference * 10,
      color: center.color
    }
  }).filter(item => Math.abs(item['1 Year']) > 0)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 border border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (viewMode === 'summary') {
    return (
      <div className="w-full">
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('detailed')}
          >
            Show Detailed View
          </Button>
        </div>
        <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={summaryChartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
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
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
              >
                {summaryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode('summary')}
        >
          Show Summary View
        </Button>
      </div>
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={detailedChartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 10 }}
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
            <Bar dataKey="1 Year" fill="#16a34a" radius={[4, 4, 0, 0]} />
            <Bar dataKey="5 Years" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="10 Years" fill="#9333ea" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}




