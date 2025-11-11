"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { clientPlanService, type PlanData } from "@/lib/client-plans"
import { pdfGenerator } from "@/lib/pdf-generator"
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { 
  FileText, 
  Download, 
  Trash2, 
  Edit, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  User,
  AlertCircle,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ClientPlan {
  id: string
  user_id: string
  client_name: string
  plan_name: string
  plan_data: PlanData
  created_at: string
  updated_at: string
}

export default function ClientPlansPage() {
  const { user } = useAuth()
  const [plans, setPlans] = useState<ClientPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    loadPlans()
  }, [])

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setProfile(null)
        return
      }
      const supabase = createClient()
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      setProfile(profileData)
    }
    fetchProfile()
  }, [user])

  const loadPlans = async () => {
    try {
      setLoading(true)
      const result = await clientPlanService.getPlans()
      
      if (result.success && result.plans) {
        setPlans(result.plans)
      } else {
        setError(result.error || 'Failed to load plans')
      }
    } catch (err) {
      console.error('Error loading plans:', err)
      setError('Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) {
      return
    }

    try {
      setDeletingPlanId(planId)
      const result = await clientPlanService.deletePlan(planId)
      
      if (result.success) {
        setPlans(plans.filter(plan => plan.id !== planId))
      } else {
        setError(result.error || 'Failed to delete plan')
      }
    } catch (err) {
      console.error('Error deleting plan:', err)
      setError('Failed to delete plan')
    } finally {
      setDeletingPlanId(null)
    }
  }

  const handleDownloadPDF = async (plan: ClientPlan) => {
    try {
      // For saved plans, we don't have access to the chart elements
      // So we'll generate a PDF without charts
      await pdfGenerator.downloadPDF(
        plan.plan_data,
        plan.client_name,
        plan.plan_name,
        undefined,
        profile?.company
      )
    } catch (err) {
      console.error('Error generating PDF:', err)
      setError('Failed to generate PDF')
    }
  }

  const handleEditPlan = (plan: ClientPlan) => {
    // Store the plan data in sessionStorage to load in the bucket plan tool
    sessionStorage.setItem('editingPlan', JSON.stringify({
      id: plan.id,
      clientData: plan.plan_data.clientData,
      buckets: plan.plan_data.buckets,
      calculationResults: plan.plan_data.calculationResults
    }))
    
    // Navigate to the bucket plan tool
    router.push('/tools/bucket-plan?edit=true')
  }

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const getTotalAssets = (planData: PlanData): number => {
    return planData.clientData.taxableFunds + 
           planData.clientData.taxDeferredFunds + 
           planData.clientData.taxFreeFunds
  }

  const getTotalIncome = (planData: PlanData): number => {
    return planData.buckets.reduce((sum, bucket) => {
      const bucketData = planData.calculationResults[bucket.id]
      return sum + (bucketData?.incomeSolve || 0)
    }, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your client plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-blue-300 mb-2">Client Plans</h1>
              <p className="text-muted-foreground">Manage and access your saved retirement plans</p>
            </div>
            <Link href="/tools/bucket-plan">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <FileText className="h-4 w-4 mr-2" />
                Create New Plan
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        {plans.length === 0 ? (
          <Card className="border-m8bs-card-alt/50 shadow-2xl bg-gradient-to-br from-m8bs-card/90 to-m8bs-card-alt/90 backdrop-blur-sm border-2">
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-blue-300 mb-2">No Plans Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first retirement plan to get started
              </p>
              <Link href="/tools/bucket-plan">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <FileText className="h-4 w-4 mr-2" />
                  Create New Plan
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className="border-m8bs-card-alt/50 shadow-2xl bg-gradient-to-br from-m8bs-card/90 to-m8bs-card-alt/90 backdrop-blur-sm border-2 transform hover:scale-[1.02] transition-all duration-300"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-blue-300 mb-1">
                        {plan.client_name}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {plan.plan_name}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {plan.plan_data.buckets.length} Bucket{plan.plan_data.buckets.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Plan Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Investment</span>
                      <span className="font-semibold text-green-300">
                        ${formatCurrency(getTotalAssets(plan.plan_data))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Annual Income</span>
                      <span className="font-semibold text-blue-300">
                        ${formatCurrency(getTotalIncome(plan.plan_data))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Risk Level</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          plan.plan_data.clientData.riskTolerance === 'conservative' 
                            ? 'border-green-500 text-green-400' 
                            : plan.plan_data.clientData.riskTolerance === 'moderate'
                            ? 'border-yellow-500 text-yellow-400'
                            : 'border-red-500 text-red-400'
                        }`}
                      >
                        {plan.plan_data.clientData.riskTolerance}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Created Date */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Created {new Date(plan.created_at).toLocaleDateString()}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPlan(plan)}
                      className="flex-1 text-xs text-blue-400 border-blue-700/30 hover:bg-blue-900/20"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPDF(plan)}
                      className="flex-1 text-xs"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePlan(plan.id)}
                      disabled={deletingPlanId === plan.id}
                      className="text-red-400 border-red-700/30 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  )
}
