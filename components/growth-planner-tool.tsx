
"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sprout, TreePine, Leaf, Flower, Heading as Seedling, Sun, Droplets, Plus, X, TrendingUp, Shield, Target, Zap, Star, Sparkles, Calculator } from "lucide-react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts"
import { clientPlanService, type PlanData } from "@/lib/client-plans"
import { pdfGenerator } from "@/lib/pdf-generator"
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"

interface BucketData {
  id: string
  name: string
  percentage: number
  amount: number
  color: string
  icon: string // Changed from React.ReactNode to string
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
  inflationRate?: number
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

// Icon mapping function
const getIcon = (iconName: string, className: string = "h-6 w-6"): React.ReactNode => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'sprout': <Sprout className={className} />,
    'sun': <Sun className={className} />,
    'droplets': <Droplets className={className} />,
    'leaf': <Leaf className={className} />,
    'tree-pine': <TreePine className={className} />,
    'flower': <Flower className={className} />,
    'trending-up': <TrendingUp className={className} />,
    'shield': <Shield className={className} />,
    'target': <Target className={className} />,
    'zap': <Zap className={className} />,
    'star': <Star className={className} />,
    'sparkles': <Sparkles className={className} />,
  }
  return iconMap[iconName] || <Sprout className={className} />
}

export function GrowthPlannerTool() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setProfile(null)
        setProfileLoading(false)
        return
      }
      setProfileLoading(true)
      const supabase = createClient()
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      setProfile(profileData)
      setProfileLoading(false)
    }
    fetchProfile()
  }, [user])

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
  const containerRef = useRef<HTMLDivElement>(null)
  const pieChartRef = useRef<HTMLDivElement>(null)
  const barChartRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const bucketsContainerRef = useRef<HTMLDivElement>(null)
  
  // Refs for hidden light mode charts for PDF export
  const pdfPieChartRef = useRef<HTMLDivElement>(null)
  const pdfBarChartRef = useRef<HTMLDivElement>(null)
  const pdfTimelineRef = useRef<HTMLDivElement>(null)

  const scrollToTop = () => {
    setTimeout(() => {
      // Try multiple scroll methods
      window.scrollTo({ top: 0, behavior: 'smooth' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      
      // Also try scrolling to the container
      if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 300)
  }

  // Scroll to top when stage changes
  useEffect(() => {
    scrollToTop()
  }, [currentStage])


  // Load editing plan data if present
  useEffect(() => {
    const editingPlan = sessionStorage.getItem('editingPlan')
    if (editingPlan) {
      try {
        const planData = JSON.parse(editingPlan)
        setClientData(planData.clientData)
        setBuckets(planData.buckets)
        setCalculationResults(planData.calculationResults)
        setEditingPlanId(planData.id)
        setCurrentStage(3) // Go directly to the review stage
        // Clear the session storage
        sessionStorage.removeItem('editingPlan')
      } catch (error) {
        console.error('Error loading editing plan:', error)
      }
    }
  }, [])

  const handleSavePlan = async () => {
    if (!clientData.name || buckets.length === 0) {
      setSaveError('Please complete the plan before saving')
      return
    }

    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      const planData: PlanData = {
        clientData,
        buckets,
        calculationResults
      }

      let result
      if (editingPlanId) {
        // Update existing plan
        result = await clientPlanService.updatePlan(
          editingPlanId,
          planData,
          clientData.name,
          `${clientData.name}'s Retirement Plan`
        )
      } else {
        // Create new plan
        result = await clientPlanService.savePlan(
          planData,
          clientData.name,
          `${clientData.name}'s Retirement Plan`
        )
      }

      if (result.success) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
        // Clear editing state after successful save
        if (editingPlanId) {
          setEditingPlanId(null)
        }
      } else {
        setSaveError(result.error || 'Failed to save plan')
      }
    } catch (error) {
      console.error('Error saving plan:', error)
      setSaveError('Failed to save plan')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!clientData.name || buckets.length === 0) {
      setSaveError('Please complete the plan before downloading')
      return
    }

    try {
      const planData: PlanData = {
        clientData,
        buckets,
        calculationResults
      }

      // Capture chart elements - use hidden light mode versions for PDF
      const chartElements = {
        pieChart: pdfPieChartRef.current || pieChartRef.current || undefined,
        barChart: pdfBarChartRef.current || barChartRef.current || undefined,
        timeline: pdfTimelineRef.current || timelineRef.current || undefined
      }

      await pdfGenerator.downloadPDF(
        planData,
        clientData.name,
        `${clientData.name}'s Retirement Plan`,
        chartElements,
        profile?.company
      )
    } catch (error) {
      console.error('Error generating PDF:', error)
      setSaveError('Failed to generate PDF')
    }
  }
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

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)

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
      icon: "sprout",
    },
    {
      id: 2,
      title: "Cultivate Income Streams",
      description: `Design the ${clientData.timeHorizon || 16}+ year retirement income garden`,
      icon: "sun",
    },
    {
      id: 3,
      title: "Harvest Retirement Plan",
      description: "Finalize the lifetime income strategy",
      icon: "droplets",
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

  const generateInitialBuckets = (climate: "conservative" | "aggressive", customTimeHorizon?: number) => {
    const incomeStartDelay = Math.max(1, clientData.incomeStartAge - clientData.retirementAge)
    const planningYears = customTimeHorizon || clientData.timeHorizon || 16
    
    if (climate === "conservative") {
      // Shade Garden: 3 growth annuity buckets + 1 lifetime income annuity
      const year2Start = incomeStartDelay
      const year7Start = Math.max(year2Start + 5, incomeStartDelay + 5)
      const year12Start = Math.max(year7Start + 5, incomeStartDelay + 10)
      const finalYearStart = Math.max(year12Start + 4, incomeStartDelay + planningYears - 2)
      
      return [
        {
          id: "conservative-annuity-1",
          name: "Early Growth Annuity",
          percentage: 25,
          amount: 0,
          color: "#3B82F6",
          icon: "sprout",
          description: "Conservative fixed annuity providing steady, guaranteed income for early retirement years",
          growthStage: "Early Growth",
          timeframe: `Years ${year2Start}-${year7Start - 1}`,
          investmentType: "Fixed Annuity",
          premiumAmount: 0,
          interestRate: 4.5,
          delayPeriod: year2Start,
          incomePeriods: year7Start - year2Start,
          paymentDelayPeriod: year2Start * 12,
          annuityLabel: "",
          riskTolerance: "conservative" as const,
        },
        {
          id: "conservative-annuity-2",
          name: "Mid Growth Annuity",
          percentage: 25,
          amount: 0,
          color: "#10B981",
          icon: "leaf",
          description: "Conservative fixed annuity providing steady, guaranteed income for mid-retirement years",
          growthStage: "Mid Growth",
          timeframe: `Years ${year7Start}-${year12Start - 1}`,
          investmentType: "Fixed Annuity",
          premiumAmount: 0,
          interestRate: 5.0,
          delayPeriod: year7Start,
          incomePeriods: year12Start - year7Start,
          paymentDelayPeriod: year7Start * 12,
          annuityLabel: "",
          riskTolerance: "conservative" as const,
        },
        {
          id: "conservative-annuity-3",
          name: "Mature Growth Annuity",
          percentage: 25,
          amount: 0,
          color: "#F59E0B",
          icon: "tree-pine",
          description: "Conservative fixed annuity providing steady, guaranteed income for mature retirement years",
          growthStage: "Mature Growth",
          timeframe: `Years ${year12Start}-${finalYearStart - 1}`,
          investmentType: "Fixed Annuity",
          premiumAmount: 0,
          interestRate: 5.5,
          delayPeriod: year12Start,
          incomePeriods: finalYearStart - year12Start,
          paymentDelayPeriod: year12Start * 12,
          annuityLabel: "",
          riskTolerance: "conservative" as const,
        },
        {
          id: "conservative-lifetime-income",
          name: "Lifetime Income Annuity",
          percentage: 25,
          amount: 0,
          color: "#8B5CF6",
          icon: "droplets",
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
          lifetimeIncomeType: "single" as const,
        },
      ]
    } else {
      // Full Sun (Growth-Focused Income) - Full diversified approach for aggressive
      // NOTE: Brokerage Portfolio is ONLY automatically included for Full Sun (aggressive) climate
      // It is NEVER included for Shade Garden (conservative) climate
      const year2Start = incomeStartDelay
      const year7Start = Math.max(year2Start + 5, incomeStartDelay + 5)
      const year12Start = Math.max(year7Start + 5, incomeStartDelay + 10)
      const finalYearStart = Math.max(year12Start + 4, incomeStartDelay + planningYears - 2)
      
      return [
        {
          id: "early-bloom",
          name: "Early Bloom Annuity",
          percentage: 20,
          amount: 0,
          color: "#3B82F6",
          icon: "sprout",
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
          icon: "leaf",
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
          icon: "tree-pine",
          description: "Established grove providing steady income - annuity payments for mature retirement years",
          growthStage: "Mature Forest",
          timeframe: `Years ${year12Start}-${finalYearStart - 1}`,
          investmentType: "Fixed Annuity",
          premiumAmount: 0,
          interestRate: 6.5,
          delayPeriod: year12Start,
          incomePeriods: finalYearStart - year12Start,
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
          icon: "flower",
          description:
            `Self-sustaining garden - brokerage investments providing flexible income for years ${finalYearStart}+ and legacy wealth`,
          growthStage: "Evergreen Legacy",
          timeframe: `Years ${finalYearStart}+`,
          investmentType: "Brokerage Portfolio",
          premiumAmount: 0,
          interestRate: 7.0,
          delayPeriod: finalYearStart,
          incomePeriods: 5,
          paymentDelayPeriod: finalYearStart * 12,
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
      // Conservative can add growth annuities or lifetime income
      if (investmentType === "annuity") {
        newBucket = {
          id: newBucketId,
          name: "Additional Growth Annuity",
          percentage: 0,
          amount: 0,
          color: "var(--chart-2)",
          icon: "tree-pine",
          description: "Additional growth annuity for enhanced income security",
          growthStage: "Growth Phase",
          timeframe: `Years ${incomeStartDelay}+`,
          investmentType: "Fixed Annuity",
          premiumAmount: 0,
          interestRate: 5.5,
          delayPeriod: incomeStartDelay,
          incomePeriods: 20,
          paymentDelayPeriod: incomeStartDelay * 12,
          annuityLabel: "",
          riskTolerance: "conservative" as const,
        }
      } else {
        // Lifetime income for conservative
        newBucket = {
          id: newBucketId,
          name: "Lifetime Income Annuity",
          percentage: 0,
          amount: 0,
          color: "var(--chart-6)",
          icon: "droplets",
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
          lifetimeIncomeType: "single" as const,
        }
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
          icon: "tree-pine",
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
          icon: "sun",
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
          icon: "droplets",
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
          lifetimeIncomeType: "single" as const,
        }
      }
    }

    setBuckets((prev) => [...prev, newBucket])
  }

  const removeBucket = (bucketId: string) => {
    setBuckets((prev) => prev.filter((bucket) => bucket.id !== bucketId))
  }

  const calculateBucketValues = (bucket: BucketData) => {
    // Use actual premiumAmount instead of estimated premiums for accuracy
    const actualPremium = bucket.premiumAmount || 0

    if (bucket.investmentType === "Lifetime Income") {
      // Future Value = Premium Amount * (1 + r/100)^t where r is the interest rate percentage and t is years deferred
      const interestRate = bucket.interestRate || 0
      const yearsDeferred = bucket.delayPeriod || 0
      const futureValue = actualPremium * Math.pow(1 + interestRate / 100, yearsDeferred)
      
      // Net Lifetime Income (Annual) = Future Value * Age-based Payout %
      const ageBasedPayout = bucket.ageBasedPayoutPercent || 0
      const annualIncome = futureValue * (ageBasedPayout / 100)
      
      const taxes = annualIncome * (clientData.taxBracket / 100)
      const netIncome = annualIncome - taxes

      return {
        estimatedPremium: actualPremium,
        futureValue: futureValue,
        annuityPayment: annualIncome,
        payments: annualIncome,
        taxes: -taxes, // Negative for display
        incomeSolve: netIncome,
      }
    } else {
      // For other investment types, use the original calculation
      // Future Value = Premium Amount * (1 + Rate of Interest)^Period of Delay
      const futureValue = actualPremium * Math.pow(1 + bucket.interestRate / 100, bucket.delayPeriod)

      const annuityPayment = annualIncomeGap / 12

      // Payments = (Future Value / Number of Income Periods) * (1 + Rate of Interest)
      const payments = (futureValue / bucket.incomePeriods) * (1 + bucket.interestRate / 100)

      // Taxes = Payments * Tax Bracket
      const taxes = payments * (clientData.taxBracket / 100)

      // Income Solve = Payments - Taxes
      const incomeSolve = payments - taxes

      return {
        estimatedPremium: actualPremium,
        futureValue,
        annuityPayment,
        payments,
        taxes: -taxes, // Negative for display
        incomeSolve,
      }
    }
  }

  const totalAllocated = buckets.reduce((sum, bucket) => sum + (bucket.premiumAmount || 0), 0)
  const remaining = totalInvestibleAssets - totalAllocated

  return (
    <TooltipProvider>
      <div ref={containerRef} className="w-full min-h-screen bg-m8bs-bg relative overflow-hidden">
        <div className="container mx-auto p-4 sm:p-6 max-w-7xl relative">
      {/* Enhanced Header */}
      <div className="mb-12">
        <div className="text-center mb-8 py-4">
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
            <h1 className="text-6xl font-bold text-balance mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent leading-tight pb-2">
              Evergreen Income Planner
            </h1>
            <p className="text-muted-foreground mt-1">
              Cultivate a {clientData.timeHorizon || 16}+ year retirement income strategy - plant annuity seeds, nurture growth, harvest lifetime prosperity
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Star className="h-4 w-4 text-yellow-400 animate-pulse" />
              <span className="text-sm text-blue-300 font-medium">Advanced Retirement Planning</span>
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
                {getIcon(stage.icon, "h-6 w-6 text-green-400 drop-shadow-lg")}
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm sm:text-lg font-bold text-blue-100">{stage.title}</p>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xs hidden sm:block">{stage.description}</p>
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
        <TabsContent value="1" className="space-y-12 mt-20">
          <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
            <CardHeader className="p-10 pb-14">
              <CardTitle className="flex items-center gap-4 text-white text-3xl mb-5 font-bold">
                <div className="p-4 bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark rounded-2xl shadow-xl shadow-m8bs-blue/50 ring-2 ring-m8bs-blue/30">
                  <Sprout className="h-7 w-7 text-white drop-shadow-2xl" />
                </div>
                <span className="bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark bg-clip-text text-transparent drop-shadow-lg">
                  Plant Retirement Seeds
                </span>
              </CardTitle>
              <CardDescription className="text-m8bs-muted text-xl font-medium mt-2">
                Let's understand your client's retirement landscape and income growing conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
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
                    <p className="text-lg font-bold text-blue-300">
                      {Math.max(0, clientData.incomeStartAge - clientData.retirementAge)} years
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-blue-400">Retirement Seeds to Plant</h3>
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
                    <span className="font-medium text-blue-400">Total Investible Assets:</span>
                    <span className="text-lg font-bold text-blue-300">${formatCurrency(totalInvestibleAssets)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planningYears">Planning Years</Label>
                  <Input
                    id="planningYears"
                    type="number"
                    min="1"
                    max="50"
                    step="1"
                    placeholder="16"
                    value={clientData.timeHorizon || ""}
                    onChange={(e) => {
                      const years = parseInt(e.target.value) || 16
                      handleClientDataChange("timeHorizon", years)
                      // Regenerate buckets with new time horizon
                      const climate = clientData.riskTolerance === "moderate" ? "aggressive" : clientData.riskTolerance
                      const newBuckets = generateInitialBuckets(climate, years)
                      setBuckets(newBuckets)
                      updateBucketAmounts(clientData.totalAmount)
                    }}
                  />
                  <p className="text-xs text-muted-foreground">Number of years for retirement income planning</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TreePine className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-blue-400">Tax Climate Zone</h3>
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
                  <Leaf className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-blue-400">Income Harvest Analysis</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Monthly income sources
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addIncomeSource}
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <Plus className="h-4 w-4" />
                      Monthly Income Sources
                    </Button>
                  </div>

                  {clientData.incomeSources.length === 0 && (
                    <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">No income sources added yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Click "Monthly Income Sources" to get started</p>
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
                      <span className="font-bold text-blue-300">${formatCurrency(totalCurrentIncome)}</span>
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
                  <Flower className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-blue-400">Growth Conditions</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="annualPaymentNeededGross">Gross Annual Payment Needed ($)</Label>
                    <Input
                      id="annualPaymentNeededGross"
                      type="text"
                      placeholder="48,000"
                      value={formatCurrency(
                        clientData.taxBracket > 0 && annualIncomeGap > 0
                          ? annualIncomeGap / (1 - clientData.taxBracket / 100)
                          : annualIncomeGap
                      )}
                      readOnly
                      className="bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground">Gross payment before taxes</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annualPaymentNeededNet">Net Annual Payment Needed ($)</Label>
                    <Input
                      id="annualPaymentNeededNet"
                      type="text"
                      placeholder="48,000"
                      value={formatCurrency(Math.max(0, annualIncomeGap))}
                      readOnly
                      className="bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground">Net payment after taxes (Income gap × 12 months)</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-blue-400">Client Goals & Aspirations</h3>
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
        <TabsContent value="2" className="space-y-12 mt-20">
          <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
            <CardHeader className="p-10 pb-14">
              <CardTitle className="flex items-center gap-4 text-white text-3xl mb-5 font-bold">
                <div className="p-4 bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark rounded-2xl shadow-xl shadow-m8bs-blue/50 ring-2 ring-m8bs-blue/30">
                  <Sun className="h-7 w-7 text-white drop-shadow-2xl" />
                </div>
                <span className="bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark bg-clip-text text-transparent drop-shadow-lg">
                  Cultivate Income Streams
                </span>
              </CardTitle>
              <CardDescription className="text-m8bs-muted text-xl font-medium mt-2">
                Design the {clientData.timeHorizon || 16}+ year retirement income garden with strategic bucket allocation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
              {/* Progress Bar */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TreePine className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-green-400">Allocation Progress</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Allocation Progress</span>
                    <span>{totalInvestibleAssets > 0 ? ((buckets.reduce((sum, bucket) => sum + (bucket.premiumAmount || 0), 0) / totalInvestibleAssets) * 100).toFixed(1) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${totalInvestibleAssets > 0 ? Math.min((buckets.reduce((sum, bucket) => sum + (bucket.premiumAmount || 0), 0) / totalInvestibleAssets) * 100, 100) : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Buckets Section with Calculator */}
              <div className="w-full" ref={bucketsContainerRef} style={{ overflow: 'visible' }}>
                {/* Buckets */}
                <div className="w-full">
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
                      <Card key={bucket.id} className="bg-m8bs-card border-m8bs-card-alt shadow-lg mb-6">
                        <CardHeader className="p-7">
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-4 text-white text-xl font-bold">
                              <div className="p-3 bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark rounded-xl shadow-xl shadow-m8bs-blue/40 ring-2 ring-m8bs-blue/30">
                                {getIcon(bucket.icon, "h-6 w-6 text-white drop-shadow-xl")}
                              </div>
                              <div>
                                <div className="text-xl font-bold bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark bg-clip-text text-transparent">{bucket.name}</div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs border-m8bs-blue/50 text-m8bs-blue bg-m8bs-blue/20">
                                    {bucket.timeframe}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs bg-m8bs-blue/20 text-m8bs-blue border-m8bs-blue/30">
                                    {bucket.investmentType}
                                  </Badge>
                                </div>
                              </div>
                            </CardTitle>
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
                        </CardHeader>
                        <CardContent className="space-y-6">
                      {/* Enhanced Allocation Tracker for this Bucket */}
                      <div className="p-5 bg-m8bs-card-alt rounded-lg border border-m8bs-border">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-green-400/30">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-lg">
                              <Calculator className="h-5 w-5 text-green-400" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-base text-blue-300">Allocation Tracker</h5>
                              <p className="text-xs text-muted-foreground">Real-time allocation status</p>
                            </div>
                          </div>
                          {totalInvestibleAssets > 0 && (
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Overall Progress</p>
                              <p className="text-lg font-bold text-green-300">
                                {((totalAllocated / totalInvestibleAssets) * 100).toFixed(1)}%
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Main Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div className="space-y-1.5 p-3 bg-m8bs-card/40 rounded-lg border border-green-700/30 hover:bg-m8bs-card/50 transition-colors">
                            <div className="flex items-center gap-1.5">
                              <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Total Assets</p>
                            </div>
                            <p className="text-base font-bold text-green-300">
                              ${formatCurrency(totalInvestibleAssets)}
                            </p>
                            <div className="h-1 bg-green-800/30 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '100%' }} />
                            </div>
                          </div>

                          <div className="space-y-1.5 p-3 bg-m8bs-card/40 rounded-lg border border-green-700/30 hover:bg-m8bs-card/50 transition-colors">
                            <div className="flex items-center gap-1.5">
                              <Target className="h-3.5 w-3.5 text-blue-400" />
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Total Allocated</p>
                            </div>
                            <p className="text-base font-bold text-blue-300">
                              ${formatCurrency(totalAllocated)}
                            </p>
                            {totalInvestibleAssets > 0 && (
                              <div className="h-1 bg-blue-800/30 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300" 
                                  style={{ width: `${Math.min((totalAllocated / totalInvestibleAssets) * 100, 100)}%` }} 
                                />
                              </div>
                            )}
                          </div>

                          <div className="space-y-1.5 p-3 bg-m8bs-card/40 rounded-lg border border-green-700/30 hover:bg-m8bs-card/50 transition-colors">
                            <div className="flex items-center gap-1.5">
                              <Droplets className="h-3.5 w-3.5 text-purple-400" />
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">This Bucket</p>
                            </div>
                            <p className="text-base font-bold text-purple-300">
                              ${formatCurrency(bucket.premiumAmount || 0)}
                            </p>
                            {totalInvestibleAssets > 0 && (
                              <div className="h-1 bg-purple-800/30 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-300" 
                                  style={{ width: `${Math.min(((bucket.premiumAmount || 0) / totalInvestibleAssets) * 100, 100)}%` }} 
                                />
                              </div>
                            )}
                            {totalAllocated > 0 && (
                              <p className="text-[9px] text-muted-foreground mt-0.5">
                                {(((bucket.premiumAmount || 0) / totalAllocated) * 100).toFixed(1)}% of allocated
                              </p>
                            )}
                          </div>

                          <div className={`space-y-1.5 p-3 rounded-lg border transition-colors ${
                            remaining >= 0 
                              ? 'bg-m8bs-card/40 border-green-700/30 hover:bg-m8bs-card/50' 
                              : 'bg-red-900/30 border-red-700/30 hover:bg-red-900/40'
                          }`}>
                            <div className="flex items-center gap-1.5">
                              {remaining >= 0 ? (
                                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <X className="h-3.5 w-3.5 text-red-400" />
                              )}
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Remaining</p>
                            </div>
                            <p className={`text-base font-bold ${remaining >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                              ${formatCurrency(remaining)}
                            </p>
                            {totalInvestibleAssets > 0 && (
                              <div className={`h-1 rounded-full overflow-hidden ${
                                remaining >= 0 ? 'bg-emerald-800/30' : 'bg-red-800/30'
                              }`}>
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    remaining >= 0 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'
                                  }`}
                                  style={{ width: `${Math.min((Math.abs(remaining) / totalInvestibleAssets) * 100, 100)}%` }} 
                                />
                              </div>
                            )}
                            {totalInvestibleAssets > 0 && (
                              <p className="text-[9px] text-muted-foreground mt-0.5">
                                {((remaining / totalInvestibleAssets) * 100).toFixed(1)}% of total
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Detailed Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <div className="p-3 bg-m8bs-card/50 rounded-lg border border-green-700/30">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Bucket Allocation Details</p>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">This Bucket:</span>
                                <span className="font-bold text-purple-300">${formatCurrency(bucket.premiumAmount || 0)}</span>
                              </div>
                              {totalInvestibleAssets > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">% of Total Assets:</span>
                                  <span className="font-bold text-green-300">
                                    {(((bucket.premiumAmount || 0) / totalInvestibleAssets) * 100).toFixed(2)}%
                                  </span>
                                </div>
                              )}
                              {totalAllocated > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">% of Allocated:</span>
                                  <span className="font-bold text-blue-300">
                                    {(((bucket.premiumAmount || 0) / totalAllocated) * 100).toFixed(2)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="p-3 bg-m8bs-card/50 rounded-lg border border-green-700/30">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Allocation Status</p>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Allocated:</span>
                                <span className="font-bold text-blue-300">${formatCurrency(totalAllocated)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Remaining:</span>
                                <span className={`font-bold ${remaining >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                                  ${formatCurrency(remaining)}
                                </span>
                              </div>
                              {annualIncomeGap > 0 && (() => {
                                const inflationRate = bucket.inflationRate !== undefined ? bucket.inflationRate : clientData.inflationRate || 0
                                const yearsDeferred = bucket.delayPeriod || 0
                                const incomeWithInflation = inflationRate > 0 && yearsDeferred > 0
                                  ? annualIncomeGap * Math.pow(1 + inflationRate / 100, yearsDeferred)
                                  : annualIncomeGap
                                
                                return (
                                  <>
                                    <div className="flex justify-between items-center pt-1 border-t border-green-700/30">
                                      <span className="text-muted-foreground">Income Needed (Original):</span>
                                      <span className="font-bold text-orange-300">${formatCurrency(annualIncomeGap)}/yr</span>
                                    </div>
                                    {inflationRate > 0 && yearsDeferred > 0 && (
                                      <div className="flex justify-between items-center pt-1">
                                        <span className="text-muted-foreground">Income Needed (with {inflationRate}% inflation):</span>
                                        <span className="font-bold text-yellow-300">${formatCurrency(incomeWithInflation)}/yr</span>
                                      </div>
                                    )}
                                  </>
                                )
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Overall Progress Bar */}
                        {totalInvestibleAssets > 0 && (
                          <div className="space-y-2 pt-2 border-t border-green-400/30">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground font-medium">Overall Allocation Progress</span>
                              <span className="font-bold text-green-300">
                                {((totalAllocated / totalInvestibleAssets) * 100).toFixed(1)}% Complete
                              </span>
                            </div>
                            <div className="w-full bg-m8bs-card-alt/30 rounded-full h-3 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 h-3 rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${Math.min((totalAllocated / totalInvestibleAssets) * 100, 100)}%` 
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                              <span>0%</span>
                              <span>50%</span>
                              <span>100%</span>
                            </div>
                          </div>
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
                              <Label htmlFor={`${bucket.id}-delay`}>Years Deferred (t)</Label>
                              <Input
                                id={`${bucket.id}-delay`}
                                type="number"
                                value={bucket.delayPeriod || ""}
                                onChange={(e) => {
                                  const years = Number(e.target.value)
                                  updateBucketField(bucket.id, "delayPeriod", years)
                                  // Automatically calculate payment delay period in months
                                  updateBucketField(bucket.id, "paymentDelayPeriod", years * 12)
                                }}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`${bucket.id}-periods`}>Years of Income</Label>
                              <Input
                                id={`${bucket.id}-periods`}
                                type="number"
                                step="1"
                                min="1"
                                placeholder="e.g., 15"
                                value={bucket.incomePeriods || ""}
                                onChange={(e) => updateBucketField(bucket.id, "incomePeriods", Number(e.target.value))}
                              />
                              <p className="text-xs text-muted-foreground">
                                Number of years this bucket will provide income
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`${bucket.id}-inflation-rate`}>Inflation Rate (%)</Label>
                              <Input
                                id={`${bucket.id}-inflation-rate`}
                                type="number"
                                step="0.01"
                                placeholder="e.g., 3.0"
                                value={bucket.inflationRate !== undefined ? bucket.inflationRate : clientData.inflationRate || ""}
                                onChange={(e) => updateBucketField(bucket.id, "inflationRate", Number(e.target.value))}
                              />
                              <p className="text-xs text-muted-foreground">
                                Annual inflation rate for adjusting income purchasing power
                              </p>
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
                              <Label htmlFor={`${bucket.id}-interest-rate`}>Rate of Interest (r) %</Label>
                              <Input
                                id={`${bucket.id}-interest-rate`}
                                type="number"
                                step="0.01"
                                placeholder="e.g., 5.0"
                                value={bucket.interestRate || ""}
                                onChange={(e) => updateBucketField(bucket.id, "interestRate", Number(e.target.value))}
                              />
                              <p className="text-xs text-muted-foreground">
                                Interest rate used to calculate future value
                              </p>
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

                            <div className="space-y-2">
                              <Label htmlFor={`${bucket.id}-years-deferred`}>Years Deferred</Label>
                              <Input
                                id={`${bucket.id}-years-deferred`}
                                type="number"
                                step="1"
                                min="0"
                                placeholder="e.g., 5"
                                value={bucket.delayPeriod || ""}
                                onChange={(e) => {
                                  const years = Number(e.target.value) || 0
                                  updateBucketField(bucket.id, "delayPeriod", years)
                                  updateBucketField(bucket.id, "paymentDelayPeriod", years * 12)
                                }}
                              />
                              <p className="text-xs text-muted-foreground">
                                Number of years before lifetime income payments begin
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`${bucket.id}-income-years`}>Years of Income</Label>
                              <Input
                                id={`${bucket.id}-income-years`}
                                type="number"
                                step="1"
                                min="1"
                                placeholder="e.g., 999 for lifetime"
                                value={bucket.incomePeriods === 999 ? "" : (bucket.incomePeriods || "")}
                                onChange={(e) => {
                                  const value = e.target.value
                                  // Allow empty for lifetime, or set to 999 if user wants lifetime
                                  if (value === "" || value.toLowerCase() === "lifetime") {
                                    updateBucketField(bucket.id, "incomePeriods", 999)
                                  } else {
                                    updateBucketField(bucket.id, "incomePeriods", Number(value))
                                  }
                                }}
                              />
                              <p className="text-xs text-muted-foreground">
                                Number of years this bucket will provide income (999 for lifetime)
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
                              <Label htmlFor={`${bucket.id}-delay`}>Years Deferred (t)</Label>
                              <Input
                                id={`${bucket.id}-delay`}
                                type="number"
                                value={bucket.delayPeriod || ""}
                                onChange={(e) => {
                                  const years = Number(e.target.value)
                                  updateBucketField(bucket.id, "delayPeriod", years)
                                  // Automatically calculate payment delay period in months
                                  updateBucketField(bucket.id, "paymentDelayPeriod", years * 12)
                                }}
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

                            <div className="space-y-2">
                              <Label htmlFor={`${bucket.id}-income-years-portfolio`}>Years of Income</Label>
                              <Input
                                id={`${bucket.id}-income-years-portfolio`}
                                type="number"
                                step="1"
                                min="1"
                                placeholder="e.g., 15"
                                value={bucket.incomePeriods || ""}
                                onChange={(e) => updateBucketField(bucket.id, "incomePeriods", Number(e.target.value))}
                              />
                              <p className="text-xs text-muted-foreground">
                                Number of years this bucket will provide income
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`${bucket.id}-inflation-rate`}>Inflation Rate (%)</Label>
                              <Input
                                id={`${bucket.id}-inflation-rate`}
                                type="number"
                                step="0.01"
                                placeholder="e.g., 3.0"
                                value={bucket.inflationRate !== undefined ? bucket.inflationRate : clientData.inflationRate || ""}
                                onChange={(e) => updateBucketField(bucket.id, "inflationRate", Number(e.target.value))}
                              />
                              <p className="text-xs text-muted-foreground">
                                Annual inflation rate for adjusting income purchasing power
                              </p>
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

                          {/* Show Gross and Net Payments for all investment types with payments */}
                          {(calculatedValues.payments > 0 || calculatedValues.incomeSolve > 0) && (
                            <>
                              <div className="space-y-2">
                                <Label>Gross Payment (Calculated)</Label>
                                <Input
                                  type="text"
                                  value={`$${formatCurrency(calculatedValues.payments)}`}
                                  readOnly
                                  className="bg-muted/50 font-medium"
                                />
                                <p className="text-xs text-muted-foreground">
                                  {bucket.investmentType === "Fixed Annuity" 
                                    ? "(Future Value ÷ Income Periods) × (1 + Rate)"
                                    : bucket.investmentType === "Lifetime Income"
                                    ? "Annual gross income before taxes"
                                    : "Annual gross payment before taxes"}
                                </p>
                              </div>

                              <div className="space-y-2">
                                <Label>Net Payment (Calculated)</Label>
                                <Input
                                  type="text"
                                  value={`$${formatCurrency(calculatedValues.incomeSolve)}`}
                                  readOnly
                                  className="bg-green-900/30 border-green-700/30 font-bold text-lg text-green-300"
                                />
                                <p className="text-xs text-muted-foreground">
                                  {bucket.investmentType === "Lifetime Income"
                                    ? "Annual lifetime income after taxes, adjusted for inflation"
                                    : "Gross Payment - Taxes"}
                                </p>
                              </div>
                            </>
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
                        </CardContent>
                      </Card>
                    )
                  })}

                  {/* Add New Section Buttons */}
                  <div className="flex justify-center pt-4 gap-3">
                    {clientData.riskTolerance === "conservative" ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => addNewBucket("conservative", "annuity")}
                          className="border-blue-700/30 text-blue-400 hover:bg-blue-900/20 flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Growth Annuity
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => addNewBucket("conservative", "lifetime")}
                          className="border-green-700/30 text-green-400 hover:bg-green-900/20 flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Lifetime Income
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => addNewBucket("aggressive", "annuity")}
                          className="border-blue-700/30 text-blue-400 hover:bg-blue-900/20 flex items-center gap-2"
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
                          className="border-green-700/30 text-green-400 hover:bg-green-900/20 flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Lifetime Income
                        </Button>
                      </>
                    )}
                  </div>
                    </>
                  )}
                </div>

              </div>


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
        <TabsContent value="3" className="space-y-12 mt-20">
          <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
            <CardHeader className="p-10 pb-14">
              <CardTitle className="flex items-center gap-4 text-white text-3xl mb-5 font-bold">
                <div className="p-4 bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark rounded-2xl shadow-xl shadow-m8bs-blue/50 ring-2 ring-m8bs-blue/30">
                  <Droplets className="h-7 w-7 text-white drop-shadow-2xl" />
                </div>
                <span className="bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark bg-clip-text text-transparent drop-shadow-lg">
                  Harvest Retirement Plan
                </span>
              </CardTitle>
              <CardDescription className="text-m8bs-muted text-xl font-medium mt-2">
                Finalize the lifetime income strategy for {clientData.name || "Your Client"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">

              {/* Executive Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                <Card className="p-6 bg-m8bs-card-alt border border-m8bs-border shadow-lg">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 bg-m8bs-blue/20 rounded-2xl border border-m8bs-blue/30">
                      <Sprout className="h-8 w-8 text-m8bs-blue" />
                    </div>
                    <div className="w-full">
                      <p className="text-sm text-m8bs-muted mb-1">Total Investment</p>
                      <p className="text-2xl font-bold text-m8bs-blue break-words">${formatCurrency(totalInvestibleAssets)}</p>
                      <p className="text-xs text-m8bs-muted mt-2">Seeds planted for growth</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-m8bs-card-alt border border-m8bs-border shadow-lg">
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

                <Card className="p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-2 border-green-500/40 shadow-xl backdrop-blur-sm">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 bg-green-900/30 rounded-2xl border border-green-700/30">
                      <Flower className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="w-full">
                      <p className="text-sm text-muted-foreground mb-1">Annual Income Need</p>
                      <p className="text-2xl font-bold text-green-300 break-words">${formatCurrency(annualIncomeGap)}</p>
                      <p className="text-xs text-muted-foreground mt-2">Gap to fill each year</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-2 border-blue-500/40 shadow-xl backdrop-blur-sm">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 bg-blue-900/30 rounded-2xl border border-blue-700/30">
                      <Droplets className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="w-full">
                      <p className="text-sm text-muted-foreground mb-1">Total Income Generated</p>
                      <p className="text-2xl font-bold text-blue-300 break-words">
                        ${formatCurrency(
                          buckets.reduce((sum, bucket) => {
                            const values = calculateBucketValues(bucket)
                            const annualIncome = values.incomeSolve || 0
                            // For lifetime income, use planning years or a large number
                            let incomePeriods = bucket.incomePeriods || 0
                            if (bucket.investmentType === "Lifetime Income" || incomePeriods >= 999) {
                              incomePeriods = clientData.timeHorizon || 16
                            }
                            // Total income = annual income × number of years income is generated
                            return sum + (annualIncome * incomePeriods)
                          }, 0)
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">Total income from all buckets across all years</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-2 border-purple-500/40 shadow-xl backdrop-blur-sm">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 bg-purple-900/30 rounded-2xl border border-purple-700/30">
                      <Star className="h-8 w-8 text-purple-500" />
                    </div>
                    <div className="w-full">
                      <p className="text-sm text-muted-foreground mb-1">Total Value</p>
                      <p className="text-2xl font-bold text-purple-300 break-words">
                        ${formatCurrency(
                          // Annual Income Generated (sum of annual income from all buckets)
                          buckets.reduce((sum, bucket) => {
                            const values = calculateBucketValues(bucket)
                            return sum + (values.incomeSolve || 0)
                          }, 0) +
                          // Growth Phase (sum of future values from all buckets)
                          buckets.reduce((sum, bucket) => {
                            const values = calculateBucketValues(bucket)
                            return sum + (values.futureValue || 0)
                          }, 0)
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">Annual income generated + growth phase</p>
                    </div>
                  </div>
                </Card>
              </div>

              <Separator />

              {/* Visual Timeline - Large and Prominent */}
              <div className="space-y-4" ref={timelineRef} data-chart="timeline">
                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-green-400">Your {clientData.timeHorizon || 16}+ Year Income Timeline</h3>
                </div>
                <Card className="p-8 bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-green-700/30 shadow-lg">

                <div className="space-y-8">
                  {/* Timeline Visual */}
                  <div className="relative py-8">
                    {/* Timeline Base Line */}
                    <div className="absolute top-16 left-8 right-8 h-3 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 rounded-full shadow-lg shadow-blue-200" />

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
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-blue-500 shadow-2xl shadow-blue-900/50 flex items-center justify-center mb-4">
                              <div className="text-blue-400 scale-150 drop-shadow-lg">{getIcon(bucket.icon, "h-6 w-6")}</div>
                            </div>

                            {/* Year Badge */}
                            <Badge className="mb-2 text-base px-4 py-1 bg-blue-700 text-white shadow-md border-blue-600">
                              Years {yearRanges[index]}
                            </Badge>

                            {/* Stage Name */}
                            <p className="text-center font-semibold text-lg mb-1">{bucket.growthStage}</p>
                            <p className="text-center text-sm text-muted-foreground mb-4">{bucket.investmentType}</p>

                            {/* Key Metric Card */}
                            <Card className="w-full p-4 bg-m8bs-card shadow-md border-2 border-blue-700/30">
                              <div className="text-center space-y-2">
                                <p className="text-xs text-muted-foreground">Annual Income</p>
                                <p className="text-2xl font-bold text-blue-300">
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
                                    <span className="font-medium text-blue-600">{bucket.interestRate}%</span>
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
              <Card className="p-8 bg-m8bs-card-alt border border-m8bs-border shadow-lg">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-m8bs-blue">
                  <div className="p-2 bg-m8bs-card rounded-lg shadow-sm border border-m8bs-border">
                    <Leaf className="h-6 w-6 text-blue-500" />
                  </div>
                  Investment Allocation Breakdown
                </h2>

                <div className="space-y-6">
                  {buckets.map((bucket, index) => {
                    const values = calculateBucketValues(bucket)
                    const actualPremium = bucket.premiumAmount || values.estimatedPremium || 0
                    const percentage = totalInvestibleAssets > 0 ? (actualPremium / totalInvestibleAssets) * 100 : 0

                    return (
                      <Card key={bucket.id} className="p-6 bg-m8bs-card-alt border border-m8bs-border shadow-lg">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-4 bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark rounded-xl shadow-lg">
                                {getIcon(bucket.icon, "h-6 w-6 text-white drop-shadow-lg")}
                              </div>
                              <div>
                                <CardTitle className="text-xl text-white mb-2">{bucket.name}</CardTitle>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs border-m8bs-blue/50 text-m8bs-blue">
                                    {bucket.timeframe}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs bg-m8bs-blue/20 text-m8bs-blue">
                                    {bucket.investmentType}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-m8bs-muted">Initial Investment</p>
                              <p className="text-2xl font-bold text-m8bs-blue">
                                ${formatCurrency(actualPremium)}
                              </p>
                              <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}% of portfolio</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">

                        {/* Large Visual Progress Bar */}
                        <div className="relative">
                          <div className="h-14 bg-m8bs-card rounded-xl overflow-visible border border-m8bs-border shadow-lg">
                            <div
                              className="h-full bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 transition-all duration-700 ease-out shadow-inner"
                              style={{ width: `${percentage}%` }}
                            >
                              {percentage >= 5 ? (
                                <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white drop-shadow-lg">
                                  {percentage.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xl font-bold text-white drop-shadow-lg whitespace-nowrap">
                                  {percentage.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Future Value Emphasis */}
                        <Card className="p-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-600/50 shadow-lg">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-2">Projected Future Value</p>
                            <p className="text-4xl font-bold text-blue-300 mb-2">
                              ${formatCurrency(values.futureValue)}
                            </p>
                            <p className="text-xs text-blue-400">
                              {bucket.investmentType === "Fixed Annuity" 
                                ? "Guaranteed growth over time" 
                                : "Growth-based portfolio appreciation"}
                            </p>
                          </div>
                        </Card>

                        {/* Payment Breakdown - Gross and Net for all investment types */}
                        {(values.payments > 0 || values.incomeSolve > 0) && (
                          <div className="grid grid-cols-2 gap-3">
                            <Card className="p-4 bg-m8bs-card-alt shadow-sm border-l-4 border-l-m8bs-blue">
                              <p className="text-xs text-muted-foreground mb-1">Gross Payment</p>
                              <p className="text-lg font-bold text-blue-400">
                                ${formatCurrency(values.payments)}
                              </p>
                            </Card>
                            <Card className="p-4 bg-m8bs-card-alt shadow-md border-l-4 border-l-yellow-500">
                              <p className="text-xs text-muted-foreground mb-1">Net Payment</p>
                              <p className="text-lg font-bold text-yellow-400">
                                ${formatCurrency(values.incomeSolve)}
                              </p>
                            </Card>
                          </div>
                        )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Total Summary */}
                <Separator className="my-6" />
                <Card className="p-6 bg-m8bs-card shadow-xl border-2 border-blue-700/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-blue-900/30 rounded-2xl border border-blue-700/30">
                        <TreePine className="h-10 w-10 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Portfolio Investment</p>
                        <p className="text-4xl font-bold text-blue-300">${formatCurrency(totalInvestibleAssets)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Projected Total Growth</p>
                      <p className="text-4xl font-bold text-green-400">
                        ${formatCurrency(buckets.reduce((sum, b) => sum + calculateBucketValues(b).futureValue, 0))}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 h-6 bg-blue-900/30 rounded-full overflow-hidden border border-blue-700/30">
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
                  <div className="p-2 bg-gray-700/50 rounded-lg shadow-sm border border-green-700/30">
                    <Droplets className="h-6 w-6 text-blue-500" />
                  </div>
                  Annual Income Flow Analysis
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Income Sources */}
                  <Card className="p-6 bg-m8bs-card-alt shadow-md border border-m8bs-border">
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
                  <Card className="p-6 bg-m8bs-card-alt shadow-md border border-m8bs-border">
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

              {/* Data Visualizations Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-blue-400">
                  <div className="p-2 bg-gray-700/50 rounded-lg shadow-sm border border-blue-700/30">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                  </div>
                  Retirement Plan Visualizations
                </h2>

                {/* 1. Income Throughout Years and Growth */}
                <Card className="p-6 bg-m8bs-card border-2 border-blue-700/30 shadow-lg">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-400">
                    <Droplets className="h-5 w-5 text-green-500" />
                    Income Growth Over Time
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart
                      data={Array.from({ length: clientData.timeHorizon || 16 }, (_, i) => {
                        const year = i + 1
                        let cumulativeIncome = 0
                        const totalIncome = buckets.reduce((sum, bucket) => {
                          const values = calculateBucketValues(bucket)
                          const incomeStartYear = bucket.delayPeriod || 1
                          
                          if (year >= incomeStartYear) {
                            const yearsSinceStart = year - incomeStartYear + 1
                            const maxIncomePeriods = bucket.incomePeriods || 999
                            const yearsOfIncome = Math.min(yearsSinceStart, maxIncomePeriods)
                            
                            if (yearsOfIncome > 0) {
                              let bucketAnnualIncome = 0
                              if (bucket.investmentType === "Lifetime Income") {
                                bucketAnnualIncome = values.incomeSolve || values.payments || values.annuityPayment || 0
                              } else if (bucket.investmentType === "Brokerage Portfolio") {
                                const portfolioValue = values.futureValue || values.estimatedPremium || 0
                                const withdrawalRate = 0.04
                                bucketAnnualIncome = portfolioValue * withdrawalRate
                              } else {
                                bucketAnnualIncome = values.payments || values.incomeSolve || values.annuityPayment || 0
                              }
                              cumulativeIncome += bucketAnnualIncome * yearsOfIncome
                              return sum + bucketAnnualIncome
                            }
                          }
                          return sum
                        }, 0)
                        
                        return {
                          year: `Year ${year}`,
                          income: totalIncome,
                          cumulativeIncome: cumulativeIncome
                        }
                      })}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="year" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                        formatter={(value: any) => `$${formatCurrency(value)}`}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#10B981" 
                        fill="#10B981" 
                        fillOpacity={0.6}
                        name="Annual Income"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cumulativeIncome" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        name="Cumulative Income"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                {/* 2. Timeline of Income Generated */}
                <Card className="p-6 bg-m8bs-card border-2 border-green-700/30 shadow-lg">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-400">
                    <Sun className="h-5 w-5 text-green-500" />
                    Income Timeline by Bucket
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={Array.from({ length: clientData.timeHorizon || 16 }, (_, i) => {
                        const year = i + 1
                        const bucketData: any = { year: `Year ${year}` }
                        
                        buckets.forEach((bucket) => {
                          const values = calculateBucketValues(bucket)
                          const incomeStartYear = bucket.delayPeriod || 1
                          const incomeEndYear = incomeStartYear + (bucket.incomePeriods || 999)
                          
                          if (year >= incomeStartYear && year < incomeEndYear) {
                            let bucketAnnualIncome = 0
                            if (bucket.investmentType === "Lifetime Income") {
                              bucketAnnualIncome = values.incomeSolve || values.payments || values.annuityPayment || 0
                            } else if (bucket.investmentType === "Brokerage Portfolio") {
                              const portfolioValue = values.futureValue || values.estimatedPremium || 0
                              const withdrawalRate = 0.04
                              bucketAnnualIncome = portfolioValue * withdrawalRate
                            } else {
                              bucketAnnualIncome = values.payments || values.incomeSolve || values.annuityPayment || 0
                            }
                            bucketData[bucket.name] = bucketAnnualIncome
                          } else {
                            bucketData[bucket.name] = 0
                          }
                        })
                        
                        return bucketData
                      })}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="year" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                        formatter={(value: any) => `$${formatCurrency(value)}`}
                      />
                      <Legend />
                      {buckets.map((bucket, index) => {
                        const colors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4"]
                        return (
                          <Bar 
                            key={bucket.id} 
                            dataKey={bucket.name} 
                            stackId="income"
                            fill={colors[index % colors.length]}
                          />
                        )
                      })}
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* 3. Bucket Depletion Visualization */}
                <Card className="p-6 bg-m8bs-card border-2 border-purple-700/30 shadow-lg">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-400">
                    <Shield className="h-5 w-5 text-purple-500" />
                    Bucket Depletion Timeline
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart
                      data={Array.from({ length: clientData.timeHorizon || 16 }, (_, i) => {
                        const year = i + 1
                        const bucketData: any = { year: `Year ${year}` }
                        
                        buckets.forEach((bucket) => {
                          // Only show depletion for non-lifetime and non-brokerage buckets
                          if (bucket.investmentType !== "Lifetime Income" && bucket.investmentType !== "Brokerage Portfolio") {
                            const incomeStartYear = bucket.delayPeriod || 1
                            const incomeEndYear = incomeStartYear + (bucket.incomePeriods || 999)
                            const values = calculateBucketValues(bucket)
                            const initialValue = values.futureValue || bucket.premiumAmount || 0
                            
                            if (year >= incomeStartYear && year < incomeEndYear) {
                              const yearsSinceStart = year - incomeStartYear
                              const totalPeriods = bucket.incomePeriods || 999
                              const remainingValue = initialValue * (1 - yearsSinceStart / totalPeriods)
                              bucketData[bucket.name] = Math.max(0, remainingValue)
                            } else if (year < incomeStartYear) {
                              bucketData[bucket.name] = initialValue
                            } else {
                              bucketData[bucket.name] = 0
                            }
                          } else {
                            // Lifetime income and brokerage maintain their value
                            const values = calculateBucketValues(bucket)
                            bucketData[bucket.name] = values.futureValue || bucket.premiumAmount || 0
                          }
                        })
                        
                        return bucketData
                      })}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="year" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                        formatter={(value: any) => `$${formatCurrency(value)}`}
                      />
                      <Legend />
                      {buckets.map((bucket, index) => {
                        const colors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4"]
                        return (
                          <Area
                            key={bucket.id}
                            type="monotone"
                            dataKey={bucket.name}
                            stackId="depletion"
                            stroke={colors[index % colors.length]}
                            fill={colors[index % colors.length]}
                            fillOpacity={0.6}
                          />
                        )
                      })}
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                {/* 4. Investment Growth Breakdown */}
                <Card className="p-6 bg-m8bs-card border-2 border-yellow-700/30 shadow-lg">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-400">
                    <Target className="h-5 w-5 text-yellow-500" />
                    Investment Growth Breakdown
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold mb-4 text-white">Initial Investment</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={buckets.map((bucket) => ({
                              name: bucket.name,
                              value: bucket.premiumAmount || 0
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {buckets.map((bucket, index) => {
                              const colors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4"]
                              return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            })}
                          </Pie>
                          <Tooltip formatter={(value: any) => `$${formatCurrency(value)}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-4 text-white">Future Value</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={buckets.map((bucket) => {
                              const values = calculateBucketValues(bucket)
                              return {
                                name: bucket.name,
                                value: values.futureValue || 0
                              }
                            })}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {buckets.map((bucket, index) => {
                              const colors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4"]
                              return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            })}
                          </Pie>
                          <Tooltip formatter={(value: any) => `$${formatCurrency(value)}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="mt-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={buckets.map((bucket) => {
                          const values = calculateBucketValues(bucket)
                          return {
                            name: bucket.name,
                            "Initial Investment": bucket.premiumAmount || 0,
                            "Future Value": values.futureValue || 0,
                            "Growth": (values.futureValue || 0) - (bucket.premiumAmount || 0)
                          }
                        })}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                          formatter={(value: any) => `$${formatCurrency(value)}`}
                        />
                        <Legend />
                        <Bar dataKey="Initial Investment" fill="#3B82F6" />
                        <Bar dataKey="Future Value" fill="#10B981" />
                        <Bar dataKey="Growth" fill="#F59E0B" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Client Goals Section */}
              {clientData.clientGoals.length > 0 && (
                <Card className="p-8 bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-green-700/30 shadow-lg">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-green-400">
                    <div className="p-2 bg-gray-700/50 rounded-lg shadow-sm border border-green-700/30">
                      <Sun className="h-6 w-6 text-green-500" />
                    </div>
                    Client Goals & Aspirations
                  </h2>

                  <div className="space-y-4">
                    {clientData.clientGoals.map((goal, index) => (
                      <Card key={goal.id} className="p-6 bg-gray-700/50 shadow-md border border-green-700/20">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-900/30 border border-green-700/30 flex items-center justify-center">
                              <span className="text-sm font-bold text-green-400">{index + 1}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-green-300">{goal.goal}</h3>
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
                            <p className="text-2xl font-bold text-green-300">
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
                    <Card className="p-6 bg-m8bs-card-alt shadow-lg border border-m8bs-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-4 bg-green-900/30 rounded-2xl border border-green-700/30">
                            <Sun className="h-8 w-8 text-green-500" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Goals Cost Estimate</p>
                            <p className="text-3xl font-bold text-green-300">
                              ${formatCurrency(clientData.clientGoals.reduce((sum, goal) => sum + goal.estimatedCost, 0))}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Goals Count</p>
                          <p className="text-3xl font-bold text-green-300">{clientData.clientGoals.length}</p>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-green-900/20 rounded-lg border border-green-700/30">
                        <p className="text-center text-sm text-green-300">
                          🌟 These goals help shape the retirement income strategy to ensure your client's dreams become reality
                        </p>
                      </div>
                    </Card>
                  </div>
                </Card>
              )}

              {/* Enhanced Investment Allocation Pie Chart */}
              <Card className="p-8 bg-m8bs-card-alt border border-m8bs-border shadow-lg hover:shadow-xl transition-all duration-300">
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
                  {/* Portfolio Distribution Chart */}
                  <div className="space-y-4" ref={pieChartRef} data-chart="portfolio">
                    <h3 className="text-lg font-semibold text-blue-300">Portfolio Distribution</h3>
                    <div className="bg-m8bs-card-alt rounded-2xl p-4 sm:p-6 border border-m8bs-border shadow-lg">
                      <div className="h-[250px] sm:h-[280px] mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={buckets.map((bucket, index) => {
                              const values = calculateBucketValues(bucket)
                              const actualValue = bucket.premiumAmount || values.estimatedPremium
                              const totalAllocated = buckets.reduce((sum, b) => sum + (b.premiumAmount || 0), 0) || totalInvestibleAssets
                              return {
                                name: bucket.name,
                                amount: actualValue,
                                percentage: parseFloat(((actualValue / totalAllocated) * 100).toFixed(1)),
                                formattedAmount: formatCurrency(actualValue)
                              }
                            })}
                            layout="vertical"
                            margin={{ top: 10, right: 10, bottom: 10, left: 50 }}
                            barCategoryGap="20%"
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 197, 94, 0.1)" />
                            <XAxis 
                              type="number"
                              tickFormatter={(value) => formatCurrency(value)}
                              style={{ fill: '#9CA3AF', fontSize: '11px' }}
                            />
                            <YAxis 
                              type="category" 
                              dataKey="name"
                              width={45}
                              style={{ fill: '#ffffff', fontSize: '12px', fontWeight: '500' }}
                              tick={{ fill: '#ffffff' }}
                            />
                            <Bar 
                              dataKey="amount" 
                              radius={[0, 8, 8, 0]}
                              barSize={40}
                              label={({ x, y, width, height, value, payload }: any) => {
                                const amount = value || payload?.amount || 0
                                const percentage = payload?.percentage || 0
                                // Position label inside the bar, aligned to the right
                                const labelX = x + width - 8
                                const labelY = y + height / 2
                                const labelText = `${formatCurrency(amount)} (${percentage}%)`
                                
                                // Check if bar is wide enough to fit label, otherwise use shorter format
                                const useShortFormat = width < 120
                                const displayText = useShortFormat ? `${formatCurrency(amount)}` : labelText
                                
                                return (
                                  <text
                                    x={labelX}
                                    y={labelY}
                                    fill="#ffffff"
                                    fontSize="11"
                                    fontWeight="bold"
                                    dominantBaseline="middle"
                                    textAnchor="end"
                                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                                  >
                                    {displayText}
                                  </text>
                                )
                              }}
                            >
                              {buckets.map((bucket, index) => {
                                const colors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4"]
                                return (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={colors[index % colors.length]}
                                    className="drop-shadow-lg"
                                  />
                                )
                              })}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      {/* Compact Portfolio Distribution Table */}
                      <div className="space-y-2 pt-3 border-t border-green-700/30">
                        {buckets.map((bucket, index) => {
                          const values = calculateBucketValues(bucket)
                          const actualValue = bucket.premiumAmount || values.estimatedPremium
                          const totalAllocated = buckets.reduce((sum, b) => sum + (b.premiumAmount || 0), 0) || totalInvestibleAssets
                          const percentage = ((actualValue / totalAllocated) * 100).toFixed(1)
                          const colors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4"]
                          return (
                            <div 
                              key={bucket.id} 
                              className="flex items-center justify-between p-2 bg-gradient-to-r from-slate-800/40 to-slate-900/40 rounded-lg border border-green-700/20"
                            >
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full shadow-sm" 
                                  style={{ backgroundColor: colors[index % colors.length] }}
                                />
                                <span className="text-xs sm:text-sm font-medium text-white">{bucket.name}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-xs sm:text-sm font-bold text-green-300">{formatCurrency(actualValue)}</div>
                                <div className="text-xs text-green-400">{percentage}%</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
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
                        const actualPremium = bucket.premiumAmount || values.estimatedPremium || 0
                        const percentage = totalInvestibleAssets > 0 ? ((actualPremium / totalInvestibleAssets) * 100).toFixed(1) : "0"
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
                              <div className="font-bold text-2xl text-green-300">${formatCurrency(actualPremium)}</div>
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
              <Card className="p-8 bg-m8bs-card-alt border border-m8bs-border shadow-lg hover:shadow-xl transition-all duration-300">
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
                  <div className="space-y-6" ref={barChartRef} data-chart="income">
                    <h3 className="text-xl font-bold text-blue-300 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Annual Income by Investment
                    </h3>
                    <div className="h-80 sm:h-96 bg-m8bs-card-alt rounded-2xl p-4 sm:p-6 border border-m8bs-border">
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
                    <div className="h-80 sm:h-96 bg-m8bs-card-alt rounded-2xl p-4 sm:p-6 border border-m8bs-border">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={Array.from({ length: 20 }, (_, i) => {
                          const year = i + 1
                          const totalGrowth = buckets.reduce((sum, bucket) => {
                            const values = calculateBucketValues(bucket)
                            const growth = values.estimatedPremium * Math.pow(1 + bucket.interestRate / 100, year)
                            return sum + growth
                          }, 0)
                          
                          // Calculate annual income received in this year (sum of all active buckets)
                          const annualIncome = buckets.reduce((sum, bucket) => {
                            const values = calculateBucketValues(bucket)
                            // Income starts after delay period and continues for incomePeriods
                            const incomeStartYear = bucket.delayPeriod || 1
                            const incomeEndYear = incomeStartYear + (bucket.incomePeriods || 999)
                            
                            if (year >= incomeStartYear && year < incomeEndYear) {
                              // Add annual income for this bucket if it's active this year
                              let bucketIncome = 0
                              if (bucket.investmentType === "Lifetime Income") {
                                bucketIncome = values.incomeSolve || values.payments || values.annuityPayment || 0
                              } else if (bucket.investmentType === "Brokerage Portfolio") {
                                // For brokerage portfolios, calculate income based on portfolio value
                                const portfolioValue = values.futureValue || values.estimatedPremium || 0
                                const withdrawalRate = 0.04 // 4% withdrawal rate
                                bucketIncome = portfolioValue * withdrawalRate
                              } else {
                                // For annuities, use payments (annual gross income) or incomeSolve (net income)
                                bucketIncome = values.payments || values.incomeSolve || values.annuityPayment || 0
                                // If payments is very small, try using a percentage of future value
                                if (bucketIncome === 0 && values.futureValue > 0) {
                                  bucketIncome = (values.futureValue / (bucket.incomePeriods || 15)) * (1 + (bucket.interestRate || 0) / 100)
                                }
                              }
                              return sum + bucketIncome
                            }
                            return sum
                          }, 0)
                          
                          // Calculate cumulative income received up to this year
                          const cumulativeIncome = buckets.reduce((sum, bucket) => {
                            const values = calculateBucketValues(bucket)
                            const incomeStartYear = bucket.delayPeriod || 1
                            
                            // Income starts after delay period
                            if (year >= incomeStartYear) {
                              // Calculate how many years of income have been received up to this year
                              const yearsSinceStart = year - incomeStartYear + 1
                              const maxIncomePeriods = bucket.incomePeriods || 999
                              const yearsOfIncome = Math.min(yearsSinceStart, maxIncomePeriods)
                              
                              // Add annual income for each year received
                              let bucketAnnualIncome = 0
                              if (bucket.investmentType === "Lifetime Income") {
                                bucketAnnualIncome = values.incomeSolve || values.payments || values.annuityPayment || 0
                              } else if (bucket.investmentType === "Brokerage Portfolio") {
                                // For brokerage portfolios, calculate income based on portfolio value
                                const portfolioValue = values.futureValue || values.estimatedPremium || 0
                                const withdrawalRate = 0.04 // 4% withdrawal rate
                                bucketAnnualIncome = portfolioValue * withdrawalRate
                              } else {
                                // For annuities, use payments (annual gross income) or incomeSolve (net income)
                                bucketAnnualIncome = values.payments || values.incomeSolve || values.annuityPayment || 0
                                // If payments is very small, try using a percentage of future value
                                if (bucketAnnualIncome === 0 && values.futureValue > 0) {
                                  bucketAnnualIncome = (values.futureValue / (bucket.incomePeriods || 15)) * (1 + (bucket.interestRate || 0) / 100)
                                }
                              }
                              return sum + (bucketAnnualIncome * yearsOfIncome)
                            }
                            return sum
                          }, 0)
                          
                          return {
                            year: `Year ${year}`,
                            value: totalGrowth,
                            investment: totalInvestibleAssets,
                            income: cumulativeIncome,
                            annualIncome: annualIncome
                          }
                        })} margin={{ top: 10, right: 30, bottom: 10, left: 80 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="year" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                          <YAxis 
                            tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                            width={75}
                            tickFormatter={(value) => {
                              if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
                              if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
                              return `$${value.toFixed(0)}`
                            }}
                          />
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
                          <Line type="monotone" dataKey="income" stroke="#3b82f6" name="Cumulative Income" strokeWidth={4} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }} />
                          <Line type="monotone" dataKey="annualIncome" stroke="#f59e0b" name="Annual Income" strokeWidth={3} strokeDasharray="4 4" dot={{ fill: '#f59e0b', strokeWidth: 2, r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Enhanced Risk Analysis and Performance Metrics */}
              <Card className="p-8 bg-m8bs-card-alt border border-m8bs-border shadow-lg hover:shadow-xl transition-all duration-300">
                <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-blue-300">
                  <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                    <Sun className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>
                  Risk Analysis & Performance Metrics
                  <div className="ml-auto">
                    <Star className="h-6 w-6 text-blue-400 drop-shadow-lg" />
                  </div>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Risk Distribution */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-blue-300">Risk Distribution</h3>
                    <div className="space-y-3">
                      {["conservative", "moderate", "aggressive"].map((risk) => {
                        const riskBuckets = buckets.filter(b => b.riskTolerance === risk)
                        const totalRiskAmount = riskBuckets.reduce((sum, bucket) => {
                          const values = calculateBucketValues(bucket)
                          return sum + values.estimatedPremium
                        }, 0)
                        const percentage = totalInvestibleAssets > 0 ? ((totalRiskAmount / totalInvestibleAssets) * 100).toFixed(1) : "0"
                        
                        return (
                          <div key={risk} className="p-4 bg-blue-900/20 rounded-lg border border-blue-700/20">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium capitalize">{risk}</span>
                              <span className="text-sm text-muted-foreground">{percentage}%</span>
                            </div>
                            <div className="w-full bg-blue-900/30 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="text-sm text-blue-300 mt-1">
                              ${formatCurrency(totalRiskAmount)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Investment Type Breakdown */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-blue-300">Investment Types</h3>
                    <div className="space-y-3">
                      {Array.from(new Set(buckets.map(b => b.investmentType))).map((type) => {
                        const typeBuckets = buckets.filter(b => b.investmentType === type)
                        const totalTypeAmount = typeBuckets.reduce((sum, bucket) => {
                          const values = calculateBucketValues(bucket)
                          return sum + values.estimatedPremium
                        }, 0)
                        const percentage = totalInvestibleAssets > 0 ? ((totalTypeAmount / totalInvestibleAssets) * 100).toFixed(1) : "0"
                        
                        return (
                          <div key={type} className="p-4 bg-blue-900/20 rounded-lg border border-blue-700/20">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">{type}</span>
                              <span className="text-sm text-muted-foreground">{percentage}%</span>
                            </div>
                            <div className="w-full bg-blue-900/30 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="text-sm text-blue-300 mt-1">
                              ${formatCurrency(totalTypeAmount)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Performance Summary */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-blue-300">Performance Summary</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-700/20">
                        <div className="text-sm text-muted-foreground mb-1">Total Investment</div>
                        <div className="text-2xl font-bold text-blue-300">${formatCurrency(totalInvestibleAssets)}</div>
                      </div>
                      <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-700/20">
                        <div className="text-sm text-muted-foreground mb-1">Projected Value</div>
                        <div className="text-2xl font-bold text-blue-300">
                          ${formatCurrency(buckets.reduce((sum, b) => sum + calculateBucketValues(b).futureValue, 0))}
                        </div>
                      </div>
                      <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-700/20">
                        <div className="text-sm text-muted-foreground mb-1">Total Annual Income</div>
                        <div className="text-2xl font-bold text-blue-300">
                          ${formatCurrency(buckets.reduce((sum, b) => sum + calculateBucketValues(b).incomeSolve, 0))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              </div>

              {/* Save/Error Messages */}
              {saveError && (
                <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
                  <p className="text-red-300 text-sm">{saveError}</p>
                </div>
              )}
              
              {saveSuccess && (
                <div className="p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
                  <p className="text-green-300 text-sm">Plan saved successfully!</p>
                </div>
              )}

              {/* Enhanced Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-8">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStage(2)} 
                  className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 border-green-400 text-green-300 hover:bg-green-500/10 hover:border-green-300 transition-all duration-300 transform hover:scale-105"
                >
                  ← Edit Plan
                </Button>
                <Button 
                  onClick={handleDownloadPDF}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  <TreePine className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                  Download PDF
                </Button>
                <Button 
                  onClick={handleSavePlan}
                  disabled={isSaving}
                  className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 bg-transparent border-green-400 text-green-300 hover:bg-green-500/10 hover:border-green-300 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {isSaving ? (editingPlanId ? 'Updating...' : 'Saving...') : (editingPlanId ? 'Update Plan' : 'Save Plan')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Hidden Light Mode Charts for PDF Export */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '800px', backgroundColor: '#ffffff' }}>
        {/* Portfolio Distribution Chart - Light Mode */}
        <div ref={pdfPieChartRef} data-chart="portfolio" style={{ backgroundColor: '#ffffff', padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <div style={{ height: '280px', backgroundColor: '#ffffff' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={buckets.map((bucket, index) => {
                    const values = calculateBucketValues(bucket)
                    const actualValue = bucket.premiumAmount || values.estimatedPremium
                    const totalAllocated = buckets.reduce((sum, b) => sum + (b.premiumAmount || 0), 0) || totalInvestibleAssets
                    return {
                      name: bucket.name,
                      amount: actualValue,
                      percentage: parseFloat(((actualValue / totalAllocated) * 100).toFixed(1)),
                      formattedAmount: formatCurrency(actualValue)
                    }
                  })}
                  layout="vertical"
                  margin={{ top: 10, right: 10, bottom: 10, left: 50 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    type="number"
                    tickFormatter={(value) => formatCurrency(value)}
                    style={{ fill: '#374151', fontSize: '11px' }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name"
                    width={45}
                    style={{ fill: '#000000', fontSize: '12px', fontWeight: '500' }}
                    tick={{ fill: '#000000' }}
                  />
                  <Bar 
                    dataKey="amount" 
                    radius={[0, 8, 8, 0]}
                    barSize={40}
                    label={({ x, y, width, height, value, payload }: any) => {
                      const amount = value || payload?.amount || 0
                      const percentage = payload?.percentage || 0
                      const labelX = x + width - 8
                      const labelY = y + height / 2
                      const labelText = `${formatCurrency(amount)} (${percentage}%)`
                      const useShortFormat = width < 120
                      const displayText = useShortFormat ? `${formatCurrency(amount)}` : labelText
                      
                      return (
                        <text
                          x={labelX}
                          y={labelY}
                          fill="#000000"
                          fontSize="11"
                          fontWeight="bold"
                          dominantBaseline="middle"
                          textAnchor="end"
                        >
                          {displayText}
                        </text>
                      )
                    }}
                  >
                    {buckets.map((bucket, index) => {
                      const colors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4"]
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={colors[index % colors.length]}
                        />
                      )
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Annual Income Chart - Light Mode */}
        <div ref={pdfBarChartRef} data-chart="income" style={{ backgroundColor: '#ffffff', padding: '20px' }}>
          <div style={{ height: '400px', backgroundColor: '#ffffff', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fill: '#374151' }} />
                <YAxis tick={{ fill: '#374151' }} />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '2px solid #3b82f6',
                    borderRadius: '12px',
                    color: '#000000',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    color: '#000000',
                    fontSize: '14px'
                  }}
                />
                <Bar dataKey="gross" fill="#3b82f6" name="Gross Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="net" fill="#10b981" name="Net Income" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Projection Timeline - Light Mode */}
        <div ref={pdfTimelineRef} data-chart="timeline" style={{ backgroundColor: '#ffffff', padding: '20px' }}>
          <div style={{ height: '400px', backgroundColor: '#ffffff', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={Array.from({ length: 20 }, (_, i) => {
                const year = i + 1
                const totalGrowth = buckets.reduce((sum, bucket) => {
                  const values = calculateBucketValues(bucket)
                  const growth = values.estimatedPremium * Math.pow(1 + bucket.interestRate / 100, year)
                  return sum + growth
                }, 0)
                
                const annualIncome = buckets.reduce((sum, bucket) => {
                  const values = calculateBucketValues(bucket)
                  const incomeStartYear = bucket.delayPeriod || 1
                  const incomeEndYear = incomeStartYear + (bucket.incomePeriods || 999)
                  
                  if (year >= incomeStartYear && year < incomeEndYear) {
                    let bucketIncome = 0
                    if (bucket.investmentType === "Lifetime Income") {
                      bucketIncome = values.incomeSolve || values.payments || values.annuityPayment || 0
                    } else if (bucket.investmentType === "Brokerage Portfolio") {
                      const portfolioValue = values.futureValue || values.estimatedPremium || 0
                      const withdrawalRate = 0.04
                      bucketIncome = portfolioValue * withdrawalRate
                    } else {
                      bucketIncome = values.payments || values.incomeSolve || values.annuityPayment || 0
                      if (bucketIncome === 0 && values.futureValue > 0) {
                        bucketIncome = (values.futureValue / (bucket.incomePeriods || 15)) * (1 + (bucket.interestRate || 0) / 100)
                      }
                    }
                    return sum + bucketIncome
                  }
                  return sum
                }, 0)
                
                const cumulativeIncome = buckets.reduce((sum, bucket) => {
                  const values = calculateBucketValues(bucket)
                  const incomeStartYear = bucket.delayPeriod || 1
                  
                  if (year >= incomeStartYear) {
                    const yearsSinceStart = year - incomeStartYear + 1
                    const maxIncomePeriods = bucket.incomePeriods || 999
                    const yearsOfIncome = Math.min(yearsSinceStart, maxIncomePeriods)
                    let bucketAnnualIncome = 0
                    if (bucket.investmentType === "Lifetime Income") {
                      bucketAnnualIncome = values.incomeSolve || values.payments || values.annuityPayment || 0
                    } else if (bucket.investmentType === "Brokerage Portfolio") {
                      const portfolioValue = values.futureValue || values.estimatedPremium || 0
                      const withdrawalRate = 0.04
                      bucketAnnualIncome = portfolioValue * withdrawalRate
                    } else {
                      bucketAnnualIncome = values.payments || values.incomeSolve || values.annuityPayment || 0
                      if (bucketAnnualIncome === 0 && values.futureValue > 0) {
                        bucketAnnualIncome = (values.futureValue / (bucket.incomePeriods || 15)) * (1 + (bucket.interestRate || 0) / 100)
                      }
                    }
                    return sum + (bucketAnnualIncome * yearsOfIncome)
                  }
                  return sum
                }, 0)
                
                return {
                  year: `Year ${year}`,
                  value: totalGrowth,
                  investment: totalInvestibleAssets,
                  income: cumulativeIncome,
                  annualIncome: annualIncome
                }
              })} margin={{ top: 10, right: 30, bottom: 10, left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" tick={{ fill: '#374151', fontSize: 12 }} />
                <YAxis 
                  tick={{ fill: '#374151', fontSize: 12 }} 
                  width={75}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
                    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
                    return `$${value.toFixed(0)}`
                  }}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '2px solid #10b981',
                    borderRadius: '12px',
                    color: '#000000',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    color: '#000000',
                    fontSize: '14px'
                  }}
                />
                <Line type="monotone" dataKey="investment" stroke="#9ca3af" name="Initial Investment" strokeDasharray="5 5" strokeWidth={2} />
                <Line type="monotone" dataKey="value" stroke="#10b981" name="Projected Value" strokeWidth={4} dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }} />
                <Line type="monotone" dataKey="income" stroke="#3b82f6" name="Cumulative Income" strokeWidth={4} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }} />
                <Line type="monotone" dataKey="annualIncome" stroke="#f59e0b" name="Annual Income" strokeWidth={3} strokeDasharray="4 4" dot={{ fill: '#f59e0b', strokeWidth: 2, r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      </div>
    </div>
    </TooltipProvider>
  )
}
