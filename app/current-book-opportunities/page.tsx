"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { CurrentBookOpportunitiesForm } from "@/components/business-dashboard/current-book-opportunities-form"
import { FinancialOptions } from "@/components/business-dashboard/financial-options"
import { useAdvisorBasecamp } from "@/hooks/use-advisor-basecamp"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function CurrentBookOpportunitiesPage() {
  const { user } = useAuth()
  const { data, loading, loadData } = useAdvisorBasecamp(user)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, loadData])

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <div className="text-white">
            <h3 className="text-lg font-semibold">Loading</h3>
            <p className="text-gray-300">Preparing page...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please Log In To Access This Page.</p>
          <Link href="/login">
            <Button className="mt-4">Go To Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Current Book Opportunities
          </h1>
          <p className="text-m8bs-muted mt-1">
            Manage Your Financial Book Values And Financial Options Percentages
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-m8bs-card p-1 border border-m8bs-border rounded-lg shadow-lg grid grid-cols-2 w-full h-auto">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-m8bs-blue data-[state=active]:text-white data-[state=active]:shadow-md py-2 text-sm font-medium transition-all"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="form" 
            className="data-[state=active]:bg-m8bs-blue data-[state=active]:text-white data-[state=active]:shadow-md py-2 text-sm font-medium transition-all"
          >
            Form
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <FinancialOptions 
            data={{
              currentValues: data.currentValues ? {
                current_annuity: data.currentValues.current_annuity,
                current_aum: data.currentValues.current_aum
              } : undefined,
              financialBook: data.financialBook ? {
                qualified_money_value: data.financialBook.qualified_money_value
              } : undefined,
              financialOptions: data.financialOptions ? {
                surrender_percent: data.financialOptions.surrender_percent,
                income_rider_percent: data.financialOptions.income_rider_percent,
                free_withdrawal_percent: data.financialOptions.free_withdrawal_percent,
                life_insurance_percent: data.financialOptions.life_insurance_percent,
                life_strategy1_percent: data.financialOptions.life_strategy1_percent,
                life_strategy2_percent: data.financialOptions.life_strategy2_percent,
                ira_to_7702_percent: data.financialOptions.ira_to_7702_percent,
                approval_rate_percent: data.financialOptions.approval_rate_percent,
                surrender_rate: data.financialOptions.surrender_rate,
                income_rider_rate: data.financialOptions.income_rider_rate,
                free_withdrawal_rate: data.financialOptions.free_withdrawal_rate,
                life_insurance_rate: data.financialOptions.life_insurance_rate,
                life_strategy1_rate: data.financialOptions.life_strategy1_rate,
                life_strategy2_rate: data.financialOptions.life_strategy2_rate,
                ira_to_7702_rate: data.financialOptions.ira_to_7702_rate,
              } : undefined
            } as any} 
          />
        </TabsContent>

        <TabsContent value="form" className="space-y-6">
          <CurrentBookOpportunitiesForm user={user} onComplete={loadData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

