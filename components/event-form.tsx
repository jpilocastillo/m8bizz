"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { createEvent, createEventExpenses, createEventAttendance, createEventAppointments, createEventFinancialProduction, updateEvent } from "@/lib/data"
import { useAuth } from "@/components/auth-provider"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils"
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Target, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Save,
  Calculator,
  ArrowLeft
} from "lucide-react"

// Currency formatting utilities for forms
const formatCurrencyInput = (value: string | number | undefined): string => {
  if (!value) return ""
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[$,]/g, '')) : value
  if (isNaN(numValue)) return ""
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue)
}

const parseCurrencyInput = (value: string): string => {
  return value.replace(/[$,]/g, '')
}

interface EventFormProps {
  initialData?: any
  isEditing?: boolean
  userId?: string
}

export function EventForm({ initialData, isEditing = false, userId }: EventFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("event")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const { user } = useAuth()

  // Event details
  const [name, setName] = useState("")
  const [date, setDate] = useState("")
  const [location, setLocation] = useState("")
  const [marketingType, setMarketingType] = useState("")
  const [topic, setTopic] = useState("")
  const [time, setTime] = useState("")
  const [ageRange, setAgeRange] = useState("")
  const [mileRadius, setMileRadius] = useState("")
  const [incomeAssets, setIncomeAssets] = useState("")
  const [marketingAudience, setMarketingAudience] = useState<string | null>(null)

  // Expenses
  const [advertisingCost, setAdvertisingCost] = useState("")
  const [foodVenueCost, setFoodVenueCost] = useState("")
  const [otherCosts, setOtherCosts] = useState("")

  // Attendance
  const [registrantResponses, setRegistrantResponses] = useState("")
  const [confirmations, setConfirmations] = useState("")
  const [attendees, setAttendees] = useState("")
  const [clientsFromEvent, setClientsFromEvent] = useState("")
  const [plateLickers, setPlateLickers] = useState("")

  // Appointments
  const [setAtEvent, setSetAtEvent] = useState("")
  const [setAfterEvent, setSetAfterEvent] = useState("")
  const [firstAppointmentAttended, setFirstAppointmentAttended] = useState("")
  const [firstAppointmentNoShows, setFirstAppointmentNoShows] = useState("")
  const [secondAppointmentAttended, setSecondAppointmentAttended] = useState("")
  const [notQualified, setNotQualified] = useState("")

  // Financial production
  const [annuityPremium, setAnnuityPremium] = useState("")
  const [lifeInsurancePremium, setLifeInsurancePremium] = useState("")
  const [aum, setAum] = useState("")
  const [aumFeePercentage, setAumFeePercentage] = useState("1.5")
  const [aumFees, setAumFees] = useState("")
  const [financialPlanning, setFinancialPlanning] = useState("")
  const [annuitiesSold, setAnnuitiesSold] = useState("")
  const [lifePoliciesSold, setLifePoliciesSold] = useState("")
  const [annuityCommissionPercentage, setAnnuityCommissionPercentage] = useState("")
  const [annuityCommission, setAnnuityCommission] = useState("")
  const [lifeInsuranceCommissionPercentage, setLifeInsuranceCommissionPercentage] = useState("")
  const [lifeInsuranceCommission, setLifeInsuranceCommission] = useState("")
  const [aumAccountsOpened, setAumAccountsOpened] = useState("")
  const [financialPlansSold, setFinancialPlansSold] = useState("")

  // Add state for 12-hour time input
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [ampm, setAmpm] = useState("AM");

  // Form validation and progress tracking
  const validateField = (field: string, value: string | number) => {
    const errors = { ...formErrors }
    
    switch (field) {
      case 'name':
        if (!value || value.toString().trim().length < 2) {
          errors.name = 'Event Name Must Be At Least 2 Characters'
        } else {
          delete errors.name
        }
        break
      case 'date':
        if (!value) {
          errors.date = 'Event Date Is Required'
        } else {
          delete errors.date
        }
        break
      case 'location':
        if (!value || value.toString().trim().length < 2) {
          errors.location = 'Location Must Be At Least 2 Characters'
        } else {
          delete errors.location
        }
        break
      case 'marketingType':
        if (!value) {
          errors.marketingType = 'Marketing Type Is Required'
        } else {
          delete errors.marketingType
        }
        break
      case 'topic':
        if (!value || value.toString().trim().length < 2) {
          errors.topic = 'Topic Must Be At Least 2 Characters'
        } else {
          delete errors.topic
        }
        break
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Calculate form completion progress - includes all fields across all tabs
  const formProgress = useMemo(() => {
    // Required fields (must be filled)
    const requiredFields = [
      { key: 'name', value: name },
      { key: 'date', value: date },
      { key: 'location', value: location },
      { key: 'marketingType', value: marketingType },
      { key: 'topic', value: topic }
    ]
    
    // Optional fields (count towards completion but not required)
    const optionalFields = [
      // Event details
      { key: 'time', value: hour && minute ? `${hour}:${minute} ${ampm}` : '' },
      { key: 'ageRange', value: ageRange },
      { key: 'mileRadius', value: mileRadius },
      { key: 'incomeAssets', value: incomeAssets },
      { key: 'marketingAudience', value: marketingAudience },
      // Expenses
      { key: 'advertisingCost', value: advertisingCost },
      { key: 'foodVenueCost', value: foodVenueCost },
      { key: 'otherCosts', value: otherCosts },
      // Attendance
      { key: 'registrantResponses', value: registrantResponses },
      { key: 'confirmations', value: confirmations },
      { key: 'attendees', value: attendees },
      { key: 'clientsFromEvent', value: clientsFromEvent },
      { key: 'plateLickers', value: plateLickers },
      // Appointments
      { key: 'setAtEvent', value: setAtEvent },
      { key: 'setAfterEvent', value: setAfterEvent },
      { key: 'firstAppointmentAttended', value: firstAppointmentAttended },
      { key: 'firstAppointmentNoShows', value: firstAppointmentNoShows },
      { key: 'secondAppointmentAttended', value: secondAppointmentAttended },
      { key: 'notQualified', value: notQualified },
      // Financial
      { key: 'annuityPremium', value: annuityPremium },
      { key: 'annuitiesSold', value: annuitiesSold },
      { key: 'annuityCommissionPercentage', value: annuityCommissionPercentage },
      { key: 'lifeInsurancePremium', value: lifeInsurancePremium },
      { key: 'lifePoliciesSold', value: lifePoliciesSold },
      { key: 'lifeInsuranceCommissionPercentage', value: lifeInsuranceCommissionPercentage },
      { key: 'aum', value: aum },
      { key: 'aumAccountsOpened', value: aumAccountsOpened },
      { key: 'aumFeePercentage', value: aumFeePercentage },
      { key: 'financialPlanning', value: financialPlanning },
      { key: 'financialPlansSold', value: financialPlansSold }
    ]
    
    const allFields = [...requiredFields, ...optionalFields]
    const completedFields = allFields.filter(field => {
      const val = field.value
      return val !== null && val !== undefined && val !== '' && val.toString().trim().length > 0
    }).length
    
    return Math.round((completedFields / allFields.length) * 100)
  }, [
    name, date, location, marketingType, topic,
    hour, minute, ampm, ageRange, mileRadius, incomeAssets, marketingAudience,
    advertisingCost, foodVenueCost, otherCosts,
    registrantResponses, confirmations, attendees, clientsFromEvent, plateLickers,
    setAtEvent, setAfterEvent, firstAppointmentAttended, firstAppointmentNoShows, secondAppointmentAttended, notQualified,
    annuityPremium, annuitiesSold, annuityCommissionPercentage,
    lifeInsurancePremium, lifePoliciesSold, lifeInsuranceCommissionPercentage,
    aum, aumAccountsOpened, aumFeePercentage, financialPlanning, financialPlansSold
  ])

  // Check if required fields are complete
  const requiredFieldsComplete = useMemo(() => {
    return name && name.trim().length >= 2 &&
           date &&
           location && location.trim().length >= 2 &&
           marketingType && marketingType.trim().length > 0 &&
           topic && topic.trim().length >= 2
  }, [name, date, location, marketingType, topic])

  // Auto-calculate financial fields
  useEffect(() => {
    if (aum && aumFeePercentage) {
      const calculated = (parseFloat(aum) * parseFloat(aumFeePercentage)) / 100
      setAumFees(calculated.toFixed(2))
    }
  }, [aum, aumFeePercentage])

  useEffect(() => {
    if (annuityPremium && annuityCommissionPercentage) {
      const calculated = (parseFloat(annuityPremium) * parseFloat(annuityCommissionPercentage)) / 100
      setAnnuityCommission(calculated.toFixed(2))
    }
  }, [annuityPremium, annuityCommissionPercentage])

  useEffect(() => {
    if (lifeInsurancePremium && lifeInsuranceCommissionPercentage) {
      const calculated = (parseFloat(lifeInsurancePremium) * parseFloat(lifeInsuranceCommissionPercentage)) / 100
      setLifeInsuranceCommission(calculated.toFixed(2))
    }
  }, [lifeInsurancePremium, lifeInsuranceCommissionPercentage])

  useEffect(() => {
    if (initialData) {
      // Event details
      setName(initialData.eventDetails?.name || "")
      setDate(initialData.eventDetails?.date || "")
      setLocation(initialData.eventDetails?.location || "")
      setMarketingType(initialData.eventDetails?.marketing_type || "")
      setTopic(initialData.eventDetails?.topic || "")
      setTime(initialData.eventDetails?.time || "")
      setAgeRange(initialData.eventDetails?.age_range || "")
      setMileRadius(initialData.eventDetails?.mile_radius || "")
      setIncomeAssets(initialData.eventDetails?.income_assets || "")
      setMarketingAudience(
        initialData.eventDetails?.marketing_audience !== undefined &&
        initialData.eventDetails?.marketing_audience !== null
          ? initialData.eventDetails.marketing_audience.toString()
          : ""
      )

      // Expenses
      setAdvertisingCost(initialData.marketingExpenses?.advertising?.toString() || "")
      setFoodVenueCost(initialData.marketingExpenses?.foodVenue?.toString() || "")
      setOtherCosts(initialData.marketingExpenses?.other?.toString() || "")

      // Attendance
      setRegistrantResponses(initialData.attendance?.registrantResponses?.toString() || "")
      setConfirmations(initialData.attendance?.confirmations?.toString() || "")
      setAttendees(initialData.attendance?.attendees?.toString() || "")
      setClientsFromEvent(initialData.attendance?.clients_from_event?.toString() || "")
      setPlateLickers(initialData.attendance?.plate_lickers?.toString() || "")

      // Appointments
      setSetAtEvent(initialData.appointments?.setAtEvent?.toString() || "")
      setSetAfterEvent(initialData.appointments?.setAfterEvent?.toString() || "")
      setFirstAppointmentAttended(initialData.appointments?.firstAppointmentAttended?.toString() || "")
      setFirstAppointmentNoShows(initialData.appointments?.firstAppointmentNoShows?.toString() || "")
      setSecondAppointmentAttended(initialData.appointments?.secondAppointmentAttended?.toString() || "")
      setNotQualified(initialData.appointments?.notQualified?.toString() || "")

      // Financial production
      setAnnuityPremium(initialData.financialProduction?.annuity_premium?.toString() || "")
      setLifeInsurancePremium(initialData.financialProduction?.life_insurance_premium?.toString() || "")
      setAum(initialData.financialProduction?.aum?.toString() || "")
      const existingAumFees = initialData.financialProduction?.aum_fees || 0
      const existingAum = initialData.financialProduction?.aum || 0
      const calculatedPercentage = existingAum > 0 ? ((existingAumFees / existingAum) * 100).toFixed(2) : "1.5"
      setAumFeePercentage(calculatedPercentage)
      setAumFees(existingAumFees.toString())
      setFinancialPlanning(initialData.financialProduction?.financial_planning?.toString() || "")
      setAnnuitiesSold(initialData.financialProduction?.annuities_sold?.toString() || "")
      setLifePoliciesSold(initialData.financialProduction?.life_policies_sold?.toString() || "")
      setAnnuityCommission(initialData.financialProduction?.annuity_commission?.toString() || "")
      setLifeInsuranceCommission(initialData.financialProduction?.life_insurance_commission?.toString() || "")
      // Calculate percentage from existing annuity commission
      const existingCommission = initialData.financialProduction?.annuity_commission || 0
      const existingPremium = initialData.financialProduction?.annuity_premium || 0
      const annuityCommissionPercentage = existingPremium > 0 ? ((existingCommission / existingPremium) * 100).toFixed(2) : ""
      setAnnuityCommissionPercentage(annuityCommissionPercentage)
      setAnnuityCommission(existingCommission.toString())
      // Calculate percentage from existing life insurance commission
      const existingLifeCommission = initialData.financialProduction?.life_insurance_commission || 0
      const lifeInsuranceCommissionPercentage = existingPremium > 0 ? ((existingLifeCommission / existingPremium) * 100).toFixed(2) : ""
      setLifeInsuranceCommissionPercentage(lifeInsuranceCommissionPercentage)
      setLifeInsuranceCommission(existingLifeCommission.toString())
      setAumAccountsOpened(initialData.financialProduction?.aum_accounts_opened?.toString() || "")
      setFinancialPlansSold(initialData.financialProduction?.financial_plans_sold?.toString() || "")

      // Parse 24-hour time to 12-hour
      if (initialData.eventDetails?.time) {
        const [h, m] = initialData.eventDetails.time.split(":");
        let hourNum = parseInt(h, 10);
        const ampmVal = hourNum >= 12 ? "PM" : "AM";
        hourNum = hourNum % 12 || 12;
        setHour(hourNum.toString().padStart(2, "0"));
        setMinute(m);
        setAmpm(ampmVal);
      } else {
        setHour("");
        setMinute("");
        setAmpm("AM");
      }
    }
  }, [initialData])

  // Calculate AUM fees when AUM or percentage changes
  useEffect(() => {
    const aumValue = parseFloat(aum) || 0
    const percentage = parseFloat(aumFeePercentage) || 0
    const annualFees = (aumValue * percentage) / 100
    setAumFees(annualFees.toFixed(2))
  }, [aum, aumFeePercentage])

  // Calculate annuity commission when premium or percentage changes
  useEffect(() => {
    const premiumValue = parseFloat(annuityPremium) || 0
    const percentage = parseFloat(annuityCommissionPercentage) || 0
    const commission = (premiumValue * percentage) / 100
    setAnnuityCommission(commission.toFixed(2))
  }, [annuityPremium, annuityCommissionPercentage])

  // Calculate life insurance commission when premium or percentage changes
  useEffect(() => {
    const premiumValue = parseFloat(lifeInsurancePremium) || 0
    const percentage = parseFloat(lifeInsuranceCommissionPercentage) || 0
    const commission = (premiumValue * percentage) / 100
    setLifeInsuranceCommission(commission.toFixed(2))
  }, [lifeInsurancePremium, lifeInsuranceCommissionPercentage])

  const calculateTotalCost = () => {
    const adCost = Number.parseFloat(advertisingCost) || 0
    const foodCost = Number.parseFloat(foodVenueCost) || 0
    const other = Number.parseFloat(otherCosts) || 0
    return adCost + foodCost + other
  }

  const calculateTotalProduction = () => {
    const aumFeesValue = parseFloat(aumFees) || 0
    const annuityCommissionValue = parseFloat(annuityCommission) || 0
    const lifeInsuranceCommissionValue = parseFloat(lifeInsuranceCommission) || 0
    const planningValue = parseFloat(financialPlanning) || 0
    return aumFeesValue + annuityCommissionValue + lifeInsuranceCommissionValue + planningValue
  }

  // Helper to convert to 24-hour format
  function to24HourFormat(hour: string | number, minute: string | number, ampm: string): string {
    let h = parseInt(hour.toString(), 10);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submission started')
    setIsSubmitting(true)

    try {
      const currentUserId = userId || user?.id
      console.log('Current user ID:', currentUserId)
      
      if (!currentUserId) {
        console.error("No user ID available")
        toast({
          variant: "destructive",
          title: "Error",
          description: "You Must Be Logged In To Create An Event.",
        })
        return
      }

      // Validate required fields
      const requiredFields = {
        name,
        date,
        location,
        marketingType,
        topic
      }

      console.log('Validating required fields:', requiredFields)

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => {
          switch (key) {
            case 'name': return 'Event Name'
            case 'date': return 'Date'
            case 'location': return 'Location'
            case 'marketingType': return 'Marketing Type'
            case 'topic': return 'Topic'
            default: return key
          }
        })

      if (missingFields.length > 0) {
        console.log('Missing required fields:', missingFields)
        toast({
          variant: "destructive",
          title: "Missing Required Fields",
          description: `Please fill in the following fields: ${missingFields.join(", ")}`,
        })
        return
      }

      // Prepare the event data
      const time24 = hour && minute ? to24HourFormat(hour, minute, ampm) : null;
      const eventData = {
        name,
        date,
        location,
        marketing_type: marketingType,
        topic,
        time: time24,
        age_range: ageRange,
        mile_radius: mileRadius,
        income_assets: incomeAssets,
        marketing_audience:
          marketingAudience === "" || marketingAudience === null
            ? null
            : parseInt(marketingAudience, 10),
        status: 'active',
        relatedData: {
          attendance: {
            registrant_responses: parseInt(registrantResponses) || 0,
            confirmations: parseInt(confirmations) || 0,
            attendees: parseInt(attendees) || 0,
            clients_from_event: parseInt(clientsFromEvent) || 0,
            plate_lickers: parseInt(plateLickers) || 0
          },
          expenses: {
            advertising_cost: parseFloat(advertisingCost) || 0,
            food_venue_cost: parseFloat(foodVenueCost) || 0,
            other_costs: parseFloat(otherCosts) || 0
          },
          appointments: {
            set_at_event: parseInt(setAtEvent) || 0,
            set_after_event: parseInt(setAfterEvent) || 0,
            first_appointment_attended: parseInt(firstAppointmentAttended) || 0,
            first_appointment_no_shows: parseInt(firstAppointmentNoShows) || 0,
            second_appointment_attended: parseInt(secondAppointmentAttended) || 0,
            not_qualified: parseInt(notQualified) || 0
          },
          financialProduction: {
            annuity_premium: parseFloat(annuityPremium) || 0,
            life_insurance_premium: parseFloat(lifeInsurancePremium) || 0,
            aum: parseFloat(aum) || 0,
            financial_planning: parseFloat(financialPlanning) || 0,
            annuities_sold: parseInt(annuitiesSold) || 0,
            life_policies_sold: parseInt(lifePoliciesSold) || 0,
            annuity_commission: parseFloat(annuityCommission) || 0,
            life_insurance_commission: parseFloat(lifeInsuranceCommission) || 0,
            aum_fees: parseFloat(aumFees) || 0,
            aum_accounts_opened: parseInt(aumAccountsOpened) || 0,
            financial_plans_sold: parseInt(financialPlansSold) || 0,
          }
        }
      }

      console.log('Submitting event data with plate lickers:', {
        plateLickers,
        parsedPlateLickers: parseInt(plateLickers) || 0,
        fullEventData: eventData
      });

      let result;
      if (isEditing && initialData?.eventId) {
        console.log('Updating existing event:', initialData.eventId)
        result = await updateEvent(initialData.eventId, eventData)
      } else {
        console.log('Creating new event...')
        result = await createEvent(currentUserId, eventData)
      }

      if (!result.success) {
        console.error("Error with event operation:", result.error)
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || `Failed To ${isEditing ? 'Update' : 'Create'} Event. Please Try Again.`,
        })
        return
      }

      console.log('Event operation completed successfully')

      toast({
        title: "Success",
          description: `Event ${isEditing ? 'Updated' : 'Created'} Successfully!`,
      })

      // Get the event ID - for new events it's in result.eventId, for updates use initialData.eventId
      const eventId = isEditing ? initialData?.eventId : result.eventId
      
      console.log('Redirecting to single event dashboard...')
      router.push("/single-event")
      router.refresh()
    } catch (error) {
      console.error('Detailed error:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        cause: error instanceof Error ? error.cause : undefined
      })
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNextTab = () => {
    if (activeTab === "event") setActiveTab("expenses")
    else if (activeTab === "expenses") setActiveTab("attendance")
    else if (activeTab === "attendance") setActiveTab("appointments")
    else if (activeTab === "appointments") setActiveTab("financial")
  }

  const handlePrevTab = () => {
    if (activeTab === "financial") setActiveTab("appointments")
    else if (activeTab === "appointments") setActiveTab("attendance")
    else if (activeTab === "attendance") setActiveTab("expenses")
    else if (activeTab === "expenses") setActiveTab("event")
  }

  const handleUpdateEvent = async () => {
    console.log('Update event triggered from tab:', activeTab)
    setIsSubmitting(true)

    try {
      const currentUserId = userId || user?.id
      console.log('Current user ID:', currentUserId)
      
      if (!currentUserId) {
        console.error("No user ID available")
        toast({
          variant: "destructive",
          title: "Error",
          description: "You Must Be Logged In To Update An Event.",
        })
        return
      }

      // Validate required fields
      const requiredFields = {
        name,
        date,
        location,
        marketingType,
        topic
      }

      console.log('Validating required fields:', requiredFields)

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => {
          switch (key) {
            case 'name': return 'Event Name'
            case 'date': return 'Date'
            case 'location': return 'Location'
            case 'marketingType': return 'Marketing Type'
            case 'topic': return 'Topic'
            default: return key
          }
        })

      if (missingFields.length > 0) {
        console.log('Missing required fields:', missingFields)
        toast({
          variant: "destructive",
          title: "Missing Required Fields",
          description: `Please fill in the following fields: ${missingFields.join(", ")}`,
        })
        return
      }

      // Prepare the event data
      const time24 = hour && minute ? to24HourFormat(hour, minute, ampm) : null;
      const eventData = {
        name,
        date,
        location,
        marketing_type: marketingType,
        topic,
        time: time24,
        age_range: ageRange,
        mile_radius: mileRadius,
        income_assets: incomeAssets,
        marketing_audience:
          marketingAudience === "" || marketingAudience === null
            ? null
            : parseInt(marketingAudience, 10),
        status: 'active',
        relatedData: {
          attendance: {
            registrant_responses: parseInt(registrantResponses) || 0,
            confirmations: parseInt(confirmations) || 0,
            attendees: parseInt(attendees) || 0,
            clients_from_event: parseInt(clientsFromEvent) || 0,
            plate_lickers: parseInt(plateLickers) || 0
          },
          expenses: {
            advertising_cost: parseFloat(advertisingCost) || 0,
            food_venue_cost: parseFloat(foodVenueCost) || 0,
            other_costs: parseFloat(otherCosts) || 0
          },
          appointments: {
            set_at_event: parseInt(setAtEvent) || 0,
            set_after_event: parseInt(setAfterEvent) || 0,
            first_appointment_attended: parseInt(firstAppointmentAttended) || 0,
            first_appointment_no_shows: parseInt(firstAppointmentNoShows) || 0,
            second_appointment_attended: parseInt(secondAppointmentAttended) || 0,
            not_qualified: parseInt(notQualified) || 0
          },
          financialProduction: {
            annuity_premium: parseFloat(annuityPremium) || 0,
            life_insurance_premium: parseFloat(lifeInsurancePremium) || 0,
            aum: parseFloat(aum) || 0,
            financial_planning: parseFloat(financialPlanning) || 0,
            annuities_sold: parseInt(annuitiesSold) || 0,
            life_policies_sold: parseInt(lifePoliciesSold) || 0,
            annuity_commission: parseFloat(annuityCommission) || 0,
            life_insurance_commission: parseFloat(lifeInsuranceCommission) || 0,
            aum_fees: parseFloat(aumFees) || 0,
            aum_accounts_opened: parseInt(aumAccountsOpened) || 0,
            financial_plans_sold: parseInt(financialPlansSold) || 0,
          }
        }
      }

      console.log('Updating event data:', eventData);

      if (!initialData?.eventId) {
        console.error("No event ID available for update")
        toast({
          variant: "destructive",
          title: "Error",
          description: "Event ID not found. Cannot update event.",
        })
        return
      }

      const result = await updateEvent(initialData.eventId, eventData)

      if (!result.success) {
        console.error("Error updating event:", result.error)
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to update event. Please try again.",
        })
        return
      }

      console.log('Event updated successfully')

      toast({
        title: "Success",
        description: "Event updated successfully!",
      })

      // Redirect to single event dashboard after update
      router.push("/single-event")
      router.refresh()
    } catch (error) {
      console.error('Detailed error:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        cause: error instanceof Error ? error.cause : undefined
      })
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate total revenue
  const calculateTotalRevenue = () => {
    const annuityValue = parseFloat(annuityPremium) || 0
    const lifeValue = parseFloat(lifeInsurancePremium) || 0
    const aumValue = parseFloat(aum) || 0
    const planningValue = parseFloat(financialPlanning) || 0
    return annuityValue + lifeValue + aumValue + planningValue
  }

  // Calculate total commissions
  const calculateTotalCommissions = () => {
    const annuityCommissionValue = parseFloat(annuityCommission) || 0
    const lifeCommissionValue = parseFloat(lifeInsuranceCommission) || 0
    const aumFeesValue = parseFloat(aumFees) || 0
    const planningValue = parseFloat(financialPlanning) || 0
    return annuityCommissionValue + lifeCommissionValue + aumFeesValue + planningValue
  }

  return (
    <div className="space-y-6">
      {/* Form Header with Progress */}
      <Card className="bg-black border-m8bs-border shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="h-6 w-6 text-m8bs-blue" />
                {isEditing ? 'Edit Event' : 'Create New Event'}
              </CardTitle>
              <CardDescription className="text-m8bs-muted mt-1">
                {isEditing ? 'Update your marketing event details' : 'Set up a new marketing event. Fill in what you have - only basic event details are required.'}
              </CardDescription>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Form Completion</span>
              <Badge variant="secondary" className="bg-m8bs-blue/20 text-m8bs-blue border-m8bs-blue/50">
                {formProgress}%
              </Badge>
            </div>
            <Progress value={formProgress} className="h-2 bg-m8bs-border" />
            {requiredFieldsComplete && (
              <div className="flex items-center gap-2 mt-2 text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Ready to submit! (Required fields complete)</span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>


      {/* Form Errors Alert */}
      {Object.keys(formErrors).length > 0 && (
        <Alert className="bg-red-900/20 border-red-800/40 text-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the following errors: {Object.values(formErrors).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-black p-1 border border-m8bs-border rounded-lg shadow-lg">
            <TabsTrigger value="event" className="data-[state=active]:bg-m8bs-blue data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-m8bs-blue/20 flex items-center gap-2 transition-all duration-200">
              <Calendar className="h-4 w-4" />
              Event Details
            </TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:bg-m8bs-blue data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-m8bs-blue/20 flex items-center gap-2 transition-all duration-200">
              <DollarSign className="h-4 w-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="attendance" className="data-[state=active]:bg-m8bs-blue data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-m8bs-blue/20 flex items-center gap-2 transition-all duration-200">
              <Users className="h-4 w-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="appointments" className="data-[state=active]:bg-m8bs-blue data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-m8bs-blue/20 flex items-center gap-2 transition-all duration-200">
              <Target className="h-4 w-4" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-m8bs-blue data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-m8bs-blue/20 flex items-center gap-2 transition-all duration-200">
              <TrendingUp className="h-4 w-4" />
              Financial
            </TabsTrigger>
          </TabsList>

        <TabsContent value="event" className="space-y-4">
          <Card className="bg-black border-m8bs-border shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-m8bs-blue" />
                Event Information
              </CardTitle>
              <CardDescription className="text-m8bs-muted">
                Enter The Basic Details About Your Marketing Event. Fields Marked With * Are Required. All Other Fields Are Optional.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white font-semibold flex items-center gap-1 text-sm">
                    Event Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      validateField('name', e.target.value)
                    }}
                    className={`bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md ${
                      formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''
                    }`}
                    placeholder="Enter Event Name (E.g., Retirement Planning Seminar)"
                    required
                  />
                  {formErrors.name && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-white font-medium flex items-center gap-1">
                    Event Date <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value)
                      validateField('date', e.target.value)
                    }}
                    className={`bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md ${
                      formErrors.date ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''
                    }`}
                    required
                  />
                  {formErrors.date && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.date}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-white font-medium flex items-center gap-1">
                    Location <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value)
                      validateField('location', e.target.value)
                    }}
                    className={`bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md ${
                      formErrors.location ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''
                    }`}
                    placeholder="Enter Venue Location"
                    required
                  />
                  {formErrors.location && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.location}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-white font-medium">
                    Time
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="hour"
                      type="number"
                      min="1"
                      max="12"
                      value={hour}
                      onChange={e => setHour(e.target.value)}
                      placeholder="HH"
                      className="w-16 bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                    />
                    <span>:</span>
                    <Input
                      id="minute"
                      type="number"
                      min="0"
                      max="59"
                      value={minute}
                      onChange={e => setMinute(e.target.value)}
                      placeholder="MM"
                      className="w-16 bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                    />
                    <select value={ampm} onChange={e => setAmpm(e.target.value)} className="bg-black border border-m8bs-border text-white rounded-md px-3 py-2 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200">
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marketingType" className="text-white font-medium">
                    Marketing Type
                  </Label>
                  <Input
                    id="marketingType"
                    value={marketingType}
                    onChange={(e) => setMarketingType(e.target.value)}
                    className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                    placeholder="E.g. MBI Mailer, Facebook Ads"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-white font-medium">
                    Topic
                  </Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                    placeholder="E.g. Retirement Outlook"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageRange" className="text-white font-medium">
                    Age Range
                  </Label>
                  <Input
                    id="ageRange"
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                    placeholder="E.g. 58-71"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileRadius" className="text-white font-medium">
                    Mile Radius
                  </Label>
                  <Input
                    id="mileRadius"
                    value={mileRadius}
                    onChange={(e) => setMileRadius(e.target.value)}
                    className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                    placeholder="E.g. 10-15 Mi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incomeAssets" className="text-white font-medium">
                    Income/Assets
                  </Label>
                  <Input
                    id="incomeAssets"
                    value={incomeAssets}
                    onChange={(e) => setIncomeAssets(e.target.value)}
                    className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                    placeholder="E.g. 500k-2m"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marketingAudience" className="text-white font-medium">
                    Marketing Audience Size
                  </Label>
                  <Input
                    id="marketingAudience"
                    type="number"
                    min="0"
                    value={marketingAudience ?? ""}
                    onChange={e => setMarketingAudience(e.target.value === "" ? null : e.target.value)}
                    className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                    placeholder="Enter Total Number Of People"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card className="bg-black border-m8bs-border shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-m8bs-blue" />
                Marketing Expenses
              </CardTitle>
              <CardDescription className="text-m8bs-muted">
                Enter The Expenses Associated With This Marketing Event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="advertisingCost" className="text-white font-medium">
                    Advertising Cost ($)
                  </Label>
                  <Input
                    id="advertisingCost"
                    type="text"
                    value={formatCurrencyInput(advertisingCost)}
                    onChange={(e) => {
                      const rawValue = parseCurrencyInput(e.target.value)
                      setAdvertisingCost(rawValue)
                    }}
                    className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                    placeholder="$0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="foodVenueCost" className="text-white font-medium">
                    Food/Venue Cost ($)
                  </Label>
                  <Input
                    id="foodVenueCost"
                    type="text"
                    value={formatCurrencyInput(foodVenueCost)}
                    onChange={(e) => {
                      const rawValue = parseCurrencyInput(e.target.value)
                      setFoodVenueCost(rawValue)
                    }}
                    className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                    placeholder="$0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherCosts" className="text-white font-medium">
                    Other Costs ($)
                  </Label>
                  <Input
                    id="otherCosts"
                    type="text"
                    value={formatCurrencyInput(otherCosts)}
                    onChange={(e) => {
                      const rawValue = parseCurrencyInput(e.target.value)
                      setOtherCosts(rawValue)
                    }}
                    className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                    placeholder="$0"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white font-medium">Total Cost ($)</Label>
                  <div className="bg-black border border-m8bs-border rounded-md p-3 text-white font-medium">
                    {formatCurrencyUtil(calculateTotalCost())}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card className="bg-black border-m8bs-border shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Attendance Information
              </CardTitle>
              <CardDescription>Enter Attendance Details For This Marketing Event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrantResponses" className="text-white font-medium">
                    Registrant Responses (BU)
                  </Label>
                  <Input
                    id="registrantResponses"
                    type="number"
                    value={registrantResponses}
                    onChange={(e) => setRegistrantResponses(e.target.value)}
                    className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmations" className="text-white font-medium">
                    Confirmations (BU)
                  </Label>
                  <Input
                    id="confirmations"
                    type="number"
                    value={confirmations}
                    onChange={(e) => setConfirmations(e.target.value)}
                    className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendees" className="text-white font-medium">
                    Attendees (BU)
                  </Label>
                  <Input
                    id="attendees"
                    type="number"
                    value={attendees}
                    onChange={(e) => setAttendees(e.target.value)}
                    className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientsFromEvent" className="text-white font-medium">
                    Clients From Event
                  </Label>
                  <Input
                    id="clientsFromEvent"
                    type="number"
                    value={clientsFromEvent}
                    onChange={(e) => setClientsFromEvent(e.target.value)}
                    className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plateLickers" className="text-white font-medium">
                    Plate Lickers
                  </Label>
                  <Input
                    id="plateLickers"
                    type="number"
                    value={plateLickers}
                    onChange={(e) => setPlateLickers(e.target.value)}
                    className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                    placeholder="No Interest In Appointments Or Services"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card className="bg-black border-m8bs-border shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Appointment Tracking
              </CardTitle>
              <CardDescription>Enter appointment details for this marketing event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="setAtEvent" className="text-white font-medium">
                    Appointments Set at Event
                  </Label>
                  <Input
                    id="setAtEvent"
                    type="number"
                    value={setAtEvent}
                    onChange={(e) => setSetAtEvent(e.target.value)}
                    className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setAfterEvent" className="text-white font-medium">
                    Appointments Set After Event
                  </Label>
                  <Input
                    id="setAfterEvent"
                    type="number"
                    value={setAfterEvent}
                    onChange={(e) => setSetAfterEvent(e.target.value)}
                    className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstAppointmentAttended" className="text-white font-medium">
                    First Appointments Attended
                  </Label>
                  <Input
                    id="firstAppointmentAttended"
                    type="number"
                    value={firstAppointmentAttended}
                    onChange={(e) => setFirstAppointmentAttended(e.target.value)}
                    className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstAppointmentNoShows" className="text-white font-medium">
                    First Appointment No-Shows
                  </Label>
                  <Input
                    id="firstAppointmentNoShows"
                    type="number"
                    value={firstAppointmentNoShows}
                    onChange={(e) => setFirstAppointmentNoShows(e.target.value)}
                    className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondAppointmentAttended" className="text-white font-medium">
                    Second Appointments Attended
                  </Label>
                  <Input
                    id="secondAppointmentAttended"
                    type="number"
                    value={secondAppointmentAttended}
                    onChange={(e) => setSecondAppointmentAttended(e.target.value)}
                    className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notQualified" className="text-white font-medium">
                    Not Qualified
                  </Label>
                  <Input
                    id="notQualified"
                    type="number"
                    value={notQualified}
                    onChange={(e) => setNotQualified(e.target.value)}
                    className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                    placeholder="Number Of Prospects Not Qualified"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card className="bg-black border-m8bs-border shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-m8bs-blue" />
                Financial Production
              </CardTitle>
              <CardDescription className="text-m8bs-muted">
                Enter Financial Results From This Marketing Event. Auto-Calculations Will Help You Determine Commissions And Fees.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Annuity Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-m8bs-border pb-2">Annuity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="annuitiesSold" className="text-white font-medium">
                      Annuities Sold
                    </Label>
                    <Input
                      id="annuitiesSold"
                      type="number"
                      value={annuitiesSold}
                      onChange={(e) => setAnnuitiesSold(e.target.value)}
                      className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annuityPremium" className="text-white font-medium flex items-center gap-1">
                      Annuity Premium ($) <Calculator className="h-3 w-3 text-m8bs-blue" />
                    </Label>
                    <Input
                      id="annuityPremium"
                      type="text"
                      value={formatCurrencyInput(annuityPremium)}
                      onChange={(e) => {
                        const rawValue = parseCurrencyInput(e.target.value)
                        setAnnuityPremium(rawValue)
                      }}
                      className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                      placeholder="$0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annuityCommissionPercentage" className="text-white font-medium">
                      Annuity Commission Percentage (%)
                    </Label>
                    <Input
                      id="annuityCommissionPercentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={annuityCommissionPercentage}
                      onChange={(e) => setAnnuityCommissionPercentage(e.target.value)}
                      className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annuityCommission" className="text-white font-medium">
                      Annuity Commission ($)
                    </Label>
                    <div className="bg-black border border-m8bs-border rounded-md p-3 text-white font-medium">
                      {formatCurrencyUtil(parseFloat(annuityCommission) || 0)}
                    </div>
                    {annuityPremium && annuityCommissionPercentage && (
                      <div className="text-xs text-m8bs-muted flex items-center gap-1">
                        <Calculator className="h-3 w-3" />
                        Auto-calculated
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AUM Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-m8bs-border pb-2">AUM</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aumAccountsOpened" className="text-white font-medium">
                      AUM Households
                    </Label>
                    <Input
                      id="aumAccountsOpened"
                      type="number"
                      min="0"
                      value={aumAccountsOpened}
                      onChange={e => setAumAccountsOpened(e.target.value)}
                      className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                      placeholder="Number Of AUM Households"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aum" className="text-white font-medium">
                      AUM ($)
                    </Label>
                    <Input
                      id="aum"
                      type="text"
                      value={formatCurrencyInput(aum)}
                      onChange={(e) => {
                        const rawValue = parseCurrencyInput(e.target.value)
                        setAum(rawValue)
                      }}
                      className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                      placeholder="$0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aumFeePercentage" className="text-white font-medium">
                      AUM Fee Percentage (%)
                    </Label>
                    <Input
                      id="aumFeePercentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={aumFeePercentage}
                      onChange={(e) => setAumFeePercentage(e.target.value)}
                      className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aumFees" className="text-white font-medium">
                      Annual AUM Fees ($)
                    </Label>
                    <div className="bg-black border border-m8bs-border rounded-md p-3 text-white font-medium">
                      {formatCurrencyUtil(parseFloat(aumFees) || 0)}
                    </div>
                    <div className="text-xs text-m8bs-muted flex items-center gap-1">
                      <Calculator className="h-3 w-3" />
                      Auto-calculated
                    </div>
                  </div>
                </div>
              </div>

              {/* Life Insurance Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-m8bs-border pb-2">Life Insurance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lifePoliciesSold" className="text-white font-medium">
                      Life Policies Sold
                    </Label>
                    <Input
                      id="lifePoliciesSold"
                      type="number"
                      value={lifePoliciesSold}
                      onChange={(e) => setLifePoliciesSold(e.target.value)}
                      className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lifeInsurancePremium" className="text-white font-medium">
                      Life Insurance Premium ($)
                    </Label>
                    <Input
                      id="lifeInsurancePremium"
                      type="text"
                      value={formatCurrencyInput(lifeInsurancePremium)}
                      onChange={(e) => {
                        const rawValue = parseCurrencyInput(e.target.value)
                        setLifeInsurancePremium(rawValue)
                      }}
                      className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                      placeholder="$0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lifeInsuranceCommissionPercentage" className="text-white font-medium">
                      Life Insurance Commission Percentage (%)
                    </Label>
                    <Input
                      id="lifeInsuranceCommissionPercentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={lifeInsuranceCommissionPercentage}
                      onChange={(e) => setLifeInsuranceCommissionPercentage(e.target.value)}
                      className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lifeInsuranceCommission" className="text-white font-medium">
                      Life Insurance Commission ($)
                    </Label>
                    <div className="bg-black border border-m8bs-border rounded-md p-3 text-white font-medium">
                      {formatCurrencyUtil(parseFloat(lifeInsuranceCommission) || 0)}
                    </div>
                    {lifeInsurancePremium && lifeInsuranceCommissionPercentage && (
                      <div className="text-xs text-m8bs-muted flex items-center gap-1">
                        <Calculator className="h-3 w-3" />
                        Auto-calculated
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Planning Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-m8bs-border pb-2">Financial Planning</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="financialPlansSold" className="text-white font-medium">
                      Financial Plans Sold
                    </Label>
                    <Input
                      id="financialPlansSold"
                      type="number"
                      min="0"
                      value={financialPlansSold}
                      onChange={e => setFinancialPlansSold(e.target.value)}
                      className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                      placeholder="Number Of Financial Plans Sold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="financialPlanning" className="text-white font-medium">
                      Financial Planning ($)
                    </Label>
                    <Input
                      id="financialPlanning"
                      type="text"
                      value={formatCurrencyInput(financialPlanning)}
                      onChange={(e) => {
                        const rawValue = parseCurrencyInput(e.target.value)
                        setFinancialPlanning(rawValue)
                      }}
                      className="bg-black border-m8bs-border text-white placeholder:text-gray-500 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/30 transition-all duration-200 rounded-md"
                      placeholder="$0"
                    />
                  </div>
                </div>
              </div>

              {/* Total Production */}
              <div className="space-y-2 pt-4 border-t border-m8bs-border">
                <Label className="text-white font-medium text-lg">Total Production ($)</Label>
                <div className="bg-black border border-m8bs-border rounded-md p-4 text-white font-bold text-xl">
                  {formatCurrencyUtil(calculateTotalProduction())}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>


      {/* Form Actions */}
      <Card className="bg-black border-m8bs-border shadow-xl">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-m8bs-muted">
                Form completion: <span className="text-white font-medium">{formProgress}%</span>
              </div>
              {Object.keys(formErrors).length > 0 && (
                <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/50">
                  {Object.keys(formErrors).length} error{Object.keys(formErrors).length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="bg-black border-m8bs-border text-white hover:bg-black-alt transition-colors"
              >
                Cancel
              </Button>
              {activeTab !== "event" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevTab}
                  className="bg-black border-m8bs-border text-white hover:bg-black-alt transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
              )}
              {activeTab !== "financial" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleNextTab}
                  className="bg-black border-m8bs-border text-white hover:bg-black-alt transition-colors"
                >
                  Next
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting || Object.keys(formErrors).length > 0}
                className="bg-m8bs-blue hover:bg-m8bs-blue-dark text-white flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEditing ? 'Update Event' : 'Create Event'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
    </div>
  )
}
