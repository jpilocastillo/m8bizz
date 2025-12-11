import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, FileText, Shield, Briefcase, Coins, TrendingUp } from "lucide-react"

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

  // Calculate total financial production
  const totalFinancialProduction = annuityPremium + lifeInsurancePremium + aum + financialPlanning;

  // Calculate percentages for the progress bars
  const annuityPercentage = totalFinancialProduction > 0 ? (annuityPremium / totalFinancialProduction) * 100 : 0
  const lifeInsurancePercentage = totalFinancialProduction > 0 ? (lifeInsurancePremium / totalFinancialProduction) * 100 : 0
  const aumPercentage = totalFinancialProduction > 0 ? (aum / totalFinancialProduction) * 100 : 0
  const financialPlanningPercentage = totalFinancialProduction > 0 ? (financialPlanning / totalFinancialProduction) * 100 : 0

  return (
    <Card
      className={`bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md ${className}`}
    >
      <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
        <CardTitle className="text-xl font-extrabold text-white flex items-center tracking-tight">
          <DollarSign className="mr-3 h-6 w-6 text-green-500" />
          Financial Production
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6">
          {/* Total Financial Production Summary */}
          <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:bg-black/50 hover:border-green-500/60 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-white/80 font-medium tracking-wide">Total Financial Production</span>
                  <span className="text-2xl font-extrabold text-white tracking-tight">{formatCurrency(totalFinancialProduction)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Production Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Annuity Premium */}
            <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:bg-black/50 hover:border-gray-500/60 hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-500/20 p-2 rounded-lg">
                    <FileText className="h-4 w-4 text-gray-500" />
                  </div>
                  <span className="text-sm font-medium text-white/80 tracking-wide">Annuity Premium</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-xl font-extrabold tracking-tight text-white">
                  {formatCurrency(annuityPremium)}
                </div>
                <div className="text-sm font-extrabold text-gray-500">
                  {annuityPercentage.toFixed(1)}%
                </div>
              </div>
              <div className="w-full bg-m8bs-border/30 rounded-full h-2">
                <div
                  className="bg-gray-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${annuityPercentage}%` }}
                />
              </div>
            </div>

            {/* Life Insurance Premium */}
            <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:bg-black/50 hover:border-purple-500/60 hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-500/20 p-2 rounded-lg">
                    <Shield className="h-4 w-4 text-purple-500" />
                  </div>
                  <span className="text-sm font-medium text-white/80 tracking-wide">Life Insurance Premium</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-xl font-extrabold tracking-tight text-white">
                  {formatCurrency(lifeInsurancePremium)}
                </div>
                <div className="text-sm font-extrabold text-purple-500">
                  {lifeInsurancePercentage.toFixed(1)}%
                </div>
              </div>
              <div className="w-full bg-m8bs-border/30 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${lifeInsurancePercentage}%` }}
                />
              </div>
            </div>

            {/* Assets Under Management */}
            <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:bg-black/50 hover:border-emerald-500/60 hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-500/20 p-2 rounded-lg">
                    <Coins className="h-4 w-4 text-emerald-500" />
                  </div>
                  <span className="text-sm font-medium text-white/80 tracking-wide">Assets Under Management</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-xl font-extrabold tracking-tight text-white">
                  {formatCurrency(aum)}
                </div>
                <div className="text-sm font-extrabold text-emerald-500">
                  {aumPercentage.toFixed(1)}%
                </div>
              </div>
              <div className="w-full bg-m8bs-border/30 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${aumPercentage}%` }}
                />
              </div>
            </div>

            {/* Financial Planning */}
            <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:bg-black/50 hover:border-amber-500/60 hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-amber-500/20 p-2 rounded-lg">
                    <Briefcase className="h-4 w-4 text-amber-500" />
                  </div>
                  <span className="text-sm font-medium text-white/80 tracking-wide">Financial Planning</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-xl font-extrabold tracking-tight text-white">
                  {formatCurrency(financialPlanning)}
                </div>
                <div className="text-sm font-extrabold text-amber-500">
                  {financialPlanningPercentage.toFixed(1)}%
                </div>
              </div>
              <div className="w-full bg-m8bs-border/30 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${financialPlanningPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
