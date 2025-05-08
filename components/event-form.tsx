"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { createEvent, updateEvent } from "@/lib/data"
import { useAuth } from "@/components/auth-provider"

interface EventFormProps {
  initialData?: any
  isEditing?: boolean
}

export function EventForm({ initialData, isEditing = false }: EventFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
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
        advertising_cost: advertisingCost,
        food_venue_cost: foodVenueCost,
        other_costs: otherCosts,
        registrant_responses: registrantResponses,
        confirmations,
        attendees,
        clients_from_event: clientsFromEvent,
        set_at_event: setAtEvent,
        set_after_event: setAfterEvent,
        first_appointment_attended: firstAppointmentAttended,
        first_appointment_no_shows: firstAppointmentNoShows,
        second_appointment_attended: secondAppointmentAttended,
        annuity_premium: annuityPremium,
        life_insurance_premium: lifeInsurancePremium,
        aum,
        financial_planning: financialPlanning,
        annuities_sold: annuitiesSold,
      }

      const result = isEditing
        ? await updateEvent(initialData.id, eventData)
        : await createEvent(user?.id || "", eventData)

      if (result.success) {
        toast({
          title: isEditing ? "Event updated" : "Event created",
          description: isEditing
            ? "Your marketing event has been updated successfully."
            : "Your marketing event has been created successfully.",
        })
        router.push("/dashboard/events")
        router.refresh()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || `Failed to ${isEditing ? "update" : "create"} event. Please try again.`,
        })
      }
    } catch (error) {
      console.error(isEditing ? "Error updating event:" : "Error creating event:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          <CardDescription>Enter all details about your marketing event</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300 font-medium">Event Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-gray-300 font-medium">Date</Label>
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
                <Label htmlFor="time" className="text-gray-300 font-medium">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-gray-300 font-medium">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marketingType" className="text-gray-300 font-medium">Marketing Type</Label>
                <Input
                  id="marketingType"
                  value={marketingType}
                  onChange={(e) => setMarketingType(e.target.value)}
                  className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-gray-300 font-medium">Topic</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ageRange" className="text-gray-300 font-medium">Age Range</Label>
                <Input
                  id="ageRange"
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                  className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileRadius" className="text-gray-300 font-medium">Mile Radius</Label>
                <Input
                  id="mileRadius"
                  type="number"
                  value={mileRadius}
                  onChange={(e) => setMileRadius(e.target.value)}
                  className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="incomeAssets" className="text-gray-300 font-medium">Income/Assets</Label>
                <Input
                  id="incomeAssets"
                  value={incomeAssets}
                  onChange={(e) => setIncomeAssets(e.target.value)}
                  className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Expenses Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Expenses</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="advertisingCost" className="text-gray-300 font-medium">Advertising Cost</Label>
                <Input
                  id="advertisingCost"
                  type="number"
                  value={advertisingCost}
                  onChange={(e) => setAdvertisingCost(e.target.value)}
                  className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="foodVenueCost" className="text-gray-300 font-medium">Food/Venue Cost</Label>
                <Input
                  id="foodVenueCost"
                  type="number"
                  value={foodVenueCost}
                  onChange={(e) => setFoodVenueCost(e.target.value)}
                  className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherCosts" className="text-gray-300 font-medium">Other Costs</Label>
                <Input
                  id="otherCosts"
                  type="number"
                  value={otherCosts}
                  onChange={(e) => setOtherCosts(e.target.value)}
                  className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Attendance Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Attendance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrantResponses" className="text-gray-300 font-medium">Registrant Responses</Label>
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
                <Label htmlFor="confirmations" className="text-gray-300 font-medium">Confirmations</Label>
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
                <Label htmlFor="attendees" className="text-gray-300 font-medium">Attendees</Label>
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
                <Label htmlFor="clientsFromEvent" className="text-gray-300 font-medium">Clients From Event</Label>
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
          </div>

          {/* Appointments Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Appointments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="setAtEvent" className="text-gray-300 font-medium">Set At Event</Label>
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
                <Label htmlFor="setAfterEvent" className="text-gray-300 font-medium">Set After Event</Label>
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
                <Label htmlFor="firstAppointmentAttended" className="text-gray-300 font-medium">First Appointment Attended</Label>
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
                <Label htmlFor="firstAppointmentNoShows" className="text-gray-300 font-medium">First Appointment No-Shows</Label>
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
                <Label htmlFor="secondAppointmentAttended" className="text-gray-300 font-medium">Second Appointment Attended</Label>
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
          </div>

          {/* Financial Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Financial Production</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="annuityPremium" className="text-gray-300 font-medium">Annuity Premium</Label>
                <Input
                  id="annuityPremium"
                  type="number"
                  value={annuityPremium}
                  onChange={(e) => setAnnuityPremium(e.target.value)}
                  className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lifeInsurancePremium" className="text-gray-300 font-medium">Life Insurance Premium</Label>
                <Input
                  id="lifeInsurancePremium"
                  type="number"
                  value={lifeInsurancePremium}
                  onChange={(e) => setLifeInsurancePremium(e.target.value)}
                  className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aum" className="text-gray-300 font-medium">AUM</Label>
                <Input
                  id="aum"
                  type="number"
                  value={aum}
                  onChange={(e) => setAum(e.target.value)}
                  className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="financialPlanning" className="text-gray-300 font-medium">Financial Planning</Label>
                <Input
                  id="financialPlanning"
                  type="number"
                  value={financialPlanning}
                  onChange={(e) => setFinancialPlanning(e.target.value)}
                  className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="annuitiesSold" className="text-gray-300 font-medium">Annuities Sold</Label>
                <Input
                  id="annuitiesSold"
                  type="number"
                  value={annuitiesSold}
                  onChange={(e) => setAnnuitiesSold(e.target.value)}
                  className="bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                  required
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
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
    </form>
  )
}
