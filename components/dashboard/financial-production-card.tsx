import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign } from "lucide-react"

interface FinancialProductionCardProps {
  aum?: number
  financialPlanning?: number
  annuityPremium?: number
  lifeInsurancePremium?: number
  className?: string
}

export function FinancialProductionCard({
  aum = 0,
  financialPlanning = 0,
  annuityPremium = 0,
  lifeInsurancePremium = 0,
  className = "",
}: FinancialProductionCardProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Calculate total premium
  const totalPremium = annuityPremium + lifeInsurancePremium

  return (
    <Card
      className={`bg-gradient-to-b from-m8bs-card to-m8bs-card-alt border border-m8bs-border rounded-xl shadow-xl ${className}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-400" />
          Financial Production
        </CardTitle>
        <CardDescription>Premium and asset details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-m8bs-muted mb-1">Annuity Premium</h3>
              <p className="text-2xl font-bold text-white">{formatCurrency(annuityPremium)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-m8bs-muted mb-1">Life Insurance Premium</h3>
              <p className="text-2xl font-bold text-white">{formatCurrency(lifeInsurancePremium)}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-m8bs-muted mb-1">Assets Under Management</h3>
              <p className="text-2xl font-bold text-white">{formatCurrency(aum)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-m8bs-muted mb-1">Financial Planning Fees</h3>
              <p className="text-2xl font-bold text-white">{formatCurrency(financialPlanning)}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-m8bs-border">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-m8bs-muted">Total Premium</h3>
            <p className="text-xl font-bold text-white">{formatCurrency(totalPremium)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
