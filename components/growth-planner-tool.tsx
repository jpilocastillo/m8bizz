"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sprout, TreePine, Leaf, Flower, Heading as Seedling, Sun, Droplets, Plus, X, TrendingUp, Shield, Target, Zap, Star, Sparkles } from "lucide-react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts"

interface BucketData {
  id: string
  name: string
  percentage: number
  amount: number
  color: string
  icon: React.ReactNode
  description: string
  growthStage: string
  timeframe: string
  investmentType: string
  premiumAmount: number
  interestRate: number
  delayPeriod: number
  paymentDelayPeriod: number
  incomePeriods: number
  annuityLabel?: string
  riskTolerance: "conservative" | "moderate" | "aggressive"
  lifetimeIncomeType?: "single" | "joint"
  ageBasedPayoutPercent?: number
}

interface IncomeSource {
  id: string
  name: string
  amount: number
}

interface ClientGoal {
  id: string
  goal: string
  priority: "high" | "medium" | "low"
  timeframe: string
  estimatedCost: number
}

interface ClientData {
  name: string
  totalAmount: number
  riskTolerance: "conservative" | "moderate" | "aggressive"
  timeHorizon: number
  retirementAge: number
  incomeStartAge: number
  taxableFunds: number
  taxDeferredFunds: number
  taxFreeFunds: number
  taxBracket: number
  currentMonthlyIncome: number
  desiredMonthlyIncome: number
  annualPaymentNeeded: number
  inflationRate: number
  incomeSources: IncomeSource[]
  clientGoals: ClientGoal[]
}

const formatCurrency = (value: number | string): string => {
  const num = typeof value === "string" ? Number.parseFloat(value) || 0 : (value || 0)
  if (isNaN(num) || num === null || num === undefined) return "0.00"
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatCurrencyInput = (value: number | string): string => {
  const num = typeof value === "string" ? Number.parseFloat(value) || 0 : (value || 0)
  if (isNaN(num) || num === null || num === undefined) return "0"
  return num.toLocaleString("en-US")
}

const parseCurrency = (value: string): number => {
  return Number.parseFloat(value.replace(/,/g, "")) || 0
}

const calculateFutureValue = (presentValue: number, rate: number, time: number): number => {
  return presentValue * Math.pow(1 + rate / 100, time)
}

const calculateAnnuityPayment = (futureValue: number, rate: number, periods: number): number => {
  if (rate === 0) return futureValue / periods
  const monthlyRate = rate / 100 / 12
  return (futureValue * monthlyRate) / (Math.pow(1 + monthlyRate, periods * 12) - 1)
}

const calculateIncomeGapForBucket = (annualPayment: number, taxRate: number): number => {
  const monthlyPayment = annualPayment / 12
  const afterTaxPayment = monthlyPayment * (1 - taxRate / 100)
  return afterTaxPayment
}

export function GrowthPlannerTool() {
  // Add slider styles
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .slider::-webkit-slider-thumb {
        appearance: none;
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: #16a34a;
        cursor: pointer;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      .slider::-moz-range-thumb {
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: #16a34a;
        cursor: pointer;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])
  const [currentStage, setCurrentStage] = useState(1)
  const [clientData, setClientData] = useState<ClientData>({
    name: "",
    totalAmount: 0,
    riskTolerance: "moderate",
    timeHorizon: 16,
    retirementAge: 65,
    incomeStartAge: 67,
    taxableFunds: 0,
    taxDeferredFunds: 0,
    taxFreeFunds: 0,
    taxBracket: 22,
    currentMonthlyIncome: 0,
    desiredMonthlyIncome: 0,
    annualPaymentNeeded: 0,
    inflationRate: 3,
    incomeSources: [],
    clientGoals: [],
  })

  const [buckets, setBuckets] = useState<BucketData[]>([])

  const [calculationResults, setCalculationResults] = useState<{
    [bucketId: string]: {
      estimatedPremium: number
      futureValue: number
      annuityPayment: number
      incomeGap: number
      afterTaxIncome: number
      incomeSolve: number
    }
  }>({})

  const totalInvestibleAssets = clientData.taxableFunds + clientData.taxDeferredFunds + clientData.taxFreeFunds
  const totalCurrentIncome = clientData.incomeSources.reduce((sum, source) => sum + source.amount, 0)
  const incomeGap = clientData.desiredMonthlyIncome - totalCurrentIncome
  const annualIncomeGap = incomeGap * 12

  const calculateEstimatedPremiums = () => {
    if (buckets.length === 0) return []
    
    // For conservative (single bucket), use 100%
    if (buckets.length === 1 && clientData.riskTolerance === "conservative") {
      return [totalInvestibleAssets]
    }
    
    // For aggressive (multiple buckets), distribute based on percentages
    return buckets.map(bucket => {
      const percentage = bucket.percentage || 0
      return totalInvestibleAssets * (percentage / 100)
    })
  }

  const updateBucketAmounts = (totalAmount: number) => {
    const estimatedPremiums = calculateEstimatedPremiums()
    setBuckets((prev) =>
      prev.map((bucket, index) => ({
        ...bucket,
        amount: estimatedPremiums[index],
        premiumAmount: estimatedPremiums[index],
      })),
    )
  }

  const handleClientDataChange = (field: keyof ClientData, value: any) => {
    const newData = { ...clientData, [field]: value }
    if (field === "desiredMonthlyIncome") {
      const newIncomeGap = value - totalCurrentIncome
      newData.annualPaymentNeeded = Math.max(0, newIncomeGap * 12)
    }
    setClientData(newData)
    if (field === "totalAmount") {
      updateBucketAmounts(value)
    }
    if (field === "riskTolerance") {
      // Generate initial buckets based on climate choice
      const climate = value === "moderate" ? "aggressive" : value
      const newBuckets = generateInitialBuckets(climate)
      setBuckets(newBuckets)
      updateBucketAmounts(clientData.totalAmount)
    }
  }

  const handleRetirementSeedChange = (field: "taxableFunds" | "taxDeferredFunds" | "taxFreeFunds", value: number) => {
    const newData = { ...clientData, [field]: value }
    const newTotal =
      (field === "taxableFunds" ? value : clientData.taxableFunds) +
      (field === "taxDeferredFunds" ? value : clientData.taxDeferredFunds) +
      (field === "taxFreeFunds" ? value : clientData.taxFreeFunds)

    newData.totalAmount = newTotal
    setClientData(newData)
    updateBucketAmounts(newTotal)
  }

  const handleBucketPercentageChange = (bucketId: string, newPercentage: number) => {
    const totalOthers = buckets.reduce((sum, bucket) => (bucket.id === bucketId ? sum : sum + bucket.percentage), 0)

    if (totalOthers + newPercentage <= 100) {
      setBuckets((prev) =>
        prev.map((bucket) =>
          bucket.id === bucketId
            ? { ...bucket, percentage: newPercentage, amount: (clientData.totalAmount * newPercentage) / 100 }
            : bucket,
        ),
      )
    }
  }

  const totalPercentage = buckets.reduce((sum, bucket) => sum + bucket.percentage, 0)

  const stages = [
    {
      id: 1,
      title: "Plant Retirement Seeds",
      description: "Gather client's retirement landscape and income needs",
      icon: <Sprout className="h-6 w-6 text-green-400 drop-shadow-lg" />,
    },
    {
      id: 2,
      title: "Cultivate Income Streams",
      description: "Design the 16+ year retirement income garden",
      icon: <Sun className="h-6 w-6 text-yellow-400 drop-shadow-lg" />,
    },
    {
      id: 3,
      title: "Harvest Retirement Plan",
      description: "Finalize the lifetime income strategy",
      icon: <Droplets className="h-6 w-6 text-blue-400 drop-shadow-lg" />,
    },
  ]

  const addIncomeSource = () => {
    const newSource: IncomeSource = {
      id: Date.now().toString(),
      name: "",
      amount: 0,
    }
    setClientData((prev) => ({
      ...prev,
      incomeSources: [...prev.incomeSources, newSource],
    }))
  }

  const updateIncomeSource = (id: string, field: keyof IncomeSource, value: string | number) => {
    const updatedSources = clientData.incomeSources.map((source) =>
      source.id === id ? { ...source, [field]: value } : source,
    )

    const newTotalCurrentIncome = updatedSources.reduce((sum, source) => sum + source.amount, 0)
    const newIncomeGap = clientData.desiredMonthlyIncome - newTotalCurrentIncome

    setClientData((prev) => ({
      ...prev,
      incomeSources: updatedSources,
      annualPaymentNeeded: Math.max(0, newIncomeGap * 12),
    }))
  }

  const removeIncomeSource = (id: string) => {
    setClientData((prev) => ({
      ...prev,
      incomeSources: prev.incomeSources.filter((source) => source.id !== id),
    }))
  }

  const addClientGoal = () => {
    const newGoal: ClientGoal = {
      id: Date.now().toString(),
      goal: "",
      priority: "medium",
      timeframe: "",
      estimatedCost: 0,
    }
    setClientData((prev) => ({
      ...prev,
      clientGoals: [...prev.clientGoals, newGoal],
    }))
  }

  const updateClientGoal = (id: string, field: keyof ClientGoal, value: string | number) => {
    const updatedGoals = clientData.clientGoals.map((goal) =>
      goal.id === id ? { ...goal, [field]: value } : goal,
    )

    setClientData((prev) => ({
      ...prev,
      clientGoals: updatedGoals,
    }))
  }

  const removeClientGoal = (id: string) => {
    setClientData((prev) => ({
      ...prev,
      clientGoals: prev.clientGoals.filter((goal) => goal.id !== id),
    }))
  }

  const calculateBucketResults = () => {
    const results: typeof calculationResults = {}

    buckets.forEach((bucket) => {
      const estimatedPremium = bucket.amount * 1.06 // Estimated premium factor
      const futureValue = calculateFutureValue(bucket.amount, bucket.interestRate, bucket.delayPeriod)
      const annuityPayment = calculateAnnuityPayment(futureValue, bucket.interestRate, bucket.incomePeriods) * 12 // Annual payment
      const afterTaxIncome = calculateIncomeGapForBucket(annuityPayment, clientData.taxBracket)
      const incomeSolve = afterTaxIncome * 12 // Annual after-tax income

      results[bucket.id] = {
        estimatedPremium,
        futureValue,
        annuityPayment,
        incomeGap: annuityPayment / 12, // Monthly income gap this bucket fills
        afterTaxIncome,
        incomeSolve,
      }
    })

    setCalculationResults(results)
  }

  const updateBucketField = (bucketId: string, field: keyof BucketData, value: number | string) => {
    setBuckets((prev) => prev.map((bucket) => (bucket.id === bucketId ? { ...bucket, [field]: value } : bucket)))
  }

  const generateInitialBuckets = (climate: "conservative" | "aggressive") => {
    const incomeStartDelay = Math.max(1, clientData.incomeStartAge - clientData.retirementAge)
    
    if (climate === "conservative") {
      // Only annuity options for conservative
      return [
        {
          id: "conservative-annuity-1",
          name: "Conservative Annuity",
          percentage: 100,
          amount: 0,
          color: "#3B82F6",
          icon: <Sprout className="h-6 w-6 text-green-400 drop-shadow-lg" />,
          description: "Conservative fixed annuity providing steady, guaranteed income",
          growthStage: "Conservative Growth",
          timeframe: `Years ${incomeStartDelay}+`,
          investmentType: "Fixed Annuity",
          premiumAmount: 0,
          interestRate: 4.5,
          delayPeriod: incomeStartDelay,
          incomePeriods: 20,
          paymentDelayPeriod: incomeStartDelay * 12,
          annuityLabel: "",
          riskTolerance: "conservative" as const,
        },
      ]
    } else {
      // Full diversified approach for aggressive
      const year2Start = incomeStartDelay
      const year7Start = Math.max(year2Start + 5, incomeStartDelay + 5)
      const year12Start = Math.max(year7Start + 5, incomeStartDelay + 10)
      const year16Start = Math.max(year12Start + 4, incomeStartDelay + 14)
      
      return [
        {
          id: "early-bloom",
          name: "Early Bloom Annuity",
          percentage: 20,
          amount: 0,
          color: "#3B82F6",
          icon: <Sprout className="h-6 w-6 text-blue-400 drop-shadow-lg" />,
          description: "First flowering of retirement income - steady annuity payments for early retirement years",
          growthStage: "Early Flowering",
          timeframe: `Years ${year2Start}-${year7Start - 1}`,
          investmentType: "Fixed Annuity",
          premiumAmount: 0,
          interestRate: 5.25,
          delayPeriod: year2Start,
          incomePeriods: year7Start - year2Start,
          paymentDelayPeriod: year2Start * 12,
          annuityLabel: "",
          riskTolerance: "conservative" as const,
        },
        {
          id: "mid-harvest",
          name: "Mid-Season Harvest",
          percentage: 24,
          amount: 0,
          color: "#10B981",
          icon: <Leaf className="h-6 w-6 text-emerald-400 drop-shadow-lg" />,
          description: "Prime harvest years - reliable annuity income during mid-retirement years",
          growthStage: "Peak Harvest",
          timeframe: `Years ${year7Start}-${year12Start - 1}`,
          investmentType: "Fixed Annuity",
          premiumAmount: 0,
          interestRate: 5.5,
          delayPeriod: year7Start,
          incomePeriods: year12Start - year7Start,
          paymentDelayPeriod: year7Start * 12,
          annuityLabel: "",
          riskTolerance: "conservative" as const,
        },
        {
          id: "mature-grove",
          name: "Mature Grove Annuity",
          percentage: 24,
          amount: 0,
          color: "#F59E0B",
          icon: <TreePine className="h-6 w-6 text-amber-400 drop-shadow-lg" />,
          description: "Established grove providing steady income - annuity payments for mature retirement years",
          growthStage: "Mature Forest",
          timeframe: `Years ${year12Start}-${year16Start - 1}`,
          investmentType: "Fixed Annuity",
          premiumAmount: 0,
          interestRate: 6.5,
          delayPeriod: year12Start,
          incomePeriods: year16Start - year12Start,
          paymentDelayPeriod: year12Start * 12,
          annuityLabel: "",
          riskTolerance: "conservative" as const,
        },
        {
          id: "perpetual-garden",
          name: "Perpetual Garden",
          percentage: 32,
          amount: 0,
          color: "#8B5CF6",
          icon: <Flower className="h-6 w-6 text-purple-400 drop-shadow-lg" />,
          description:
            "Self-sustaining garden - brokerage investments providing flexible income for years 16+ and legacy wealth",
          growthStage: "Evergreen Legacy",
          timeframe: `Years ${year16Start}+`,
          investmentType: "Brokerage Portfolio",
          premiumAmount: 0,
          interestRate: 7.0,
          delayPeriod: year16Start,
          incomePeriods: 5,
          paymentDelayPeriod: year16Start * 12,
          annuityLabel: "",
          riskTolerance: "moderate" as const,
        },
      ]
    }
  }

  const addNewBucket = (climate: "conservative" | "aggressive", investmentType: "annuity" | "portfolio" | "lifetime" = "annuity") => {
    const newBucketId = `new-bucket-${Date.now()}`
    const incomeStartDelay = Math.max(1, clientData.incomeStartAge - clientData.retirementAge)
    let newBucket: BucketData

    if (climate === "conservative") {
      // Conservative can only add annuities
      newBucket = {
        id: newBucketId,
        name: "Additional Conservative Annuity",
        percentage: 0,
        amount: 0,
        color: "var(--chart-2)",
        icon: <Leaf className="h-5 w-5" />,
        description: "Additional conservative annuity for enhanced income security",
        growthStage: "Conservative Growth",
        timeframe: `Years ${incomeStartDelay}+`,
        investmentType: "Fixed Annuity",
        premiumAmount: 0,
        interestRate: 4.5,
        delayPeriod: incomeStartDelay,
        incomePeriods: 20,
        paymentDelayPeriod: incomeStartDelay * 12,
        annuityLabel: "",
        riskTolerance: "conservative" as const,
      }
    } else {
      // Aggressive can add either annuities or growth portfolios
      if (investmentType === "annuity") {
        newBucket = {
          id: newBucketId,
          name: "Additional Growth Annuity",
          percentage: 0,
          amount: 0,
          color: "var(--chart-5)",
          icon: <TreePine className="h-5 w-5" />,
          description: "Additional growth-focused annuity for enhanced returns",
          growthStage: "Growth Phase",
          timeframe: `Years ${incomeStartDelay}+`,
          investmentType: "Fixed Annuity",
          premiumAmount: 0,
          interestRate: 6.5,
          delayPeriod: incomeStartDelay,
          incomePeriods: 15,
          paymentDelayPeriod: incomeStartDelay * 12,
          annuityLabel: "",
          riskTolerance: "conservative" as const,
        }
      } else if (investmentType === "portfolio") {
        newBucket = {
          id: newBucketId,
          name: "Additional Growth Investment",
          percentage: 0,
          amount: 0,
          color: "var(--chart-5)",
          icon: <Sun className="h-5 w-5" />,
          description: "Additional growth-focused investment for enhanced returns",
          growthStage: "Growth Phase",
          timeframe: `Years ${incomeStartDelay}+`,
          investmentType: "Brokerage Portfolio",
          premiumAmount: 0,
          interestRate: 8.0,
          delayPeriod: incomeStartDelay,
          incomePeriods: 15,
          paymentDelayPeriod: incomeStartDelay * 12,
          annuityLabel: "",
          riskTolerance: "moderate" as const,
        }
      } else {
        newBucket = {
          id: newBucketId,
          name: "Lifetime Income Annuity",
          percentage: 0,
          amount: 0,
          color: "var(--chart-6)",
          icon: <Droplets className="h-5 w-5" />,
          description: "Lifetime income annuity providing guaranteed income for life",
          growthStage: "Lifetime Security",
          timeframe: `Years ${incomeStartDelay}+`,
          investmentType: "Lifetime Income",
          premiumAmount: 0,
          interestRate: 4.0,
          delayPeriod: incomeStartDelay,
          incomePeriods: 999, // Lifetime
          paymentDelayPeriod: incomeStartDelay * 12,
          annuityLabel: "",
          riskTolerance: "conservative" as const,
          lifetimeIncomeType: "single",
        }
      }
    }

    setBuckets((prev) => [...prev, newBucket])
  }

  const removeBucket = (bucketId: string) => {
    setBuckets((prev) => prev.filter((bucket) => bucket.id !== bucketId))
  }

  const calculateBucketValues = (bucket: BucketData) => {
    const estimatedPremiums = calculateEstimatedPremiums()
    const bucketIndex = buckets.findIndex((b) => b.id === bucket.id)
    const estimatedPremium = estimatedPremiums[bucketIndex]

    if (bucket.investmentType === "Lifetime Income") {
      // For lifetime income annuities, use age-based payout percentage
      const ageBasedPayout = bucket.ageBasedPayoutPercent || 0
      const annualIncome = (bucket.premiumAmount * ageBasedPayout) / 100
      const taxes = annualIncome * (clientData.taxBracket / 100)
      const netIncome = annualIncome - taxes

      return {
        estimatedPremium: bucket.premiumAmount,
        futureValue: bucket.premiumAmount, // No growth for lifetime income
        annuityPayment: annualIncome,
        payments: annualIncome,
        taxes: -taxes, // Negative for display
        incomeSolve: netIncome,
      }
    } else {
      // For other investment types, use the original calculation
      // Future Value = Premium Amount * (1 + Rate of Interest)^Period of Delay
      const futureValue = bucket.premiumAmount * Math.pow(1 + bucket.interestRate / 100, bucket.delayPeriod)

      const annuityPayment = annualIncomeGap / 12

      // Payments = (Future Value / Number of Income Periods) * (1 + Rate of Interest)
      const payments = (futureValue / bucket.incomePeriods) * (1 + bucket.interestRate / 100)

      // Taxes = Payments * Tax Bracket
      const taxes = payments * (clientData.taxBracket / 100)

      // Income Solve = Payments + Taxes (where Taxes is negative)
      const incomeSolve = payments - taxes

      return {
        estimatedPremium,
        futureValue,
        annuityPayment,
        payments,
        taxes: -taxes, // Negative for display
        incomeSolve,
      }
    }
  }

  return (
    <TooltipProvider>
      <div className="w-full min-h-screen bg-m8bs-bg relative overflow-hidden">
        {/* Static background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto p-4 sm:p-6 max-w-7xl relative">
      {/* Enhanced Header */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative group">
              <div className="flex items-center gap-1 transform group-hover:scale-110 transition-all duration-300">
                <TreePine className="h-8 w-8 text-green-400" />
                <TreePine className="h-12 w-12 text-green-500 drop-shadow-lg" />
                <TreePine className="h-8 w-8 text-green-400" />
              </div>
            </div>
          </div>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold text-balance mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Evergreen Income Planner
            </h1>
            <p className="text-xl text-blue-200 text-pretty leading-relaxed">
              Cultivate a 16+ year retirement income strategy - plant annuity seeds, nurture growth, harvest lifetime prosperity
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Star className="h-4 w-4 text-yellow-400 animate-pulse" />
              <span className="text-sm text-green-300 font-medium">Advanced Retirement Planning</span>
              <Star className="h-4 w-4 text-yellow-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Enhanced Progress Indicator */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-8">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <div
                className={`group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-lg sm:text-xl font-medium border-2 transition-all duration-500 transform hover:scale-110 ${
                  currentStage >= stage.id
                    ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-400 shadow-2xl shadow-green-500/40 scale-110"
                    : "bg-blue-900/50 text-blue-300 border-blue-400 hover:bg-blue-800/50 hover:border-blue-300 shadow-lg"
                }`}
              >
                {stage.icon}
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm sm:text-lg font-bold text-blue-100">{stage.title}</p>
                <p className="text-xs sm:text-sm text-blue-200 max-w-xs hidden sm:block">{stage.description}</p>
              </div>
              {index < stages.length - 1 && (
                <div
                  className={`w-8 h-8 sm:w-16 sm:h-1 mx-2 sm:mx-4 rounded-full transition-all duration-500 ${
                    currentStage > stage.id 
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/30" 
                      : "bg-slate-600"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <Tabs value={currentStage.toString()} className="space-y-6">
        {/* Stage 1: Client Information */}
        <TabsContent value="1" className="space-y-8">
          <Card className="border-m8bs-card-alt/50 shadow-2xl bg-gradient-to-br from-m8bs-card/90 to-m8bs-card-alt/90 backdrop-blur-sm border-2 transform hover:scale-[1.02] transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-b border-green-400/50 p-8">
              <CardTitle className="flex items-center gap-3 text-green-300 text-2xl">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <Sprout className="h-6 w-6 text-white drop-shadow-lg" />
                </div>
                Prepare the Retirement Soil
              </CardTitle>
              <CardDescription className="text-blue-200 text-lg mt-2">
                Let's understand your client's retirement landscape and income growing conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Retirement Gardener's Name</Label>
                  <Input
                    id="clientName"
                    placeholder="Enter client's full name"
                    value={clientData.name}
                    onChange={(e) => handleClientDataChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retirementAge">Retirement Planting Age</Label>
                  <Input
                    id="retirementAge"
                    type="number"
                    placeholder="65"
                    value={clientData.retirementAge}
                    onChange={(e) => handleClientDataChange("retirementAge", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="incomeStartAge">Income Harvest Start Age</Label>
                  <Input
                    id="incomeStartAge"
                    type="number"
                    placeholder="67"
                    value={clientData.incomeStartAge}
                    onChange={(e) => handleClientDataChange("incomeStartAge", Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Age when retirement income begins flowing</p>
                </div>
                <div className="space-y-2">
                  <Label>Time to Income Start</Label>
                  <div className="p-3 bg-green-900/20 rounded-lg border border-green-700/30">
                    <p className="text-sm text-muted-foreground">Years until income begins:</p>
                    <p className="text-lg font-bold text-green-300">
                      {Math.max(0, clientData.incomeStartAge - clientData.retirementAge)} years
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-green-400">Retirement Seeds to Plant</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Break down your client's investible assets by tax treatment
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxableFunds">Taxable Garden Beds ($)</Label>
                    <Input
                      id="taxableFunds"
                      type="text"
                      placeholder="150,000"
                      value={clientData.taxableFunds ? formatCurrencyInput(clientData.taxableFunds) : ""}
                      onChange={(e) => {
                        // Only allow whole numbers for taxable funds
                        const value = e.target.value.replace(/[^\d]/g, '');
                        const numValue = parseInt(value) || 0;
                        handleRetirementSeedChange("taxableFunds", numValue);
                      }}
                    />
                    <p className="text-xs text-muted-foreground">Brokerage accounts, savings</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxDeferredFunds">Tax-Deferred Greenhouse ($)</Label>
                    <Input
                      id="taxDeferredFunds"
                      type="text"
                      placeholder="300,000"
                      value={clientData.taxDeferredFunds ? formatCurrencyInput(clientData.taxDeferredFunds) : ""}
                      onChange={(e) => handleRetirementSeedChange("taxDeferredFunds", parseCurrency(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">401(k), Traditional IRA</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxFreeFunds">Tax-Free Sanctuary ($)</Label>
                    <Input
                      id="taxFreeFunds"
                      type="text"
                      placeholder="50,000"
                      value={clientData.taxFreeFunds ? formatCurrencyInput(clientData.taxFreeFunds) : ""}
                      onChange={(e) => handleRetirementSeedChange("taxFreeFunds", parseCurrency(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">Roth IRA, Roth 401(k)</p>
                  </div>
                </div>

                <div className="p-4 bg-green-900/20 rounded-lg border border-green-700/30">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-green-400">Total Investible Assets:</span>
                    <span className="text-lg font-bold text-green-300">${formatCurrency(totalInvestibleAssets)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TreePine className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-green-400">Tax Climate Zone</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxBracket">Effective Tax Bracket (%)</Label>
                    <Input
                      id="taxBracket"
                      type="number"
                      step="0.1"
                      min="0"
                      max="50"
                      placeholder="22.0"
                      value={clientData.taxBracket || ""}
                      onChange={(e) => handleClientDataChange("taxBracket", Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the client's effective tax rate (e.g., 22.0 for 22%)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="riskTolerance">Income Growing Climate</Label>
                    <select
                      id="riskTolerance"
                      className="w-full p-2 border border-input rounded-md bg-background"
                      value={clientData.riskTolerance}
                      onChange={(e) => handleClientDataChange("riskTolerance", e.target.value)}
                    >
                      <option value="conservative">Shade Garden (Conservative Income)</option>
                      <option value="aggressive">Full Sun (Growth-Focused Income)</option>
                    </select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-green-400">Income Harvest Analysis</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Add all current income sources (Social Security, pensions, part-time work, etc.)
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addIncomeSource}
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <Plus className="h-4 w-4" />
                      Add Income Source
                    </Button>
                  </div>

                  {clientData.incomeSources.length === 0 && (
                    <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">No income sources added yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Click "Add Income Source" to get started</p>
                    </div>
                  )}

                  {clientData.incomeSources.map((source) => (
                    <div key={source.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor={`source-name-${source.id}`}>Income Source Type</Label>
                        <Input
                          id={`source-name-${source.id}`}
                          placeholder="e.g., Social Security, Pension, Part-time work"
                          value={source.name}
                          onChange={(e) => updateIncomeSource(source.id, "name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`source-amount-${source.id}`}>Monthly Amount ($)</Label>
                        <div className="flex gap-2">
                          <Input
                            id={`source-amount-${source.id}`}
                            type="text"
                            placeholder="2,500"
                            value={source.amount ? formatCurrencyInput(source.amount) : ""}
                            onChange={(e) => updateIncomeSource(source.id, "amount", parseCurrency(e.target.value))}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeIncomeSource(source.id)}
                            className="px-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desiredMonthlyIncome">Desired Monthly Harvest ($)</Label>
                  <Input
                    id="desiredMonthlyIncome"
                    type="text"
                    placeholder="12,000"
                    value={clientData.desiredMonthlyIncome ? formatCurrencyInput(clientData.desiredMonthlyIncome) : ""}
                    onChange={(e) => handleClientDataChange("desiredMonthlyIncome", parseCurrency(e.target.value))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-900/20 rounded-lg border border-green-700/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Current Income:</span>
                      <span className="font-bold text-green-300">${formatCurrency(totalCurrentIncome)}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-700/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Monthly Income Gap:</span>
                      <span className={`font-bold ${incomeGap > 0 ? "text-orange-400" : "text-green-400"}`}>
                        ${formatCurrency(Math.abs(incomeGap))}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-900/20 rounded-lg border border-emerald-700/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Annual Income Gap:</span>
                      <span className={`font-bold ${annualIncomeGap > 0 ? "text-orange-400" : "text-green-400"}`}>
                        ${formatCurrency(Math.abs(annualIncomeGap))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Flower className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-green-400">Growth Conditions</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="annualPaymentNeeded">Annual Payment Needed ($)</Label>
                    <Input
                      id="annualPaymentNeeded"
                      type="text"
                      placeholder="48,000"
                      value={formatCurrency(Math.max(0, annualIncomeGap))}
                      readOnly
                      className="bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground">Auto-calculated: Income gap × 12 months</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inflationRate">Inflation Growth Rate (%)</Label>
                    <Input
                      id="inflationRate"
                      type="number"
                      step="0.1"
                      placeholder="3.0"
                      value={clientData.inflationRate || ""}
                      onChange={(e) => handleClientDataChange("inflationRate", Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">Expected annual inflation rate</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-green-400">Client Goals & Aspirations</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Document your client's specific retirement goals and dreams to ensure the plan aligns with their vision
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Add retirement goals, travel plans, major purchases, or legacy objectives
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addClientGoal}
                      className="flex items-center gap-2 bg-transparent border-green-700/30 text-green-400 hover:bg-green-900/20"
                    >
                      <Plus className="h-4 w-4" />
                      Add Goal
                    </Button>
                  </div>

                  {clientData.clientGoals.length === 0 && (
                    <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">No goals added yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Click "Add Goal" to document client aspirations</p>
                    </div>
                  )}

                  {clientData.clientGoals.map((goal) => (
                    <div key={goal.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-green-700/30 rounded-lg bg-green-900/10">
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor={`goal-${goal.id}`}>Goal Description</Label>
                        <Input
                          id={`goal-${goal.id}`}
                          placeholder="e.g., Travel to Europe, Buy vacation home, Fund grandchildren's education"
                          value={goal.goal}
                          onChange={(e) => updateClientGoal(goal.id, "goal", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`priority-${goal.id}`}>Priority</Label>
                        <select
                          id={`priority-${goal.id}`}
                          className="w-full p-2 border border-input rounded-md bg-background"
                          value={goal.priority}
                          onChange={(e) => updateClientGoal(goal.id, "priority", e.target.value as "high" | "medium" | "low")}
                        >
                          <option value="high">High Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="low">Low Priority</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`timeframe-${goal.id}`}>Timeframe</Label>
                        <Input
                          id={`timeframe-${goal.id}`}
                          placeholder="e.g., Year 1, Years 5-10, Ongoing"
                          value={goal.timeframe}
                          onChange={(e) => updateClientGoal(goal.id, "timeframe", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`cost-${goal.id}`}>Estimated Cost ($)</Label>
                        <div className="flex gap-2">
                          <Input
                            id={`cost-${goal.id}`}
                            type="text"
                            placeholder="50,000"
                            value={goal.estimatedCost ? formatCurrencyInput(goal.estimatedCost) : ""}
                            onChange={(e) => updateClientGoal(goal.id, "estimatedCost", parseCurrency(e.target.value))}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeClientGoal(goal.id)}
                            className="px-2 text-red-400 border-red-700/30 hover:bg-red-900/20"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {clientData.clientGoals.length > 0 && (
                  <div className="p-4 bg-green-900/20 rounded-lg border border-green-700/30">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-400">Total Goals Cost Estimate:</span>
                      <span className="text-lg font-bold text-green-300">
                        ${formatCurrency(clientData.clientGoals.reduce((sum, goal) => sum + goal.estimatedCost, 0))}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    // Generate buckets if not already done
                    if (buckets.length === 0) {
                      const climate = clientData.riskTolerance === "moderate" ? "aggressive" : clientData.riskTolerance
                      const newBuckets = generateInitialBuckets(climate)
                      setBuckets(newBuckets)
                      updateBucketAmounts(clientData.totalAmount)
                    }
                    setCurrentStage(2)
                  }}
                  disabled={!clientData.name || totalInvestibleAssets === 0 || !clientData.riskTolerance}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  Begin Income Cultivation →
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stage 2: Bucket Allocation */}
        <TabsContent value="2" className="space-y-8 relative">
          {/* Allocation Progress Sidebar - Positioned next to first bucket */}
          <Card className="fixed top-80 right-6 z-50 w-64 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-green-500/40 shadow-2xl backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-green-400">
                <TreePine className="h-4 w-4 text-green-500" />
                Allocation Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total Assets</span>
                  <span className="text-sm font-bold text-green-300">${formatCurrency(totalInvestibleAssets)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Allocated</span>
                  <span className="text-sm font-bold text-blue-300">
                    ${formatCurrency(buckets.reduce((sum, bucket) => sum + (bucket.premiumAmount || 0), 0))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Remaining</span>
                  <span className={`text-sm font-bold ${(totalInvestibleAssets - buckets.reduce((sum, bucket) => sum + (bucket.premiumAmount || 0), 0)) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    ${formatCurrency(totalInvestibleAssets - buckets.reduce((sum, bucket) => sum + (bucket.premiumAmount || 0), 0))}
                  </span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Income Needed</span>
                  <span className="text-sm font-bold text-yellow-300">${formatCurrency(annualIncomeGap)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Buckets Used</span>
                  <span className="text-sm font-bold text-purple-300">{buckets.length}</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Allocation Progress</span>
                  <span>{totalInvestibleAssets > 0 ? ((buckets.reduce((sum, bucket) => sum + (bucket.premiumAmount || 0), 0) / totalInvestibleAssets) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${totalInvestibleAssets > 0 ? Math.min((buckets.reduce((sum, bucket) => sum + (bucket.premiumAmount || 0), 0) / totalInvestibleAssets) * 100, 100) : 0}%` 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content - Full Width Like Other Stages */}
          <Card className="border-green-500/30 shadow-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border-2">
                <CardHeader className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-b border-green-700/30">
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <Sun className="h-5 w-5 text-green-600" />
                    Income Cultivation
                  </CardTitle>
                  <CardDescription>
                    Configure each income stream with specific growth parameters and payment schedules
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

               {/* Client Summary Section */}
               <Card className="p-8 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-500/40 shadow-xl backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-400">
                  <TreePine className="h-5 w-5 text-green-500" />
                  Client Investment Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Income Growing Climate</Label>
                    <div className="p-3 bg-green-900/30 rounded-lg border border-green-700/30">
                      <p className="font-semibold text-green-300">
                        {clientData.riskTolerance === "conservative" 
                          ? "🌿 Shade Garden (Conservative Income)" 
                          : "☀️ Full Sun (Growth-Focused Income)"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Total Investable Assets</Label>
                    <div className="p-3 bg-emerald-900/30 rounded-lg border border-emerald-700/30">
                      <p className="text-2xl font-bold text-emerald-300">${formatCurrency(totalInvestibleAssets)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Annual Income Gap</Label>
                    <div className="p-3 bg-yellow-900/30 rounded-lg border border-yellow-700/30">
                      <p className="text-2xl font-bold text-yellow-300">${formatCurrency(annualIncomeGap)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Monthly gap: ${formatCurrency(incomeGap)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {buckets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="p-4 bg-green-900/20 rounded-lg border border-green-700/30 mb-4">
                    <TreePine className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-green-400 font-medium">Please select an Income Growing Climate in Step 1 to generate your investment options</p>
                  </div>
                </div>
              ) : (
                <>
                  {buckets.map((bucket, index) => {
                    const calculatedValues = calculateBucketValues(bucket)
                    const estimatedPremiums = calculateEstimatedPremiums()

                    return (
                      <Card key={bucket.id} className="p-8 border-2 border-green-500/30 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                        <div className="space-y-4">
                          {/* Bucket Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-900/30 rounded-md border border-green-700/30">{bucket.icon}</div>
                              <div>
                                <h4 className="font-semibold text-lg">{bucket.name}</h4>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {bucket.timeframe}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {bucket.investmentType}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            {buckets.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeBucket(bucket.id)}
                                className="text-red-400 border-red-700/30 hover:bg-red-900/20"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                      <Separator />

                      {/* Dynamic Values Section */}
                      <div className="space-y-3">
                        <h5 className="font-medium text-sm text-muted-foreground">Dynamic Input Values</h5>
                        
                        {bucket.investmentType === "Fixed Annuity" ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor={`${bucket.id}-annuity-label`}>Annuity Carrier & Product Name</Label>
                            <Input
                                id={`${bucket.id}-annuity-label`}
                              type="text"
                                placeholder="e.g., New York Life - Secure Income Plus"
                                value={bucket.annuityLabel || ""}
                                onChange={(e) =>
                                  updateBucketField(bucket.id, "annuityLabel", e.target.value)
                                }
                              />
                          </div>

                            <div className="space-y-2">
                              <Label htmlFor={`${bucket.id}-premium`}>Premium Amount ($)</Label>
                              <Input
                                id={`${bucket.id}-premium`}
                                type="text"
                                value={bucket.premiumAmount ? formatCurrencyInput(bucket.premiumAmount) : ""}
                                onChange={(e) =>
                                  updateBucketField(bucket.id, "premiumAmount", parseCurrency(e.target.value))
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`${bucket.id}-rate`}>Rate of Interest (r) %</Label>
                              <Input
                                id={`${bucket.id}-rate`}
                                type="number"
                                step="0.01"
                                value={bucket.interestRate || ""}
                                onChange={(e) => updateBucketField(bucket.id, "interestRate", Number(e.target.value))}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`${bucket.id}-delay`}>Period of Delay (t) Years</Label>
                              <Input
                                id={`${bucket.id}-delay`}
                                type="number"
                                value={bucket.delayPeriod || ""}
                                onChange={(e) => updateBucketField(bucket.id, "delayPeriod", Number(e.target.value))}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`${bucket.id}-payment-delay`}>Payment Delay Period (t)</Label>
                              <Input
                                id={`${bucket.id}-payment-delay`}
                                type="number"
                                value={bucket.paymentDelayPeriod || ""}
                                onChange={(e) =>
                                  updateBucketField(bucket.id, "paymentDelayPeriod", Number(e.target.value))
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`${bucket.id}-periods`}>Number of Income Periods</Label>
                              <Input
                                id={`${bucket.id}-periods`}
                                type="number"
                                value={bucket.incomePeriods || ""}
                                onChange={(e) => updateBucketField(bucket.id, "incomePeriods", Number(e.target.value))}
                              />
                            </div>
                          </div>
                        ) : bucket.investmentType === "Lifetime Income" ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`${bucket.id}-annuity-label`}>Annuity Carrier & Product Name</Label>
                              <Input
                                id={`${bucket.id}-annuity-label`}
                                type="text"
                                placeholder="e.g., New York Life - Lifetime Income Plus"
                                value={bucket.annuityLabel || ""}
                                onChange={(e) =>
                                  updateBucketField(bucket.id, "annuityLabel", e.target.value)
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`${bucket.id}-premium`}>Premium Amount ($)</Label>
                              <Input
                                id={`${bucket.id}-premium`}
                                type="text"
                                value={bucket.premiumAmount ? formatCurrencyInput(bucket.premiumAmount) : ""}
                                onChange={(e) =>
                                  updateBucketField(bucket.id, "premiumAmount", parseCurrency(e.target.value))
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`${bucket.id}-lifetime-type`}>Lifetime Income Type</Label>
                              <select
                                id={`${bucket.id}-lifetime-type`}
                                className="w-full p-2 border border-input rounded-md bg-background"
                                value={bucket.lifetimeIncomeType || "single"}
                                onChange={(e) => updateBucketField(bucket.id, "lifetimeIncomeType", e.target.value as "single" | "joint")}
                              >
                                <option value="single">Single Life</option>
                                <option value="joint">Joint Life</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`${bucket.id}-age-payout`}>Age-based Payout %</Label>
                              <Input
                                id={`${bucket.id}-age-payout`}
                                type="number"
                                step="0.01"
                                placeholder="e.g., 6.5"
                                value={bucket.ageBasedPayoutPercent || ""}
                                onChange={(e) => updateBucketField(bucket.id, "ageBasedPayoutPercent", Number(e.target.value))}
                              />
                              <p className="text-xs text-muted-foreground">
                                Annual payout percentage based on age and life expectancy
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`${bucket.id}-premium`}>Premium Amount ($)</Label>
                              <Input
                                id={`${bucket.id}-premium`}
                                type="text"
                                value={bucket.premiumAmount ? formatCurrencyInput(bucket.premiumAmount) : ""}
                                onChange={(e) =>
                                  updateBucketField(bucket.id, "premiumAmount", parseCurrency(e.target.value))
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`${bucket.id}-rate`}>Rate of Interest (r) %</Label>
                              <Input
                                id={`${bucket.id}-rate`}
                                type="number"
                                step="0.01"
                                value={bucket.interestRate || ""}
                                onChange={(e) => updateBucketField(bucket.id, "interestRate", Number(e.target.value))}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`${bucket.id}-delay`}>Period of Delay (t) Years</Label>
                              <Input
                                id={`${bucket.id}-delay`}
                                type="number"
                                value={bucket.delayPeriod || ""}
                                onChange={(e) => updateBucketField(bucket.id, "delayPeriod", Number(e.target.value))}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`${bucket.id}-risk-tolerance`}>Risk Tolerance</Label>
                              <select
                                id={`${bucket.id}-risk-tolerance`}
                                className="w-full p-2 border border-input rounded-md bg-background"
                                value={bucket.riskTolerance || "moderate"}
                                onChange={(e) => updateBucketField(bucket.id, "riskTolerance", e.target.value as "conservative" | "moderate" | "aggressive")}
                              >
                                <option value="conservative">Conservative</option>
                                <option value="moderate">Moderate</option>
                                <option value="aggressive">Aggressive</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Premium Amount Slider Section */}
                      <div className="space-y-3">
                        <h5 className="font-medium text-sm text-muted-foreground">Premium Amount Allocation</h5>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`${bucket.id}-premium-slider`}>Premium Amount ($)</Label>
                            <span className="text-lg font-bold text-green-600">${formatCurrency(bucket.premiumAmount || 0)}</span>
                          </div>
                          <input
                            id={`${bucket.id}-premium-slider`}
                            type="range"
                            min="0"
                            max={clientData.totalAmount}
                            step="1000"
                            value={bucket.premiumAmount || 0}
                            onChange={(e) => updateBucketField(bucket.id, "premiumAmount", Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                              background: `linear-gradient(to right, #16a34a 0%, #16a34a ${((bucket.premiumAmount || 0) / clientData.totalAmount) * 100}%, #e5e7eb ${((bucket.premiumAmount || 0) / clientData.totalAmount) * 100}%, #e5e7eb 100%)`
                            }}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>$0</span>
                            <span>${formatCurrency(clientData.totalAmount / 2)}</span>
                            <span>${formatCurrency(clientData.totalAmount)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Percentage of total: {clientData.totalAmount > 0 ? (((bucket.premiumAmount || 0) / clientData.totalAmount) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                      </div>

                      <Separator />

                      {/* Fixed Values Section */}
                      <div className="space-y-3">
                        <h5 className="font-medium text-sm text-muted-foreground">Fixed Calculated Values</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                          <div className="space-y-2">
                            <Label>Future Value (Calculated)</Label>
                            <Input
                              type="text"
                              value={`$${formatCurrency(calculatedValues.futureValue)}`}
                              readOnly
                              className="bg-muted/50 font-medium"
                            />
                            <p className="text-xs text-muted-foreground">Premium × (1 + Rate)^Delay Period</p>
                          </div>

                          {bucket.investmentType === "Fixed Annuity" && (
                            <>
                              <div className="space-y-2">
                                <Label>Payments (Calculated)</Label>
                                <Input
                                  type="text"
                                  value={`$${formatCurrency(calculatedValues.payments)}`}
                                  readOnly
                                  className="bg-muted/50 font-medium"
                                />
                                <p className="text-xs text-muted-foreground">
                                  (Future Value ÷ Income Periods) × (1 + Rate)
                                </p>
                              </div>

                              <div className="space-y-2">
                                <Label>Income Solve (Calculated)</Label>
                                <Input
                                  type="text"
                                  value={`$${formatCurrency(calculatedValues.incomeSolve)}`}
                                  readOnly
                                  className="bg-green-900/30 border-green-700/30 font-bold text-lg text-green-300"
                                />
                                <p className="text-xs text-muted-foreground">Payments - Taxes</p>
                              </div>
                            </>
                          )}

                          {bucket.investmentType === "Lifetime Income" && (
                            <div className="space-y-2">
                              <Label>Net Lifetime Income (Calculated)</Label>
                              <Input
                                type="text"
                                value={`$${formatCurrency(calculatedValues.incomeSolve)}`}
                                readOnly
                                className="bg-purple-900/30 border-purple-700/30 font-bold text-lg text-purple-300"
                              />
                              <p className="text-xs text-muted-foreground">Annual lifetime income after taxes</p>
                            </div>
                          )}

                          {bucket.investmentType === "Brokerage Portfolio" && (
                            <div className="space-y-2">
                              <Label>Projected Portfolio Value</Label>
                              <Input
                                type="text"
                                value={`$${formatCurrency(calculatedValues.futureValue)}`}
                                readOnly
                                className="bg-green-900/30 border-green-700/30 font-bold text-lg text-green-300"
                              />
                              <p className="text-xs text-muted-foreground">Growth-based portfolio value</p>
                            </div>
                          )}
                        </div>
                      </div>
                        </div>
                      </Card>
                    )
                  })}

                  {/* Add New Section Buttons */}
                  <div className="flex justify-center pt-4 gap-3">
                    {clientData.riskTolerance === "conservative" ? (
                      <Button
                        variant="outline"
                        onClick={() => addNewBucket("conservative", "annuity")}
                        className="border-green-700/30 text-green-400 hover:bg-green-900/20 flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Another Annuity
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => addNewBucket("aggressive", "annuity")}
                          className="border-green-700/30 text-green-400 hover:bg-green-900/20 flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Growth Annuity
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => addNewBucket("aggressive", "portfolio")}
                          className="border-blue-700/30 text-blue-400 hover:bg-blue-900/20 flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Growth Portfolio
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => addNewBucket("aggressive", "lifetime")}
                          className="border-purple-700/30 text-purple-400 hover:bg-purple-900/20 flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Lifetime Income
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setCurrentStage(1)} className="border-green-300 text-green-700 hover:bg-transparent">
                  ← Back to Client Info
                </Button>
                <Button onClick={() => setCurrentStage(3)} className="bg-green-600 hover:bg-green-700 text-white flex-1 shadow-lg hover:shadow-xl transition-all">
                  Review Complete Plan →
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stage 3: Review & Finalize */}
        <TabsContent value="3" className="space-y-8">
          <Card className="border-2 border-green-500/30 shadow-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-900/30 via-emerald-900/30 to-green-900/30 border-b-2 border-green-700/30 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl flex items-center gap-3 mb-2 text-green-400">
                    <div className="p-3 bg-m8bs-card-alt rounded-xl shadow-md border border-green-700/30">
                      <TreePine className="h-8 w-8 text-green-500" />
                    </div>
                    Evergreen Income Garden
                  </CardTitle>
                  <CardDescription className="text-lg">
                    A 16+ Year Prosperity Plan for {clientData.name || "Your Client"}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Retirement Age</p>
                      <p className="text-2xl font-bold text-green-300">{clientData.retirementAge}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Income Start Age</p>
                      <p className="text-2xl font-bold text-green-300">{clientData.incomeStartAge}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-2 border-green-500/40 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 bg-green-900/30 rounded-2xl border border-green-700/30">
                      <Sprout className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="w-full">
                      <p className="text-sm text-muted-foreground mb-1">Total Investment</p>
                      <p className="text-2xl font-bold text-green-300 break-words">${formatCurrency(totalInvestibleAssets)}</p>
                      <p className="text-xs text-muted-foreground mt-2">Seeds planted for growth</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-2 border-emerald-500/40 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 bg-emerald-900/30 rounded-2xl border border-emerald-700/30">
                      <TreePine className="h-8 w-8 text-emerald-500" />
                    </div>
                    <div className="w-full">
                      <p className="text-sm text-muted-foreground mb-1">Future Harvest</p>
                      <p className="text-2xl font-bold text-emerald-300 break-words">
                        ${formatCurrency(buckets.reduce((sum, b) => sum + calculateBucketValues(b).futureValue, 0))}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">Projected portfolio value</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-2 border-yellow-500/40 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 bg-yellow-900/30 rounded-2xl border border-yellow-700/30">
                      <Flower className="h-8 w-8 text-yellow-500" />
                    </div>
                    <div className="w-full">
                      <p className="text-sm text-muted-foreground mb-1">Annual Income Need</p>
                      <p className="text-2xl font-bold text-yellow-300 break-words">${formatCurrency(annualIncomeGap)}</p>
                      <p className="text-xs text-muted-foreground mt-2">Gap to fill each year</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-2 border-blue-500/40 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 bg-blue-900/30 rounded-2xl border border-blue-700/30">
                      <Droplets className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="w-full">
                      <p className="text-sm text-muted-foreground mb-1">Total Income Generated</p>
                      <p className="text-2xl font-bold text-blue-300 break-words">
                        ${formatCurrency(buckets.reduce((sum, b) => sum + calculateBucketValues(b).incomeSolve, 0))}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">Annual income from all sources</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Visual Timeline - Large and Prominent */}
              <Card className="p-8 bg-m8bs-card border-2 border-green-700/30 shadow-lg">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-green-400">
                  <div className="p-2 bg-m8bs-card-alt rounded-lg shadow-sm border border-green-700/30">
                    <Sun className="h-6 w-6 text-green-500" />
                  </div>
                  Your 16+ Year Income Timeline
                </h2>

                <div className="space-y-8">
                  {/* Timeline Visual */}
                  <div className="relative py-8">
                    {/* Timeline Base Line */}
                    <div className="absolute top-16 left-8 right-8 h-3 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 rounded-full shadow-lg shadow-green-200" />

                    {/* Timeline Stages */}
                    <div className={`grid gap-6 relative z-10 ${buckets.length === 1 ? 'grid-cols-1' : buckets.length === 2 ? 'grid-cols-2' : buckets.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                      {buckets.map((bucket, index) => {
                        const values = calculateBucketValues(bucket)
                        const incomeStartDelay = Math.max(1, clientData.incomeStartAge - clientData.retirementAge)
                        
                        // Dynamic year ranges based on bucket count and income start age
                        const yearRanges = buckets.length === 1 
                          ? [`${incomeStartDelay}+`] 
                          : buckets.length === 2
                          ? [`${incomeStartDelay}-${incomeStartDelay + 5}`, `${incomeStartDelay + 6}+`]
                          : buckets.length === 3
                          ? [`${incomeStartDelay}-${incomeStartDelay + 4}`, `${incomeStartDelay + 5}-${incomeStartDelay + 9}`, `${incomeStartDelay + 10}+`]
                          : [`${incomeStartDelay}-${incomeStartDelay + 4}`, `${incomeStartDelay + 5}-${incomeStartDelay + 9}`, `${incomeStartDelay + 10}-${incomeStartDelay + 14}`, `${incomeStartDelay + 15}+`]

                        return (
                          <div key={bucket.id} className="flex flex-col items-center">
                            {/* Enhanced Large Plant Icon */}
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-green-500 shadow-2xl shadow-green-900/50 flex items-center justify-center mb-4 hover:scale-110 transition-all duration-300 hover:shadow-green-500/30 hover:border-green-400">
                              <div className="text-green-400 scale-150 drop-shadow-lg">{bucket.icon}</div>
                            </div>

                            {/* Year Badge */}
                            <Badge className="mb-2 text-base px-4 py-1 bg-green-700 text-white shadow-md border-green-600">
                              Years {yearRanges[index]}
                            </Badge>

                            {/* Stage Name */}
                            <p className="text-center font-semibold text-lg mb-1">{bucket.growthStage}</p>
                            <p className="text-center text-sm text-muted-foreground mb-4">{bucket.investmentType}</p>

                            {/* Key Metric Card */}
                            <Card className="w-full p-4 bg-m8bs-card shadow-md hover:shadow-xl transition-shadow border-2 border-green-700/30">
                              <div className="text-center space-y-2">
                                <p className="text-xs text-muted-foreground">Annual Income</p>
                                <p className="text-2xl font-bold text-green-300">
                                  ${formatCurrency(values.incomeSolve)}
                                </p>
                                <Separator className="my-2" />
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Investment</span>
                                    <span className="font-medium">${formatCurrency(bucket.premiumAmount)}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Growth Rate</span>
                                    <span className="font-medium text-green-600">{bucket.interestRate}%</span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                </div>
              </Card>

              {/* Income Distribution Visualization */}
              <Card className="p-8 bg-m8bs-card border-2 border-green-700/30 shadow-lg">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-green-400">
                  <div className="p-2 bg-m8bs-card-alt rounded-lg shadow-sm border border-green-700/30">
                    <Leaf className="h-6 w-6 text-green-500" />
                  </div>
                  Investment Allocation Breakdown
                </h2>

                <div className="space-y-6">
                  {buckets.map((bucket, index) => {
                    const values = calculateBucketValues(bucket)
                    const estimatedPremiums = calculateEstimatedPremiums()
                    const percentage = (estimatedPremiums[index] / totalInvestibleAssets) * 100

                    return (
                      <div key={bucket.id} className="space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-m8bs-card-alt rounded-xl shadow-md border border-green-700/30">{bucket.icon}</div>
                            <div>
                              <p className="font-bold text-lg">{bucket.name}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {bucket.timeframe}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {bucket.investmentType}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Initial Investment</p>
                            <p className="text-lg font-bold text-green-400">
                              ${formatCurrency(estimatedPremiums[index])}
                            </p>
                            <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}% of portfolio</p>
                          </div>
                        </div>

                        {/* Large Visual Progress Bar */}
                        <div className="relative">
                          <div className="h-14 bg-m8bs-card-alt rounded-xl overflow-hidden border-2 border-green-700/30 shadow-lg">
                            <div
                              className="h-full bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 flex items-center justify-center transition-all duration-700 ease-out shadow-inner"
                              style={{ width: `${percentage}%` }}
                            >
                              <span className="text-xl font-bold text-white drop-shadow-lg">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Future Value Emphasis */}
                        <Card className="p-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-600/50 shadow-lg">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-2">Projected Future Value</p>
                            <p className="text-4xl font-bold text-green-300 mb-2">
                              ${formatCurrency(values.futureValue)}
                            </p>
                            <p className="text-xs text-green-400">
                              {bucket.investmentType === "Fixed Annuity" 
                                ? "Guaranteed growth over time" 
                                : "Growth-based portfolio appreciation"}
                            </p>
                          </div>
                        </Card>

                        {/* Additional Metrics Grid - Only for Fixed Annuities */}
                        {bucket.investmentType === "Fixed Annuity" && (
                          <div className="grid grid-cols-3 gap-3">
                            <Card className="p-4 bg-m8bs-card-alt shadow-sm border-l-4 border-l-blue-500">
                              <p className="text-xs text-muted-foreground mb-1">Annual Payment</p>
                              <p className="text-lg font-bold text-blue-400">
                                ${formatCurrency(values.annuityPayment)}
                              </p>
                            </Card>
                            <Card className="p-4 bg-m8bs-card-alt shadow-sm border-l-4 border-l-green-500">
                              <p className="text-xs text-muted-foreground mb-1">Gross Income</p>
                              <p className="text-lg font-bold text-green-400">
                                ${formatCurrency(values.payments)}
                              </p>
                            </Card>
                            <Card className="p-4 bg-m8bs-card-alt shadow-md border-l-4 border-l-yellow-500">
                              <p className="text-xs text-muted-foreground mb-1">Net Income</p>
                              <p className="text-lg font-bold text-yellow-400">
                                ${formatCurrency(values.incomeSolve)}
                              </p>
                            </Card>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Total Summary */}
                <Separator className="my-6" />
                <Card className="p-6 bg-m8bs-card shadow-xl border-2 border-green-700/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-green-900/30 rounded-2xl border border-green-700/30">
                        <TreePine className="h-10 w-10 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Portfolio Investment</p>
                        <p className="text-4xl font-bold text-green-300">${formatCurrency(totalInvestibleAssets)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Projected Total Growth</p>
                      <p className="text-4xl font-bold text-green-400">
                        ${formatCurrency(buckets.reduce((sum, b) => sum + calculateBucketValues(b).futureValue, 0))}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 h-6 bg-green-900/30 rounded-full overflow-hidden border border-green-700/30">
                    <div className="h-full bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 w-full animate-pulse shadow-inner" />
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-3">
                    🌱 Fully diversified across 4 income streams for sustainable retirement prosperity
                  </p>
                </Card>
              </Card>

              {/* Income Flow Chart */}
              <Card className="p-8 bg-m8bs-card border-2 border-blue-700/30 shadow-lg">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-blue-400">
                  <div className="p-2 bg-m8bs-card-alt rounded-lg shadow-sm border border-blue-700/30">
                    <Droplets className="h-6 w-6 text-blue-500" />
                  </div>
                  Annual Income Flow Analysis
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Income Sources */}
                  <Card className="p-6 bg-m8bs-card-alt shadow-md">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Sprout className="h-5 w-5 text-green-500" />
                      Current Income Sources
                    </h3>
                    <div className="space-y-3">
                      {clientData.incomeSources.map((source) => (
                        <div key={source.id} className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg border border-green-700/20">
                          <span className="font-medium">{source.name || "Income Source"}</span>
                          <span className="text-lg font-bold text-green-400">${formatCurrency(source.amount)}/mo</span>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex items-center justify-between p-3 bg-green-900/30 rounded-lg border border-green-700/30">
                        <span className="font-bold">Total Monthly Income</span>
                        <span className="text-xl font-bold text-green-300">${formatCurrency(totalCurrentIncome)}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Income Gap Analysis */}
                  <Card className="p-6 bg-m8bs-card-alt shadow-md">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Flower className="h-5 w-5 text-yellow-500" />
                      Income Gap Analysis
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
                        <p className="text-sm text-muted-foreground mb-1">Desired Monthly Income</p>
                        <p className="text-2xl font-bold text-blue-400">
                          ${formatCurrency(clientData.desiredMonthlyIncome)}
                        </p>
                      </div>
                      <div className="p-4 bg-orange-900/20 rounded-lg border border-orange-700/30">
                        <p className="text-sm text-muted-foreground mb-1">Monthly Income Gap</p>
                        <p className="text-2xl font-bold text-orange-400">${formatCurrency(incomeGap)}</p>
                      </div>
                      <div className="p-4 bg-yellow-900/30 rounded-lg border-2 border-yellow-600/50">
                        <p className="text-sm text-muted-foreground mb-1">Annual Income Needed</p>
                        <p className="text-3xl font-bold text-yellow-400">${formatCurrency(annualIncomeGap)}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </Card>

              {/* Client Goals Section */}
              {clientData.clientGoals.length > 0 && (
                <Card className="p-8 bg-m8bs-card border-2 border-purple-700/30 shadow-lg">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-purple-400">
                    <div className="p-2 bg-m8bs-card-alt rounded-lg shadow-sm border border-purple-700/30">
                      <Sun className="h-6 w-6 text-purple-500" />
                    </div>
                    Client Goals & Aspirations
                  </h2>

                  <div className="space-y-4">
                    {clientData.clientGoals.map((goal, index) => (
                      <Card key={goal.id} className="p-6 bg-m8bs-card-alt shadow-md border border-purple-700/20">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-900/30 border border-purple-700/30 flex items-center justify-center">
                              <span className="text-sm font-bold text-purple-400">{index + 1}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-purple-300">{goal.goal}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    goal.priority === "high" 
                                      ? "border-red-700/30 text-red-400" 
                                      : goal.priority === "medium"
                                      ? "border-yellow-700/30 text-yellow-400"
                                      : "border-green-700/30 text-green-400"
                                  }`}
                                >
                                  {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {goal.timeframe}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Estimated Cost</p>
                            <p className="text-2xl font-bold text-purple-300">
                              ${formatCurrency(goal.estimatedCost)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Goal Description</p>
                            <p className="text-sm">{goal.goal}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Implementation Strategy</p>
                            <p className="text-sm">
                              {goal.priority === "high" 
                                ? "Priority funding through early income streams" 
                                : goal.priority === "medium"
                                ? "Balanced approach using mid-term income"
                                : "Flexible funding as resources allow"}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}

                    {/* Goals Summary */}
                    <Card className="p-6 bg-m8bs-card-alt shadow-lg border-2 border-purple-700/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-4 bg-purple-900/30 rounded-2xl border border-purple-700/30">
                            <Sun className="h-8 w-8 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Goals Cost Estimate</p>
                            <p className="text-3xl font-bold text-purple-300">
                              ${formatCurrency(clientData.clientGoals.reduce((sum, goal) => sum + goal.estimatedCost, 0))}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Goals Count</p>
                          <p className="text-3xl font-bold text-purple-300">{clientData.clientGoals.length}</p>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
                        <p className="text-center text-sm text-purple-300">
                          🌟 These goals help shape the retirement income strategy to ensure your client's dreams become reality
                        </p>
                      </div>
                    </Card>
                  </div>
                </Card>
              )}

              {/* Enhanced Investment Allocation Pie Chart */}
              <Card className="p-8 bg-gradient-to-br from-m8bs-card/90 to-m8bs-card-alt/90 border-2 border-m8bs-card-alt/50 shadow-2xl backdrop-blur-sm transform hover:scale-[1.01] transition-all duration-300">
                <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-green-300">
                  <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                    <TreePine className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>
                  Investment Allocation Breakdown
                  <div className="ml-auto">
                    <TrendingUp className="h-6 w-6 text-green-400 drop-shadow-lg" />
                  </div>
                </h2>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                  {/* Pie Chart */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-300">Portfolio Distribution</h3>
                    <div className="h-80 sm:h-96 bg-gradient-to-br from-m8bs-card/50 to-m8bs-card-alt/50 rounded-2xl p-4 sm:p-6 border border-m8bs-card-alt/30 shadow-lg">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={buckets.map((bucket, index) => {
                              const values = calculateBucketValues(bucket)
                              const actualValue = bucket.premiumAmount || values.estimatedPremium
                              const totalAllocated = buckets.reduce((sum, b) => sum + (b.premiumAmount || 0), 0) || totalInvestibleAssets
                              return {
                                name: bucket.name,
                                value: actualValue,
                                percentage: ((actualValue / totalAllocated) * 100).toFixed(1)
                              }
                            })}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                            outerRadius={140}
                            innerRadius={50}
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={1000}
                          >
                            {buckets.map((bucket, index) => {
                              const colors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4"]
                              return (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={colors[index % colors.length]}
                                  stroke="#ffffff"
                                  strokeWidth={3}
                                  className="drop-shadow-lg"
                                />
                              )
                            })}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => formatCurrency(Number(value))}
                            contentStyle={{
                              backgroundColor: 'rgba(15, 23, 42, 0.95)',
                              border: '2px solid rgba(34, 197, 94, 0.3)',
                              borderRadius: '12px',
                              color: '#ffffff',
                              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                              backdropFilter: 'blur(10px)'
                            }}
                            labelStyle={{
                              color: '#10B981',
                              fontWeight: 'bold'
                            }}
                          />
                          <Legend 
                            wrapperStyle={{
                              color: '#ffffff',
                              fontSize: '14px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Enhanced Investment Details Table */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-green-300 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Investment Details
                    </h3>
                    <div className="space-y-4">
                      {buckets.map((bucket, index) => {
                        const values = calculateBucketValues(bucket)
                        const percentage = ((values.estimatedPremium / totalInvestibleAssets) * 100).toFixed(1)
                        const colors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4"]
                        return (
                          <div key={bucket.id} className="group flex items-center justify-between p-6 bg-gradient-to-r from-slate-800/30 to-slate-900/30 rounded-2xl border border-green-700/20 hover:border-green-500/40 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="w-6 h-6 rounded-full shadow-lg" style={{ backgroundColor: colors[index % colors.length] }} />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                              </div>
                              <div>
                                <span className="font-bold text-lg text-white">{bucket.name}</span>
                                <div className="text-sm text-green-300">{bucket.description}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-2xl text-green-300">${formatCurrency(values.estimatedPremium)}</div>
                              <div className="text-sm text-green-400 font-medium">{percentage}%</div>
                              <div className="text-xs text-slate-400 mt-1">{bucket.riskTolerance} risk</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Enhanced Income Projection Charts */}
              <Card className="p-8 bg-gradient-to-br from-m8bs-card/90 to-m8bs-card-alt/90 border-2 border-m8bs-card-alt/50 shadow-2xl backdrop-blur-sm transform hover:scale-[1.01] transition-all duration-300">
                <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-blue-300">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg">
                    <Droplets className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>
                  Income Projection Analysis
                  <div className="ml-auto">
                    <Zap className="h-6 w-6 text-blue-400 drop-shadow-lg" />
                  </div>
                </h2>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                  {/* Enhanced Annual Income by Bucket */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-blue-300 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Annual Income by Investment
                    </h3>
                    <div className="h-80 sm:h-96 bg-gradient-to-br from-m8bs-card/30 to-m8bs-card-alt/30 rounded-2xl p-4 sm:p-6 border border-m8bs-card-alt/20">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={buckets.map((bucket) => {
                          const values = calculateBucketValues(bucket)
                          return {
                            name: bucket.name.length > 15 ? bucket.name.substring(0, 15) + "..." : bucket.name,
                            income: values.incomeSolve,
                            gross: values.payments,
                            net: values.incomeSolve
                          }
                        })}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
                          <YAxis tick={{ fill: '#9CA3AF' }} />
                          <Tooltip 
                            formatter={(value) => formatCurrency(Number(value))}
                            contentStyle={{
                              backgroundColor: 'rgba(15, 23, 42, 0.95)',
                              border: '2px solid rgba(59, 130, 246, 0.3)',
                              borderRadius: '12px',
                              color: '#ffffff',
                              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                              backdropFilter: 'blur(10px)'
                            }}
                          />
                          <Legend 
                            wrapperStyle={{
                              color: '#ffffff',
                              fontSize: '14px'
                            }}
                          />
                          <Bar dataKey="gross" fill="#3b82f6" name="Gross Income" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="net" fill="#10b981" name="Net Income" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Enhanced Growth Projection Over Time */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-blue-300 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Growth Projection Timeline
                    </h3>
                    <div className="h-80 sm:h-96 bg-gradient-to-br from-m8bs-card/30 to-m8bs-card-alt/30 rounded-2xl p-4 sm:p-6 border border-m8bs-card-alt/20">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={Array.from({ length: 20 }, (_, i) => {
                          const year = i + 1
                          const totalGrowth = buckets.reduce((sum, bucket) => {
                            const values = calculateBucketValues(bucket)
                            const growth = values.estimatedPremium * Math.pow(1 + bucket.interestRate / 100, year)
                            return sum + growth
                          }, 0)
                          return {
                            year: `Year ${year}`,
                            value: totalGrowth,
                            investment: totalInvestibleAssets
                          }
                        })}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="year" tick={{ fill: '#9CA3AF' }} />
                          <YAxis tick={{ fill: '#9CA3AF' }} />
                          <Tooltip 
                            formatter={(value) => formatCurrency(Number(value))}
                            contentStyle={{
                              backgroundColor: 'rgba(15, 23, 42, 0.95)',
                              border: '2px solid rgba(16, 185, 129, 0.3)',
                              borderRadius: '12px',
                              color: '#ffffff',
                              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                              backdropFilter: 'blur(10px)'
                            }}
                          />
                          <Legend 
                            wrapperStyle={{
                              color: '#ffffff',
                              fontSize: '14px'
                            }}
                          />
                          <Line type="monotone" dataKey="investment" stroke="#6b7280" name="Initial Investment" strokeDasharray="5 5" strokeWidth={2} />
                          <Line type="monotone" dataKey="value" stroke="#10b981" name="Projected Value" strokeWidth={4} dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Enhanced Risk Analysis and Performance Metrics */}
              <Card className="p-8 bg-gradient-to-br from-m8bs-card/90 to-m8bs-card-alt/90 border-2 border-m8bs-card-alt/50 shadow-2xl backdrop-blur-sm transform hover:scale-[1.01] transition-all duration-300">
                <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-yellow-300">
                  <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg">
                    <Sun className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>
                  Risk Analysis & Performance Metrics
                  <div className="ml-auto">
                    <Star className="h-6 w-6 text-yellow-400 drop-shadow-lg" />
                  </div>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Risk Distribution */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-yellow-300">Risk Distribution</h3>
                    <div className="space-y-3">
                      {["conservative", "moderate", "aggressive"].map((risk) => {
                        const riskBuckets = buckets.filter(b => b.riskTolerance === risk)
                        const totalRiskAmount = riskBuckets.reduce((sum, bucket) => {
                          const values = calculateBucketValues(bucket)
                          return sum + values.estimatedPremium
                        }, 0)
                        const percentage = totalInvestibleAssets > 0 ? ((totalRiskAmount / totalInvestibleAssets) * 100).toFixed(1) : "0"
                        
                        return (
                          <div key={risk} className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-700/20">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium capitalize">{risk}</span>
                              <span className="text-sm text-muted-foreground">{percentage}%</span>
                            </div>
                            <div className="w-full bg-yellow-900/30 rounded-full h-2">
                              <div 
                                className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="text-sm text-yellow-300 mt-1">
                              ${formatCurrency(totalRiskAmount)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Investment Type Breakdown */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-yellow-300">Investment Types</h3>
                    <div className="space-y-3">
                      {Array.from(new Set(buckets.map(b => b.investmentType))).map((type) => {
                        const typeBuckets = buckets.filter(b => b.investmentType === type)
                        const totalTypeAmount = typeBuckets.reduce((sum, bucket) => {
                          const values = calculateBucketValues(bucket)
                          return sum + values.estimatedPremium
                        }, 0)
                        const percentage = totalInvestibleAssets > 0 ? ((totalTypeAmount / totalInvestibleAssets) * 100).toFixed(1) : "0"
                        
                        return (
                          <div key={type} className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-700/20">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">{type}</span>
                              <span className="text-sm text-muted-foreground">{percentage}%</span>
                            </div>
                            <div className="w-full bg-yellow-900/30 rounded-full h-2">
                              <div 
                                className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="text-sm text-yellow-300 mt-1">
                              ${formatCurrency(totalTypeAmount)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Performance Summary */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-yellow-300">Performance Summary</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-700/20">
                        <div className="text-sm text-muted-foreground mb-1">Total Investment</div>
                        <div className="text-2xl font-bold text-yellow-300">${formatCurrency(totalInvestibleAssets)}</div>
                      </div>
                      <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-700/20">
                        <div className="text-sm text-muted-foreground mb-1">Projected Value</div>
                        <div className="text-2xl font-bold text-yellow-300">
                          ${formatCurrency(buckets.reduce((sum, b) => sum + calculateBucketValues(b).futureValue, 0))}
                        </div>
                      </div>
                      <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-700/20">
                        <div className="text-sm text-muted-foreground mb-1">Total Annual Income</div>
                        <div className="text-2xl font-bold text-yellow-300">
                          ${formatCurrency(buckets.reduce((sum, b) => sum + calculateBucketValues(b).incomeSolve, 0))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Enhanced Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-8">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStage(2)} 
                  className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 border-green-400 text-green-300 hover:bg-green-500/10 hover:border-green-300 transition-all duration-300 transform hover:scale-105"
                >
                  ← Edit Plan
                </Button>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex-1 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105">
                  <TreePine className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                  Generate Final Report
                </Button>
                <Button 
                  variant="outline" 
                  className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 bg-transparent border-green-400 text-green-300 hover:bg-green-500/10 hover:border-green-300 transition-all duration-300 transform hover:scale-105"
                >
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
    </TooltipProvider>
  )
}
