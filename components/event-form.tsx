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
import { createEvent, createEventExpenses, createEventAttendance, createEventAppointments, createEventFinancialProduction } from "@/lib/data"
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

  // Expenses
  const [advertisingCost, setAdvertisingCost] = useState("")
  const [foodVenueCost, setFoodVenueCost] = useState("")
  const [otherCosts, setOtherCosts] = useState("")

  // Attendance
  const [registrantResponses, setRegistrantResponses] = useState("")
  const [confirmations, setConfirmations] = useState("")
  const [attendees, setAttendees] = useState("")
  const [clientsFromEvent, setClientsFromEvent] = useState("")

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
  const [financialPlanning, setFinancialPlanning] = useState("")
  const [annuitiesSold, setAnnuitiesSold] = useState("")
  const [lifePoliciesSold, setLifePoliciesSold] = useState("")
  const [annuityCommission, setAnnuityCommission] = useState("")
  const [lifeInsuranceCommission, setLifeInsuranceCommission] = useState("")
  const [aumFees, setAumFees] = useState("")

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "")
      setDate(initialData.date || "")
      setLocation(initialData.location || "")
      setMarketingType(initialData.marketing_type || "")
      setTopic(initialData.topic || "")
      setTime(initialData.time || "")
      setAgeRange(initialData.age_range || "")
      setMileRadius(initialData.mile_radius || "")
      setIncomeAssets(initialData.income_assets || "")
      setAdvertisingCost(initialData.advertising_cost || "")
      setFoodVenueCost(initialData.food_venue_cost || "")
      setOtherCosts(initialData.other_costs || "")
      setRegistrantResponses(initialData.registrant_responses || "")
      setConfirmations(initialData.confirmations || "")
      setAttendees(initialData.attendees || "")
      setClientsFromEvent(initialData.clients_from_event || "")
      setSetAtEvent(initialData.set_at_event || "")
      setSetAfterEvent(initialData.set_after_event || "")
      setFirstAppointmentAttended(initialData.first_appointment_attended || "")
      setFirstAppointmentNoShows(initialData.first_appointment_no_shows || "")
      setSecondAppointmentAttended(initialData.second_appointment_attended || "")
      setAnnuityPremium(initialData.annuity_premium || "")
      setLifeInsurancePremium(initialData.life_insurance_premium || "")
      setAum(initialData.aum || "")
      setFinancialPlanning(initialData.financial_planning || "")
      setAnnuitiesSold(initialData.annuities_sold || "")
      setLifePoliciesSold(initialData.life_policies_sold || "")
      setAnnuityCommission(initialData.annuity_commission || "")
      setLifeInsuranceCommission(initialData.life_insurance_commission || "")
      setAumFees(initialData.aum_fees || "")
    }
  }, [initialData])

  const calculateTotalCost = () => {
    const adCost = Number.parseFloat(advertisingCost) || 0
    const foodCost = Number.parseFloat(foodVenueCost) || 0
    const other = Number.parseFloat(otherCosts) || 0
    return adCost + foodCost + other
  }

  const calculateTotalProduction = () => {
    const annuity = Number.parseFloat(annuityPremium) || 0
    const life = Number.parseFloat(lifeInsurancePremium) || 0
    const assets = Number.parseFloat(aum) || 0
    const planning = Number.parseFloat(financialPlanning) || 0
    return annuity + life + assets + planning
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
      const eventData = {
        name,
        date,
        location,
        marketing_type: marketingType,
        topic,
        time,
        age_range: ageRange,
        mile_radius: mileRadius,
        income_assets: incomeAssets,
        status: 'active'
      }

      console.log('Submitting event data:', eventData)

      // Create the event first
      console.log('Calling createEvent function...')
      const result = await createEvent(currentUserId, eventData)
      console.log('createEvent result:', result)

      if (!result.success || !result.eventId) {
        console.error("Error creating event:", result.error)
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to create event. Please try again.",
        })
        return
      }

      console.log('Event created successfully with ID:', result.eventId)

      // Prepare data for related records
      const expensesData = {
        event_id: result.eventId,
        advertising_cost: parseFloat(advertisingCost) || 0,
        food_venue_cost: parseFloat(foodVenueCost) || 0,
        other_costs: parseFloat(otherCosts) || 0
      }

      const attendanceData = {
        event_id: result.eventId,
        registrant_responses: parseInt(registrantResponses) || 0,
        confirmations: parseInt(confirmations) || 0,
        attendees: parseInt(attendees) || 0,
        clients_from_event: parseInt(clientsFromEvent) || 0
      }

      const appointmentsData = {
        event_id: result.eventId,
        set_at_event: parseInt(setAtEvent) || 0,
        set_after_event: parseInt(setAfterEvent) || 0,
        first_appointment_attended: parseInt(firstAppointmentAttended) || 0,
        first_appointment_no_shows: parseInt(firstAppointmentNoShows) || 0,
        second_appointment_attended: parseInt(secondAppointmentAttended) || 0
      }

      const financialData = {
        event_id: result.eventId,
        annuity_premium: parseFloat(annuityPremium) || 0,
        life_insurance_premium: parseFloat(lifeInsurancePremium) || 0,
        aum: parseFloat(aum) || 0,
        financial_planning: parseFloat(financialPlanning) || 0,
        annuities_sold: parseInt(annuitiesSold) || 0,
        life_policies_sold: parseInt(lifePoliciesSold) || 0,
        annuity_commission: parseFloat(annuityCommission) || 0,
        life_insurance_commission: parseFloat(lifeInsuranceCommission) || 0,
        aum_fees: parseFloat(aumFees) || 0
      }

      console.log('Creating related records:', {
        expenses: expensesData,
        attendance: attendanceData,
        appointments: appointmentsData,
        financial: financialData
      })

      // Create all related records in parallel
      console.log('Creating related records in parallel...')
      const [expensesResult, attendanceResult, appointmentsResult, financialResult] = await Promise.all([
        createEventExpenses(expensesData),
        createEventAttendance(attendanceData),
        createEventAppointments(appointmentsData),
        createEventFinancialProduction(financialData)
      ])

      console.log('Related records creation results:', {
        expenses: expensesResult,
        attendance: attendanceResult,
        appointments: appointmentsResult,
        financial: financialResult
      })

      if (!expensesResult.success || !attendanceResult.success || !appointmentsResult.success || !financialResult.success) {
        console.error("Error creating related records:", {
          expenses: expensesResult.error,
          attendance: attendanceResult.error,
          appointments: appointmentsResult.error,
          financial: financialResult.error
        })
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create some event details. Please try again.",
        })
        return
      }

      console.log('All related records created successfully')

      toast({
        title: "Success",
        description: "Event created successfully!",
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
                  <Input
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    placeholder="e.g. 6:00 PM"
                  />
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
                    Registrant Responses
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
                    Confirmations
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
                    Attendees
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
                  <Label htmlFor="aumFees" className="text-gray-300 font-medium">
                    AUM Fees ($)
                  </Label>
                  <Input
                    id="aumFees"
                    type="number"
                    step="0.01"
                    value={aumFees}
                    onChange={(e) => setAumFees(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
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
                  <Label htmlFor="annuityCommission" className="text-gray-300 font-medium">
                    Annuity Commission ($)
                  </Label>
                  <Input
                    id="annuityCommission"
                    type="number"
                    step="0.01"
                    value={annuityCommission}
                    onChange={(e) => setAnnuityCommission(e.target.value)}
                    className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lifeInsuranceCommission" className="text-gray-300 font-medium">
                    Life Insurance Commission ($)
                  </Label>
                  <Input
                    id="lifeInsuranceCommission"
                    type="number"
                    step="0.01"
                    value={lifeInsuranceCommission}
                    onChange={(e) => setLifeInsuranceCommission(e.target.value)}
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
