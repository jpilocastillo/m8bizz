import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp } from "lucide-react"

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
    <Card className="overflow-hidden border-0 bg-gradient-to-b from-[#131525] to-[#0f1029] shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2 text-white">
          <span className="text-green-400">
            <DollarSign className="h-5 w-5" />
          </span>
          Accumulative Income
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">Total Income</span>
              <span className="text-2xl font-bold text-white">${totalIncome.toLocaleString()}</span>
            </div>
            <div className="bg-green-500/10 p-2.5 rounded-full">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </div>

          <div className="space-y-4">
            {/* Life Insurance Commission */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <span className="text-gray-300">Life Insurance Commission</span>
                </div>
                <span className="font-medium text-white">${lifeInsuranceCommission.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-[#1f2037] rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${lifeInsurancePercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Annuity Commission */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-gray-300">Annuity Commission</span>
                </div>
                <span className="font-medium text-white">${annuityCommission.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-[#1f2037] rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${annuityPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Financial Planning */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-gray-300">Financial Planning</span>
                </div>
                <span className="font-medium text-white">${financialPlanning.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-[#1f2037] rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${financialPlanningPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* AUM Fees */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                  <span className="text-gray-300">AUM Fees</span>
                </div>
                <span className="font-medium text-white">${aumFees.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-[#1f2037] rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${aumFeesPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
