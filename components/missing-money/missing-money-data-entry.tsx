"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MissingMoneyData, CostCenter } from '@/app/tools/missing-money/page'
import { Calculator, Save } from 'lucide-react'

interface MissingMoneyDataEntryProps {
  data: MissingMoneyData
  onUpdate: (costCenters: CostCenter[]) => void
  onSubmit: () => void
}

export function MissingMoneyDataEntry({ data, onUpdate, onSubmit }: MissingMoneyDataEntryProps) {
  const [costCenters, setCostCenters] = useState<CostCenter[]>(data.costCenters)

  const handleInputChange = (id: string, field: 'current' | 'proposed', value: string) => {
    const numericValue = parseFloat(value) || 0
    setCostCenters(prev => 
      prev.map(center => 
        center.id === id 
          ? { ...center, [field]: numericValue }
          : center
      )
    )
  }

  const handleSave = () => {
    onUpdate(costCenters)
    onSubmit()
  }

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

  const calculateTotal = (field: 'current' | 'proposed') => {
    return costCenters.reduce((sum, center) => sum + center[field], 0)
  }

  const currentTotal = calculateTotal('current')
  const proposedTotal = calculateTotal('proposed')
  const totalDifference = proposedTotal - currentTotal

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calculator className="h-5 w-5" />
            Missing Money Data Entry
          </CardTitle>
          <CardDescription className="text-gray-400">
            Enter current and proposed values for each cost center to calculate opportunity costs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {costCenters.map((center) => {
              const difference = calculateDifference(center)
              
              return (
                <Card key={center.id} className="p-4 bg-gray-800 border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: center.color }}
                    />
                    <h3 className="font-semibold text-lg text-white">{center.name}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${center.id}-current`} className="text-gray-300">Current Numbers</Label>
                      <Input
                        id={`${center.id}-current`}
                        type="number"
                        value={center.current}
                        onChange={(e) => handleInputChange(center.id, 'current', e.target.value)}
                        className="text-right bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`${center.id}-proposed`} className="text-gray-300">Proposed Numbers</Label>
                      <Input
                        id={`${center.id}-proposed`}
                        type="number"
                        value={center.proposed}
                        onChange={(e) => handleInputChange(center.id, 'proposed', e.target.value)}
                        className="text-right bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-gray-300">1 Year Difference</Label>
                      <div className={`p-2 rounded-md text-right font-semibold ${
                        difference >= 0 
                          ? 'bg-green-900/50 text-green-400 border border-green-700' 
                          : 'bg-red-900/50 text-red-400 border border-red-700'
                      }`}>
                        {formatCurrency(difference)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div className="text-right">
                      <span className="text-gray-400">5 Year: </span>
                      <span className={`font-semibold ${
                        difference * 5 >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(difference * 5)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400">10 Year: </span>
                      <span className={`font-semibold ${
                        difference * 10 >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(difference * 10)}
                      </span>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Summary Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{formatCurrency(currentTotal)}</div>
                  <div className="text-sm text-gray-400">Current Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{formatCurrency(proposedTotal)}</div>
                  <div className="text-sm text-gray-400">Proposed Total</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    totalDifference >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(totalDifference)}
                  </div>
                  <div className="text-sm text-gray-400">1 Year Difference</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    totalDifference * 5 >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(totalDifference * 5)}
                  </div>
                  <div className="text-sm text-gray-400">5 Year Difference</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCostCenters(data.costCenters)} className="border-gray-700 text-gray-300 hover:bg-gray-800">
              Reset
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
              <Save className="h-4 w-4" />
              Save & View Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




