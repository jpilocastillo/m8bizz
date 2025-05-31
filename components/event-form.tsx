"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { createEvent, createEventExpenses, createEventAttendance, createEventAppointments, createEventFinancialProduction, updateEvent } from "@/lib/data"
import { useAuth } from "@/components/auth-provider"

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
          description: "You must be logged in to create an event.",
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
            second_appointment_attended: parseInt(secondAppointmentAttended) || 0
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
          description: result.error || `Failed to ${isEditing ? 'update' : 'create'} event. Please try again.`,
        })
        return
      }

      console.log('Event operation completed successfully')

      toast({
        title: "Success",
        description: `Event ${isEditing ? 'updated' : 'created'} successfully!`,
      })

      console.log('Redirecting to dashboard...')
      router.push("/dashboard")
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

  return (
    <form onSubmit={handleSubmit}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gradient-to-r from-[#131525] to-[#0f1029] p-1 border border-[#1f2037] rounded-lg">
          <TabsTrigger value="event" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Event Details
          </TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Expenses
          </TabsTrigger>
          <TabsTrigger value="attendance" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Attendance
          </TabsTrigger>
          <TabsTrigger value="appointments" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Appointments
          </TabsTrigger>
          <TabsTrigger value="financial" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Financial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="event" className="space-y-4">
          <Card className="bg-gradient-to-b from-[#131525] to-[#0f1029] border-gray-800 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-blue-400"
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
                Event Information
              </CardTitle>
              <CardDescription>Enter the basic details about your marketing event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300 font-medium">
                    Event Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-gray-300 font-medium">
                    Event Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-300 font-medium">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-gray-300 font-medium">
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
                      required
                      className="w-16"
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
                      required
                      className="w-16"
                    />
                    <select value={ampm} onChange={e => setAmpm(e.target.value)} className="bg-[#1f2037] text-white rounded px-2">
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marketingType" className="text-gray-300 font-medium">
                    Marketing Type
                  </Label>
                  <Input
                    id="marketingType"
                    value={marketingType}
                    onChange={(e) => setMarketingType(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    placeholder="e.g. MBI Mailer, Facebook Ads"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-gray-300 font-medium">
                    Topic
                  </Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    placeholder="e.g. Retirement Outlook"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageRange" className="text-gray-300 font-medium">
                    Age Range
                  </Label>
                  <Input
                    id="ageRange"
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    placeholder="e.g. 58-71"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileRadius" className="text-gray-300 font-medium">
                    Mile Radius
                  </Label>
                  <Input
                    id="mileRadius"
                    value={mileRadius}
                    onChange={(e) => setMileRadius(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    placeholder="e.g. 10-15 Mi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incomeAssets" className="text-gray-300 font-medium">
                    Income/Assets
                  </Label>
                  <Input
                    id="incomeAssets"
                    value={incomeAssets}
                    onChange={(e) => setIncomeAssets(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    placeholder="e.g. 500k-2m"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marketingAudience" className="text-gray-300 font-medium">
                    Marketing Audience Size
                  </Label>
                  <Input
                    id="marketingAudience"
                    type="number"
                    min="0"
                    value={marketingAudience ?? ""}
                    onChange={e => setMarketingAudience(e.target.value === "" ? null : e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    placeholder="Enter total number of people"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                type="button"
                onClick={handleNextTab}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-colors"
              >
                Next
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card className="bg-gradient-to-b from-[#131525] to-[#0f1029] border-gray-800 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-blue-400"
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
                Marketing Expenses
              </CardTitle>
              <CardDescription>Enter the expenses associated with this marketing event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="advertisingCost" className="text-gray-300 font-medium">
                    Advertising Cost ($)
                  </Label>
                  <Input
                    id="advertisingCost"
                    type="number"
                    step="0.01"
                    value={advertisingCost}
                    onChange={(e) => setAdvertisingCost(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="foodVenueCost" className="text-gray-300 font-medium">
                    Food/Venue Cost ($)
                  </Label>
                  <Input
                    id="foodVenueCost"
                    type="number"
                    step="0.01"
                    value={foodVenueCost}
                    onChange={(e) => setFoodVenueCost(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherCosts" className="text-gray-300 font-medium">
                    Other Costs ($)
                  </Label>
                  <Input
                    id="otherCosts"
                    type="number"
                    step="0.01"
                    value={otherCosts}
                    onChange={(e) => setOtherCosts(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Cost ($)</Label>
                  <div className="bg-[#131525] border border-[#1f2037] rounded-md p-3 text-white font-medium">
                    ${calculateTotalCost().toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevTab}
                className="border-[#1f2037] bg-[#1f2037] text-white hover:bg-[#2a2b47] hover:text-white transition-colors"
              >
                Previous
              </Button>
              <Button
                type="button"
                onClick={handleNextTab}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-colors"
              >
                Next
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card className="bg-gradient-to-b from-[#131525] to-[#0f1029] border-gray-800 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-blue-400"
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
              <CardDescription>Enter attendance details for this marketing event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrantResponses" className="text-gray-300 font-medium">
                    Registrant Responses (BU)
                  </Label>
                  <Input
                    id="registrantResponses"
                    type="number"
                    value={registrantResponses}
                    onChange={(e) => setRegistrantResponses(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmations" className="text-gray-300 font-medium">
                    Confirmations (BU)
                  </Label>
                  <Input
                    id="confirmations"
                    type="number"
                    value={confirmations}
                    onChange={(e) => setConfirmations(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendees" className="text-gray-300 font-medium">
                    Attendees (BU)
                  </Label>
                  <Input
                    id="attendees"
                    type="number"
                    value={attendees}
                    onChange={(e) => setAttendees(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientsFromEvent" className="text-gray-300 font-medium">
                    Clients From Event
                  </Label>
                  <Input
                    id="clientsFromEvent"
                    type="number"
                    value={clientsFromEvent}
                    onChange={(e) => setClientsFromEvent(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plateLickers" className="text-gray-300 font-medium">
                    Plate Lickers
                  </Label>
                  <Input
                    id="plateLickers"
                    type="number"
                    value={plateLickers}
                    onChange={(e) => setPlateLickers(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    placeholder="No interest in appointments or services"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevTab}
                className="border-[#1f2037] bg-[#1f2037] text-white hover:bg-[#2a2b47] hover:text-white transition-colors"
              >
                Previous
              </Button>
              <Button
                type="button"
                onClick={handleNextTab}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-colors"
              >
                Next
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card className="bg-gradient-to-b from-[#131525] to-[#0f1029] border-gray-800 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-blue-400"
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
                  <Label htmlFor="setAtEvent" className="text-gray-300 font-medium">
                    Appointments Set at Event
                  </Label>
                  <Input
                    id="setAtEvent"
                    type="number"
                    value={setAtEvent}
                    onChange={(e) => setSetAtEvent(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setAfterEvent" className="text-gray-300 font-medium">
                    Appointments Set After Event
                  </Label>
                  <Input
                    id="setAfterEvent"
                    type="number"
                    value={setAfterEvent}
                    onChange={(e) => setSetAfterEvent(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstAppointmentAttended" className="text-gray-300 font-medium">
                    First Appointments Attended
                  </Label>
                  <Input
                    id="firstAppointmentAttended"
                    type="number"
                    value={firstAppointmentAttended}
                    onChange={(e) => setFirstAppointmentAttended(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstAppointmentNoShows" className="text-gray-300 font-medium">
                    First Appointment No-Shows
                  </Label>
                  <Input
                    id="firstAppointmentNoShows"
                    type="number"
                    value={firstAppointmentNoShows}
                    onChange={(e) => setFirstAppointmentNoShows(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondAppointmentAttended" className="text-gray-300 font-medium">
                    Second Appointments Attended
                  </Label>
                  <Input
                    id="secondAppointmentAttended"
                    type="number"
                    value={secondAppointmentAttended}
                    onChange={(e) => setSecondAppointmentAttended(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevTab}
                className="border-[#1f2037] bg-[#1f2037] text-white hover:bg-[#2a2b47] hover:text-white transition-colors"
              >
                Previous
              </Button>
              <Button
                type="button"
                onClick={handleNextTab}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-colors"
              >
                Next
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card className="bg-gradient-to-b from-[#131525] to-[#0f1029] border-gray-800 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-blue-400"
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
                Financial Production
              </CardTitle>
              <CardDescription>Enter financial results from this marketing event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="annuityPremium" className="text-gray-300 font-medium">
                    Annuity Premium ($)
                  </Label>
                  <Input
                    id="annuityPremium"
                    type="number"
                    step="0.01"
                    value={annuityPremium}
                    onChange={(e) => setAnnuityPremium(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lifeInsurancePremium" className="text-gray-300 font-medium">
                    Life Insurance Premium ($)
                  </Label>
                  <Input
                    id="lifeInsurancePremium"
                    type="number"
                    step="0.01"
                    value={lifeInsurancePremium}
                    onChange={(e) => setLifeInsurancePremium(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aumAccountsOpened" className="text-gray-300 font-medium">
                    AUM Accounts Opened
                  </Label>
                  <Input
                    id="aumAccountsOpened"
                    type="number"
                    min="0"
                    value={aumAccountsOpened}
                    onChange={e => setAumAccountsOpened(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    placeholder="Number of AUM accounts opened"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aum" className="text-gray-300 font-medium">
                    AUM ($)
                  </Label>
                  <Input
                    id="aum"
                    type="number"
                    step="0.01"
                    value={aum}
                    onChange={(e) => setAum(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aumFeePercentage" className="text-gray-300 font-medium">
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
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aumFees" className="text-gray-300 font-medium">
                    Annual AUM Fees ($)
                  </Label>
                  <div className="bg-[#131525] border border-[#1f2037] rounded-md p-3 text-white font-medium">
                    ${aumFees}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="financialPlansSold" className="text-gray-300 font-medium">
                    Financial Plans Sold
                  </Label>
                  <Input
                    id="financialPlansSold"
                    type="number"
                    min="0"
                    value={financialPlansSold}
                    onChange={e => setFinancialPlansSold(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    placeholder="Number of financial plans sold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="financialPlanning" className="text-gray-300 font-medium">
                    Financial Planning ($)
                  </Label>
                  <Input
                    id="financialPlanning"
                    type="number"
                    step="0.01"
                    value={financialPlanning}
                    onChange={(e) => setFinancialPlanning(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Production ($)</Label>
                  <div className="bg-[#131525] border border-[#1f2037] rounded-md p-3 text-white font-medium">
                    ${calculateTotalProduction().toFixed(2)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annuitiesSold" className="text-gray-300 font-medium">
                    Annuities Sold
                  </Label>
                  <Input
                    id="annuitiesSold"
                    type="number"
                    value={annuitiesSold}
                    onChange={(e) => setAnnuitiesSold(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lifePoliciesSold" className="text-gray-300 font-medium">
                    Life Policies Sold
                  </Label>
                  <Input
                    id="lifePoliciesSold"
                    type="number"
                    value={lifePoliciesSold}
                    onChange={(e) => setLifePoliciesSold(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annuityCommissionPercentage" className="text-gray-300 font-medium">
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
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annuityCommission" className="text-gray-300 font-medium">
                    Annuity Commission ($)
                  </Label>
                  <div className="bg-[#131525] border border-[#1f2037] rounded-md p-3 text-white font-medium">
                    ${annuityCommission}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lifeInsuranceCommissionPercentage" className="text-gray-300 font-medium">
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
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lifeInsuranceCommission" className="text-gray-300 font-medium">
                    Life Insurance Commission ($)
                  </Label>
                  <div className="bg-[#131525] border border-[#1f2037] rounded-md p-3 text-white font-medium">
                    ${lifeInsuranceCommission}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevTab}
                className="border-[#1f2037] bg-[#1f2037] text-white hover:bg-[#2a2b47] hover:text-white transition-colors"
              >
                Previous
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? isEditing
                    ? "Updating Event..."
                    : "Creating Event..."
                  : isEditing
                    ? "Update Event"
                    : "Create Event"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}
