"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MissingMoneyData, CostCenter } from '@/app/tools/missing-money/page'
import { Calculator, Save, Plus, Trash2, Edit2 } from 'lucide-react'

interface MissingMoneyDataEntryProps {
  data: MissingMoneyData
  onUpdate: (costCenters: CostCenter[]) => void
  onSubmit: () => void
}

// Color palette for cost centers
const costCenterColors = [
  "#16a34a", "#ea580c", "#dc2626", "#9333ea", "#a3a3a3", 
  "#f97316", "#6b7280", "#3b82f6", "#8b5cf6", "#ec4899",
  "#14b8a6", "#f59e0b", "#ef4444", "#6366f1", "#10b981"
]

export function MissingMoneyDataEntry({ data, onUpdate, onSubmit }: MissingMoneyDataEntryProps) {
  const [costCenters, setCostCenters] = useState<CostCenter[]>(data.costCenters)
  const [editingNameId, setEditingNameId] = useState<string | null>(null)
  const [editingNameValue, setEditingNameValue] = useState<string>("")

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

  const handleNameChange = (id: string, value: string) => {
    setCostCenters(prev => 
      prev.map(center => 
        center.id === id 
          ? { ...center, name: value }
          : center
      )
    )
  }

  const handleStartEditName = (id: string, currentName: string) => {
    setEditingNameId(id)
    setEditingNameValue(currentName)
  }

  const handleSaveName = (id: string) => {
    handleNameChange(id, editingNameValue)
    setEditingNameId(null)
    setEditingNameValue("")
  }

  const handleCancelEditName = () => {
    setEditingNameId(null)
    setEditingNameValue("")
  }

  const handleAddCostCenter = () => {
    const newId = `cost-center-${Date.now()}`
    const colorIndex = costCenters.length % costCenterColors.length
    const newCostCenter: CostCenter = {
      id: newId,
      name: "New Cost Center",
      current: 0,
      proposed: 0,
      color: costCenterColors[colorIndex]
    }
    setCostCenters(prev => [...prev, newCostCenter])
    setEditingNameId(newId)
    setEditingNameValue("New Cost Center")
  }

  const handleRemoveCostCenter = (id: string) => {
    setCostCenters(prev => prev.filter(center => center.id !== id))
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
      <Card className="bg-black border-m8bs-border shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Calculator className="h-5 w-5 text-m8bs-blue" />
            Missing Money Data Entry
          </CardTitle>
          <CardDescription className="text-m8bs-muted">
            Enter Current And Proposed Values For Each Cost Center To Calculate Opportunity Costs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-m8bs-muted">
              {costCenters.length} cost center{costCenters.length !== 1 ? 's' : ''}
            </div>
            <Button 
              onClick={handleAddCostCenter}
              className="flex items-center gap-2 bg-m8bs-blue hover:bg-m8bs-blue-dark text-white transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Cost Center
            </Button>
          </div>

          <div className="grid gap-4">
            {costCenters.length === 0 ? (
              <Card className="p-8 bg-black-alt border-m8bs-border border-dashed">
                <div className="text-center text-m8bs-muted">
                  <p className="mb-4">No Cost Centers Added Yet.</p>
                  <Button 
                    onClick={handleAddCostCenter}
                    variant="outline"
                    className="bg-black border-m8bs-border text-white hover:bg-black-alt transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Cost Center
                  </Button>
                </div>
              </Card>
            ) : (
              costCenters.map((center) => {
                const difference = calculateDifference(center)
                const isEditingName = editingNameId === center.id
                
                return (
                  <Card key={center.id} className="p-4 bg-black-alt border-m8bs-border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: center.color }}
                        />
                        {isEditingName ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={editingNameValue}
                              onChange={(e) => setEditingNameValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveName(center.id)
                                } else if (e.key === 'Escape') {
                                  handleCancelEditName()
                                }
                              }}
                              className="bg-black-alt border-m8bs-border text-white focus:border-m8bs-blue focus:ring-m8bs-blue/20 transition-colors"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSaveName(center.id)}
                              className="bg-m8bs-blue hover:bg-m8bs-blue-dark text-white transition-colors"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEditName}
                              className="bg-black border-m8bs-border text-white hover:bg-black-alt transition-colors"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-1">
                            <h3 className="font-semibold text-lg text-white">{center.name}</h3>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStartEditName(center.id, center.name)}
                              className="text-m8bs-muted hover:text-white p-1 h-6 w-6"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveCostCenter(center.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 h-6 w-6"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${center.id}-current`} className="text-white font-medium">Current Numbers</Label>
                      <Input
                        id={`${center.id}-current`}
                        type="number"
                        value={center.current}
                        onChange={(e) => handleInputChange(center.id, 'current', e.target.value)}
                        className="text-right bg-black-alt border-m8bs-border text-white focus:border-m8bs-blue focus:ring-m8bs-blue/20 transition-colors"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`${center.id}-proposed`} className="text-white font-medium">Proposed Numbers</Label>
                      <Input
                        id={`${center.id}-proposed`}
                        type="number"
                        value={center.proposed}
                        onChange={(e) => handleInputChange(center.id, 'proposed', e.target.value)}
                        className="text-right bg-black-alt border-m8bs-border text-white focus:border-m8bs-blue focus:ring-m8bs-blue/20 transition-colors"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-white font-medium">1 Year Difference</Label>
                      <div className={`p-2 rounded-md text-right font-semibold ${
                        difference < 0 
                          ? 'bg-green-900/50 text-green-400 border border-green-700' 
                          : 'bg-red-900/50 text-red-400 border border-red-700'
                      }`}>
                        {difference < 0 ? '+' : ''}{formatCurrency(Math.abs(difference))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div className="text-right">
                      <span className="text-m8bs-muted">5 Year: </span>
                      <span className={`font-semibold ${
                        difference * 5 < 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {difference * 5 < 0 ? '+' : ''}{formatCurrency(Math.abs(difference * 5))}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-m8bs-muted">10 Year: </span>
                      <span className={`font-semibold ${
                        difference * 10 < 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {difference * 10 < 0 ? '+' : ''}{formatCurrency(Math.abs(difference * 10))}
                      </span>
                    </div>
                  </div>
                </Card>
              )
            })
            )}
          </div>

          {/* Summary Card */}
          <Card className="bg-black-alt border-m8bs-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{formatCurrency(currentTotal)}</div>
                  <div className="text-sm text-m8bs-muted">Current Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{formatCurrency(proposedTotal)}</div>
                  <div className="text-sm text-m8bs-muted">Proposed Total</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    totalDifference >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(totalDifference)}
                  </div>
                  <div className="text-sm text-m8bs-muted">1 Year Difference</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    totalDifference * 5 >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(totalDifference * 5)}
                  </div>
                  <div className="text-sm text-m8bs-muted">5 Year Difference</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <CardFooter className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setCostCenters(data.costCenters)} className="bg-black border-m8bs-border text-white hover:bg-black-alt transition-colors">
              Reset
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2 bg-m8bs-blue hover:bg-m8bs-blue-dark text-white transition-colors">
              <Save className="h-4 w-4" />
              Save & View Report
            </Button>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  )
}




