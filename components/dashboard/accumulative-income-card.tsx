import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Shield, FileText, Briefcase, Coins } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface AccumulativeIncomeCardProps {
  lifeInsuranceCommission: number
  annuityCommission: number
  financialPlanning: number
  aumFees: number
}

export function AccumulativeIncomeCard({
  lifeInsuranceCommission = 0,
  annuityCommission = 0,
  financialPlanning = 0,
  aumFees = 0,
}: AccumulativeIncomeCardProps) {
  const totalIncome = lifeInsuranceCommission + annuityCommission + financialPlanning + aumFees

  // Calculate percentages for the progress bars
  const lifeInsurancePercentage = totalIncome > 0 ? (lifeInsuranceCommission / totalIncome) * 100 : 0
  const annuityPercentage = totalIncome > 0 ? (annuityCommission / totalIncome) * 100 : 0
  const financialPlanningPercentage = totalIncome > 0 ? (financialPlanning / totalIncome) * 100 : 0
  const aumFeesPercentage = totalIncome > 0 ? (aumFees / totalIncome) * 100 : 0

  return (
    <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md">
      <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
        <CardTitle className="text-xl font-extrabold text-white flex items-center tracking-tight">
          <DollarSign className="mr-3 h-6 w-6 text-green-500" />
          Accumulative Income
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6">
          {/* Total Income Summary */}
          <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:bg-black/50 hover:border-green-500/60 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-white/80 font-medium tracking-wide">Total Income</span>
                  <span className="text-2xl font-extrabold text-white tracking-tight">{formatCurrency(totalIncome)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Income Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Life Insurance Commission */}
            <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:bg-black/50 hover:border-purple-500/60 hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-500/20 p-2 rounded-lg">
                    <Shield className="h-4 w-4 text-purple-500" />
                  </div>
                  <span className="text-sm font-medium text-white/80 tracking-wide">Life Insurance Commission</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-xl font-extrabold tracking-tight text-white">
                  {formatCurrency(lifeInsuranceCommission)}
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

            {/* Annuity Commission */}
            <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:bg-black/50 hover:border-gray-500/60 hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-500/20 p-2 rounded-lg">
                    <FileText className="h-4 w-4 text-gray-500" />
                  </div>
                  <span className="text-sm font-medium text-white/80 tracking-wide">Annuity Commission</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-xl font-extrabold tracking-tight text-white">
                  {formatCurrency(annuityCommission)}
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

            {/* Financial Planning */}
            <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:bg-black/50 hover:border-green-500/60 hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-green-500/20 p-2 rounded-lg">
                    <Briefcase className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-sm font-medium text-white/80 tracking-wide">Financial Planning</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-xl font-extrabold tracking-tight text-white">
                  {formatCurrency(financialPlanning)}
                </div>
                <div className="text-sm font-extrabold text-green-500">
                  {financialPlanningPercentage.toFixed(1)}%
                </div>
              </div>
              <div className="w-full bg-m8bs-border/30 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${financialPlanningPercentage}%` }}
                />
              </div>
            </div>

            {/* AUM Fees */}
            <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:bg-black/50 hover:border-amber-500/60 hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-amber-500/20 p-2 rounded-lg">
                    <Coins className="h-4 w-4 text-amber-500" />
                  </div>
                  <span className="text-sm font-medium text-white/80 tracking-wide">AUM Fees</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-xl font-extrabold tracking-tight text-white">
                  {formatCurrency(aumFees)}
                </div>
                <div className="text-sm font-extrabold text-amber-500">
                  {aumFeesPercentage.toFixed(1)}%
                </div>
              </div>
              <div className="w-full bg-m8bs-border/30 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${aumFeesPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
