import { useState, useEffect, useCallback, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { 
  advisorBasecampService, 
  AdvisorBasecampData,
  BusinessGoals,
  CurrentValues,
  ClientMetrics,
  MarketingCampaign,
  CommissionRates,
  FinancialBook,
  FinancialOptions,
  MonthlyDataEntry
} from '@/lib/advisor-basecamp'

export function useAdvisorBasecamp(user: User | null, year: number = new Date().getFullYear()) {
  const [data, setData] = useState<AdvisorBasecampData>({
    campaigns: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasLoadedRef = useRef(false)
  const userIdRef = useRef<string | null>(null)
  const yearRef = useRef<number>(year)

  // Internal load function
  const loadDataInternal = useCallback(async (targetUser: User, targetYear: number) => {
    if (!targetUser) return

    try {
      setLoading(true)
      setError(null)
      console.log('Loading advisor basecamp data for user:', targetUser.id, 'year:', targetYear)
      const advisorData = await advisorBasecampService.getAllAdvisorBasecampData(targetUser, targetYear)
      console.log('Loaded advisor basecamp data:', advisorData)
      setData(advisorData)
      hasLoadedRef.current = true
      userIdRef.current = targetUser.id
      yearRef.current = targetYear
    } catch (err) {
      console.error('Error loading advisor basecamp data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Public loadData function that uses current user and year (forces reload)
  const loadData = useCallback(async () => {
    if (!user) return
    // Reset the ref so it will reload even if data was previously loaded
    hasLoadedRef.current = false
    await loadDataInternal(user, year)
  }, [user, year, loadDataInternal])

  // Load data only on initial mount or when user/year changes
  useEffect(() => {
    if (!user) {
      setData({ campaigns: [] })
      setLoading(false)
      hasLoadedRef.current = false
      userIdRef.current = null
      return
    }

    // Only load if we haven't loaded yet, or if the user or year has changed
    if (!hasLoadedRef.current || userIdRef.current !== user.id || yearRef.current !== year) {
      loadDataInternal(user, year)
    } else {
      // Data already loaded for this user and year, just set loading to false
      setLoading(false)
    }
  }, [user?.id, year, loadDataInternal]) // Depend on user.id, year, and the stable loadDataInternal

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

  const updateFinancialOptions = async (options: FinancialOptions) => {
    if (!user) return false

    try {
      const updated = await advisorBasecampService.upsertFinancialOptions(user, options)
      if (updated) {
        setData(prev => ({ ...prev, financialOptions: updated }))
        return true
      }
      return false
    } catch (err) {
      console.error('Error updating financial options:', err)
      setError('Failed to update financial options')
      return false
    }
  }

  const addMonthlyDataEntry = async (entry: Omit<MonthlyDataEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      setError('User not authenticated')
      return false
    }

    try {
      const result = await advisorBasecampService.createMonthlyDataEntry(user, entry)
      if (result.data) {
        setData(prev => ({ 
          ...prev, 
          monthlyDataEntries: [result.data!, ...(prev.monthlyDataEntries || [])] 
        }))
        return true
      } else {
        setError(result.error || 'Failed to add monthly data entry')
        return false
      }
    } catch (err) {
      console.error('Error adding monthly data entry:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to add monthly data entry'
      setError(errorMessage)
      return false
    }
  }

  const updateMonthlyDataEntry = async (id: string, entry: Partial<MonthlyDataEntry>) => {
    if (!user) {
      setError('User not authenticated')
      return false
    }

    try {
      const result = await advisorBasecampService.updateMonthlyDataEntry(user, id, entry)
      if (result.data) {
        setData(prev => ({ 
          ...prev, 
          monthlyDataEntries: prev.monthlyDataEntries?.map(e => e.id === id ? result.data! : e) || []
        }))
        return true
      } else {
        setError(result.error || 'Failed to update monthly data entry')
        return false
      }
    } catch (err) {
      console.error('Error updating monthly data entry:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update monthly data entry'
      setError(errorMessage)
      return false
    }
  }

  const deleteMonthlyDataEntry = async (id: string) => {
    if (!user) return false

    try {
      const success = await advisorBasecampService.deleteMonthlyDataEntry(user, id)
      if (success) {
        setData(prev => ({ 
          ...prev, 
          monthlyDataEntries: prev.monthlyDataEntries?.filter(e => e.id !== id) || []
        }))
        return true
      }
      return false
    } catch (err) {
      console.error('Error deleting monthly data entry:', err)
      setError('Failed to delete monthly data entry')
      return false
    }
  }

  const saveAllData = async (newData: AdvisorBasecampData) => {
    if (!user) return false

    try {
      console.log('saveAllData: Starting save process...')
      console.log('saveAllData: Data to save:', JSON.stringify(newData, null, 2))
      const success = await advisorBasecampService.saveAllAdvisorBasecampData(user, newData)
      console.log('saveAllData: Save result:', success)
      
      if (success) {
        console.log('saveAllData: Save successful, reloading data from database...')
        // Add a small delay to ensure database write is complete
        await new Promise(resolve => setTimeout(resolve, 500))
        // Reload data from database to ensure we have the latest state
        await loadDataInternal(user, year)
        console.log('saveAllData: Data reloaded successfully')
        console.log('saveAllData: Reloaded data:', data)
        return true
      }
      console.error('saveAllData: Save failed')
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
    updateFinancialOptions,
    addMonthlyDataEntry,
    updateMonthlyDataEntry,
    deleteMonthlyDataEntry,
    saveAllData,
    clearError
  }
} 