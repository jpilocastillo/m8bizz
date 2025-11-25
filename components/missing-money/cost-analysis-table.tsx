"use client"

import { MissingMoneyData, CostCenter } from '@/app/tools/missing-money/page'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface CostAnalysisTableProps {
  data: MissingMoneyData
}

export function CostAnalysisTable({ data }: CostAnalysisTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const calculateDifference = (center: CostCenter) => {
    return center.proposed - center.current
  }

  const calculatePercentageChange = (center: CostCenter) => {
    if (center.current === 0) return center.proposed > 0 ? 100 : (center.proposed < 0 ? -100 : 0)
    return ((center.proposed - center.current) / Math.abs(center.current)) * 100
  }

  const calculateTotal = (field: 'current' | 'proposed') => {
    return data.costCenters.reduce((sum, center) => sum + center[field], 0)
  }

  const calculateTotalDifference = () => {
    return data.costCenters.reduce((sum, center) => sum + calculateDifference(center), 0)
  }

  const calculateTotalPercentageChange = () => {
    const currentTotal = calculateTotal('current')
    const proposedTotal = calculateTotal('proposed')
    if (currentTotal === 0) return proposedTotal > 0 ? 100 : (proposedTotal < 0 ? -100 : 0)
    return ((proposedTotal - currentTotal) / Math.abs(currentTotal)) * 100
  }

  const currentTotal = calculateTotal('current')
  const proposedTotal = calculateTotal('proposed')
  const totalDifference = calculateTotalDifference()
  const totalPercentageChange = calculateTotalPercentageChange()

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px] font-semibold text-gray-300">Cost Center</TableHead>
            <TableHead className="text-right font-semibold text-gray-300">Current Numbers</TableHead>
            <TableHead className="text-right font-semibold text-gray-300">Proposed Numbers</TableHead>
            <TableHead className="text-right font-semibold text-gray-300">% Change</TableHead>
            <TableHead className="text-right font-semibold text-gray-300">1 Year Difference</TableHead>
            <TableHead className="text-right font-semibold text-gray-300">5 Year Difference</TableHead>
            <TableHead className="text-right font-semibold text-gray-300">10 Year Difference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.costCenters.map((center) => {
            const difference = calculateDifference(center)
            const percentageChange = calculatePercentageChange(center)
            const fiveYearDiff = difference * 5
            const tenYearDiff = difference * 10
            
            return (
              <TableRow key={center.id} className="border-gray-700">
                <TableCell className="font-medium text-gray-300">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: center.color }}
                    />
                    {center.name}
                  </div>
                </TableCell>
                <TableCell className="text-right text-gray-300">
                  {formatCurrency(center.current)}
                </TableCell>
                <TableCell className="text-right text-gray-300">
                  {formatCurrency(center.proposed)}
                </TableCell>
                <TableCell className={`text-right font-semibold ${
                  percentageChange >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  <div className="flex items-center justify-end gap-1">
                    {percentageChange >= 0 ? '↑' : '↓'}
                    {Math.abs(percentageChange).toFixed(1)}%
                  </div>
                </TableCell>
                <TableCell className={`text-right font-semibold ${
                  difference < 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {difference < 0 ? '+' : ''}{formatCurrency(Math.abs(difference))}
                </TableCell>
                <TableCell className={`text-right font-semibold ${
                  fiveYearDiff < 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {fiveYearDiff < 0 ? '+' : ''}{formatCurrency(Math.abs(fiveYearDiff))}
                </TableCell>
                <TableCell className={`text-right font-semibold ${
                  tenYearDiff < 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {tenYearDiff < 0 ? '+' : ''}{formatCurrency(Math.abs(tenYearDiff))}
                </TableCell>
              </TableRow>
            )
          })}
          <TableRow className="border-t-2 border-gray-700 bg-gray-800">
            <TableCell className="font-bold text-lg text-white">Total</TableCell>
            <TableCell className="text-right font-bold text-lg text-white">
              {formatCurrency(currentTotal)}
            </TableCell>
            <TableCell className="text-right font-bold text-lg text-white">
              {formatCurrency(proposedTotal)}
            </TableCell>
            <TableCell className={`text-right font-bold text-lg ${
              totalPercentageChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              <div className="flex items-center justify-end gap-1">
                {totalPercentageChange >= 0 ? '↑' : '↓'}
                {Math.abs(totalPercentageChange).toFixed(1)}%
              </div>
            </TableCell>
            <TableCell className={`text-right font-bold text-lg ${
              totalDifference < 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {totalDifference < 0 ? '+' : ''}{formatCurrency(Math.abs(totalDifference))}
            </TableCell>
            <TableCell className={`text-right font-bold text-lg ${
              totalDifference * 5 < 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {totalDifference * 5 < 0 ? '+' : ''}{formatCurrency(Math.abs(totalDifference * 5))}
            </TableCell>
            <TableCell className={`text-right font-bold text-lg ${
              totalDifference * 10 < 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {totalDifference * 10 < 0 ? '+' : ''}{formatCurrency(Math.abs(totalDifference * 10))}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}




