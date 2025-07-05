import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { 
  advisorBasecampService, 
  AdvisorBasecampData,
  BusinessGoals,
  CurrentValues,
  ClientMetrics,
  MarketingCampaign,
  CommissionRates,
  FinancialBook
} from '@/lib/advisor-basecamp'

export function useAdvisorBasecamp(user: User | null) {
  const [data, setData] = useState<AdvisorBasecampData>({
    campaigns: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data when user changes
  useEffect(() => {
    if (!user) {
      setData({ campaigns: [] })
      setLoading(false)
      return
    }

    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      const advisorData = await advisorBasecampService.getAllAdvisorBasecampData(user)
      setData(advisorData)
    } catch (err) {
      console.error('Error loading advisor basecamp data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const updateBusinessGoals = async (goals: BusinessGoals) => {
    if (!user) return false

    try {
      const updated = await advisorBasecampService.upsertBusinessGoals(user, goals)
      if (updated) {
        setData(prev => ({ ...prev, businessGoals: updated }))
        return true
      }
      return false
    } catch (err) {
      console.error('Error updating business goals:', err)
      setError('Failed to update business goals')
      return false
    }
  }

  const updateCurrentValues = async (values: CurrentValues) => {
    if (!user) return false

    try {
      const updated = await advisorBasecampService.upsertCurrentValues(user, values)
      if (updated) {
        setData(prev => ({ ...prev, currentValues: updated }))
        return true
      }
      return false
    } catch (err) {
      console.error('Error updating current values:', err)
      setError('Failed to update current values')
      return false
    }
  }

  const updateClientMetrics = async (metrics: ClientMetrics) => {
    if (!user) return false

    try {
      const updated = await advisorBasecampService.upsertClientMetrics(user, metrics)
      if (updated) {
        setData(prev => ({ ...prev, clientMetrics: updated }))
        return true
      }
      return false
    } catch (err) {
      console.error('Error updating client metrics:', err)
      setError('Failed to update client metrics')
      return false
    }
  }

  const addCampaign = async (campaign: Omit<MarketingCampaign, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return false

    try {
      const newCampaign = await advisorBasecampService.createMarketingCampaign(user, campaign)
      if (newCampaign) {
        setData(prev => ({ 
          ...prev, 
          campaigns: [newCampaign, ...prev.campaigns] 
        }))
        return true
      }
      return false
    } catch (err) {
      console.error('Error adding campaign:', err)
      setError('Failed to add campaign')
      return false
    }
  }

  const updateCampaign = async (id: string, campaign: Partial<MarketingCampaign>) => {
    if (!user) return false

    try {
      const updated = await advisorBasecampService.updateMarketingCampaign(user, id, campaign)
      if (updated) {
        setData(prev => ({
          ...prev,
          campaigns: prev.campaigns.map(c => c.id === id ? updated : c)
        }))
        return true
      }
      return false
    } catch (err) {
      console.error('Error updating campaign:', err)
      setError('Failed to update campaign')
      return false
    }
  }

  const deleteCampaign = async (id: string) => {
    if (!user) return false

    try {
      const success = await advisorBasecampService.deleteMarketingCampaign(user, id)
      if (success) {
        setData(prev => ({
          ...prev,
          campaigns: prev.campaigns.filter(c => c.id !== id)
        }))
        return true
      }
      return false
    } catch (err) {
      console.error('Error deleting campaign:', err)
      setError('Failed to delete campaign')
      return false
    }
  }

  const updateCommissionRates = async (rates: CommissionRates) => {
    if (!user) return false

    try {
      const updated = await advisorBasecampService.upsertCommissionRates(user, rates)
      if (updated) {
        setData(prev => ({ ...prev, commissionRates: updated }))
        return true
      }
      return false
    } catch (err) {
      console.error('Error updating commission rates:', err)
      setError('Failed to update commission rates')
      return false
    }
  }

  const updateFinancialBook = async (book: FinancialBook) => {
    if (!user) return false

    try {
      const updated = await advisorBasecampService.upsertFinancialBook(user, book)
      if (updated) {
        setData(prev => ({ ...prev, financialBook: updated }))
        return true
      }
      return false
    } catch (err) {
      console.error('Error updating financial book:', err)
      setError('Failed to update financial book')
      return false
    }
  }

  const saveAllData = async (newData: AdvisorBasecampData) => {
    if (!user) return false

    try {
      const success = await advisorBasecampService.saveAllAdvisorBasecampData(user, newData)
      if (success) {
        setData(newData)
        return true
      }
      return false
    } catch (err) {
      console.error('Error saving all data:', err)
      setError('Failed to save data')
      return false
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    data,
    loading,
    error,
    loadData,
    updateBusinessGoals,
    updateCurrentValues,
    updateClientMetrics,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    updateCommissionRates,
    updateFinancialBook,
    saveAllData,
    clearError
  }
} 