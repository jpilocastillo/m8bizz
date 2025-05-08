"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircularProgressIndicator } from "@/components/ui/circular-progress"
import {
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Percent,
  Target,
  Award,
  FileText,
  PieChart,
  BarChart,
  Activity,
} from "lucide-react"
import { TrendMetricCard } from "./trend-metric-card"
import { ProgressCard } from "./progress-card"
import { ProgressBar } from "./progress-bar"
import { ComparisonMetric } from "./comparison-metric"
import { EnhancedChart } from "./enhanced-chart"
import { DataTable } from "./data-table"

interface DashboardData {
  roi: {
    value: number
    trend: number[]
  }
  writtenBusiness: number
  income: {
    total: number
    breakdown: {
      fixedAnnuity: number
      life: number
      aum: number
    }
  }
  conversionRate: {
    value: number
    attendees: number
    clients: number
  }
  eventDetails: {
    dayOfWeek: string
    location: string
    time: string
    ageRange: string
    mileRadius: string
    incomeAssets: string
  }
  marketingExpenses: {
    total: number
    advertising: number
    foodVenue: number
  }
  topicOfMarketing: string
  attendance: {
    registrantResponses: number
    confirmations: number
    attendees: number
    responseRate: number
  }
  clientAcquisition: {
    expensePerBuyingUnit: number
    expensePerAppointment: number
    expensePerClient: number
    totalCost: number
  }
  conversionEfficiency: {
    registrationToAttendance: number
    attendanceToAppointment: number
    appointmentToClient: number
    overall: number
  }
  appointments: {
    setAtEvent: number
    setAfterEvent: number
    firstAppointmentAttended: number
    firstAppointmentNoShows: number
    secondAppointmentAttended: number
  }
  productsSold: {
    annuities: number
    lifePolicies: number
  }
  financialProduction: {
    fixedAnnuity: number
    lifeInsurance: number
    aum: number
    financialPlanning: number
    total: number
  }
}

export function DashboardOverview({ data }: { data: DashboardData }) {
  // Calculate some derived metrics for better visualization
  const totalAppointmentsSet = data.appointments.setAtEvent + data.appointments.setAfterEvent
  const appointmentAttendanceRate =
    totalAppointmentsSet > 0 ? (data.appointments.firstAppointmentAttended / totalAppointmentsSet) * 100 : 0

  // Prepare data for charts
  const financialBreakdownData = {
    labels: ["Fixed Annuity", "Life Insurance", "AUM", "Financial Planning"],
    datasets: [
      {
        label: "Amount ($)",
        data: [
          data.financialProduction.fixedAnnuity,
          data.financialProduction.lifeInsurance,
          data.financialProduction.aum,
          data.financialProduction.financialPlanning,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)",
          "rgba(239, 68, 68, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(249, 115, 22, 0.7)",
        ],
      },
    ],
  }

  const conversionFunnelData = {
    labels: ["Registrations", "Confirmations", "Attendees", "1st Appointments", "Clients"],
    datasets: [
      {
        label: "Count",
        data: [
          data.attendance.registrantResponses,
          data.attendance.confirmations,
          data.attendance.attendees,
          data.appointments.firstAppointmentAttended,
          data.productsSold.annuities + data.productsSold.lifePolicies,
        ],
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "#3b82f6",
      },
    ],
  }

  const roiTrendData = {
    labels: ["6 Months Ago", "5 Months Ago", "4 Months Ago", "3 Months Ago", "2 Months Ago", "1 Month Ago", "Current"],
    datasets: [
      {
        label: "ROI %",
        data: data.roi.trend,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
      },
    ],
  }

  // Prepare appointment data for table
  const appointmentData = [
    { stage: "Set at Event", count: data.appointments.setAtEvent },
    { stage: "Set After Event", count: data.appointments.setAfterEvent },
    { stage: "First Appointment Attended", count: data.appointments.firstAppointmentAttended },
    { stage: "First Appointment No-Shows", count: data.appointments.firstAppointmentNoShows },
    { stage: "Second Appointment Attended", count: data.appointments.secondAppointmentAttended },
  ]

  return (
    <div className="space-y-6">
      {/* Top metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TrendMetricCard
          title="Return on Investment"
          value={data.roi.value}
          format="percent"
          trend={data.roi.trend[data.roi.trend.length - 1] > data.roi.trend[data.roi.trend.length - 2] ? "up" : "down"}
          trendValue={Math.abs(data.roi.trend[data.roi.trend.length - 1] - data.roi.trend[data.roi.trend.length - 2])}
          trendLabel="vs last event"
          icon={<TrendingUp className="h-5 w-5" />}
        />

        <TrendMetricCard
          title="Written Business"
          value={data.writtenBusiness}
          icon={<FileText className="h-5 w-5" />}
        />

        <TrendMetricCard
          title="Accumulative Income"
          value={data.income.total}
          format="currency"
          icon={<DollarSign className="h-5 w-5" />}
        />

        <TrendMetricCard
          title="Conversion Rate"
          value={data.conversionRate.value}
          format="percent"
          icon={<Percent className="h-5 w-5" />}
          trendLabel={`${data.conversionRate.attendees} → ${data.conversionRate.clients}`}
        />
      </div>

      {/* Event details */}
      <Card className="bg-[#131525] border-[#1f2037] shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <CardHeader className="bg-[#0f1029]/50 border-b border-[#1f2037]">
          <CardTitle className="text-lg font-medium text-white">Event Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Day of Week</p>
                <p className="text-lg font-medium text-white">{data.eventDetails.dayOfWeek}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Location</p>
                <p className="text-lg font-medium text-white">{data.eventDetails.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Time</p>
                <p className="text-lg font-medium text-white">{data.eventDetails.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-orange-500/20 p-2 rounded-lg">
                <Users className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Age Range</p>
                <p className="text-lg font-medium text-white">{data.eventDetails.ageRange}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-red-500/20 p-2 rounded-lg">
                <Target className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Mile Radius</p>
                <p className="text-lg font-medium text-white">{data.eventDetails.mileRadius}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-cyan-500/20 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Income Assets</p>
                <p className="text-lg font-medium text-white">{data.eventDetails.incomeAssets}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marketing expenses and attendance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#131525] border-[#1f2037] shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <CardHeader className="bg-[#0f1029]/50 border-b border-[#1f2037]">
            <CardTitle className="text-lg font-medium text-white">Marketing Expenses</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex justify-center mb-6">
              <CircularProgressIndicator
                value={100}
                size={180}
                strokeWidth={24}
                color="blue"
                secondaryColor="green"
                secondaryValue={
                  data.marketingExpenses.total === 0
                    ? 0
                    : (data.marketingExpenses.foodVenue / data.marketingExpenses.total) * 100
                }
                glowEffect={true}
              >
                <div className="text-center">
                  <span className="text-2xl font-bold text-white">
                    ${data.marketingExpenses.total.toLocaleString()}
                  </span>
                </div>
              </CircularProgressIndicator>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-300">Advertising Cost</span>
                </div>
                <div className="text-white font-medium">${data.marketingExpenses.advertising.toLocaleString()}</div>
              </div>
              <ProgressBar
                value={data.marketingExpenses.advertising}
                maxValue={data.marketingExpenses.total || 1}
                color="bg-blue-500"
                height="md"
              />

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm text-gray-300">Food/Venue Cost</span>
                </div>
                <div className="text-white font-medium">${data.marketingExpenses.foodVenue.toLocaleString()}</div>
              </div>
              <ProgressBar
                value={data.marketingExpenses.foodVenue}
                maxValue={data.marketingExpenses.total || 1}
                color="bg-emerald-500"
                height="md"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#131525] border-[#1f2037] shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <CardHeader className="bg-[#0f1029]/50 border-b border-[#1f2037]">
            <CardTitle className="text-lg font-medium text-white">Event Attendance</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <EnhancedChart
              title=""
              type="bar"
              height={220}
              data={{
                labels: ["Registrations", "Confirmations", "Attendees"],
                datasets: [
                  {
                    label: "Count",
                    data: [
                      data.attendance.registrantResponses,
                      data.attendance.confirmations,
                      data.attendance.attendees,
                    ],
                    backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(16, 185, 129, 0.8)", "rgba(249, 115, 22, 0.8)"],
                  },
                ],
              }}
            />
            <div className="space-y-4 mt-4">
              <ProgressBar
                label="Registration to Attendance"
                valueLabel={`${data.conversionEfficiency.registrationToAttendance.toFixed(1)}%`}
                value={data.conversionEfficiency.registrationToAttendance}
                color="bg-blue-500"
              />
              <ProgressBar
                label="Confirmation to Attendance"
                valueLabel={`${
                  data.attendance.confirmations > 0
                    ? ((data.attendance.attendees / data.attendance.confirmations) * 100).toFixed(1)
                    : "0.0"
                }%`}
                value={
                  data.attendance.confirmations > 0
                    ? (data.attendance.attendees / data.attendance.confirmations) * 100
                    : 0
                }
                color="bg-emerald-500"
                height="md"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI Trend and Conversion Funnel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EnhancedChart title="ROI Trend" type="line" data={roiTrendData} height={300} />

        <EnhancedChart
          title="Conversion Funnel"
          type="bar"
          data={conversionFunnelData}
          height={300}
          options={{
            indexAxis: "y",
            plugins: {
              legend: {
                display: false,
              },
            },
          }}
        />
      </div>

      {/* Client acquisition and conversion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#131525] border-[#1f2037] shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <CardHeader className="bg-[#0f1029]/50 border-b border-[#1f2037]">
            <CardTitle className="text-lg font-medium text-white">Client Acquisition Cost</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <ComparisonMetric
                title="Per Buying Unit"
                value={data.clientAcquisition.expensePerBuyingUnit}
                format="currency"
              />
              <ComparisonMetric
                title="Per Appointment"
                value={data.clientAcquisition.expensePerAppointment}
                format="currency"
              />
              <ComparisonMetric title="Per Client" value={data.clientAcquisition.expensePerClient} format="currency" />
            </div>
            <div className="mt-4 pt-4 border-t border-[#1f2037]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Total Marketing Cost</span>
                <div className="text-white font-bold">${data.clientAcquisition.totalCost.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#131525] border-[#1f2037] shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <CardHeader className="bg-[#0f1029]/50 border-b border-[#1f2037]">
            <CardTitle className="text-lg font-medium text-white">Conversion Efficiency</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <ProgressBar
                label="Registration to Attendance"
                valueLabel={`${data.conversionEfficiency.registrationToAttendance.toFixed(1)}%`}
                value={data.conversionEfficiency.registrationToAttendance}
                color="bg-emerald-500"
              />

              <ProgressBar
                label="Attendance to Appointment"
                valueLabel={`${data.conversionEfficiency.attendanceToAppointment.toFixed(1)}%`}
                value={data.conversionEfficiency.attendanceToAppointment}
                color="bg-blue-500"
              />

              <ProgressBar
                label="Appointment to Client"
                valueLabel={`${data.conversionEfficiency.appointmentToClient.toFixed(1)}%`}
                value={data.conversionEfficiency.appointmentToClient}
                color="bg-red-500"
              />

              <ProgressBar
                label="Overall Conversion"
                valueLabel={`${data.conversionEfficiency.overall.toFixed(1)}%`}
                value={data.conversionEfficiency.overall}
                color="bg-purple-500"
                height="lg"
              />
            </div>

            <div className="flex justify-center mt-6">
              <ProgressCard
                title=""
                value={data.conversionEfficiency.overall}
                valueLabel={`${data.conversionEfficiency.overall.toFixed(1)}%`}
                subtitle="Overall Conversion"
                size={100}
                strokeWidth={10}
                color="text-purple-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointment trends and products sold */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#131525] border-[#1f2037] shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <CardHeader className="bg-[#0f1029]/50 border-b border-[#1f2037]">
            <CardTitle className="text-lg font-medium text-white">Appointment Funnel</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <DataTable
              data={appointmentData}
              columns={[
                { key: "stage", header: "Stage" },
                {
                  key: "count",
                  header: "Count",
                  cell: (row) => <div className="font-medium text-white">{row.count}</div>,
                  className: "text-right",
                },
              ]}
            />
            <div className="mt-4">
              <ProgressBar
                label="Appointment Attendance Rate"
                valueLabel={`${appointmentAttendanceRate.toFixed(1)}%`}
                value={appointmentAttendanceRate}
                color="bg-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        <ProgressCard
          title="Annuities Sold"
          value={data.productsSold.annuities}
          maxValue={data.productsSold.annuities}
          size={120}
          strokeWidth={12}
          color="text-blue-500"
          icon={<Award className="h-5 w-5" />}
        />

        <ProgressCard
          title="Life Policies Sold"
          value={data.productsSold.lifePolicies}
          maxValue={data.productsSold.lifePolicies}
          size={120}
          strokeWidth={12}
          color="text-red-500"
          icon={<FileText className="h-5 w-5" />}
        />
      </div>

      {/* Financial production */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#131525] border-[#1f2037] shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden md:col-span-2">
          <CardHeader className="bg-[#0f1029]/50 border-b border-[#1f2037]">
            <CardTitle className="text-lg font-medium text-white">Financial Production</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <ComparisonMetric
                title="Fixed Annuity"
                value={data.financialProduction.fixedAnnuity}
                format="currency"
                icon={<DollarSign className="h-5 w-5" />}
              />
              <ComparisonMetric
                title="Life Insurance"
                value={data.financialProduction.lifeInsurance}
                format="currency"
                icon={<Activity className="h-5 w-5" />}
              />
              <ComparisonMetric
                title="AUM"
                value={data.financialProduction.aum}
                format="currency"
                icon={<BarChart className="h-5 w-5" />}
              />
              <ComparisonMetric
                title="Financial Planning"
                value={data.financialProduction.financialPlanning}
                format="currency"
                icon={<PieChart className="h-5 w-5" />}
              />
            </div>

            <div className="mt-4 pt-4 border-t border-[#1f2037]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Total Production</span>
                <span className="text-white font-bold">${data.financialProduction.total.toLocaleString()}</span>
              </div>
              <div className="h-3 bg-[#1f2037] rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-blue-500"
                  style={{
                    width: `${(data.financialProduction.fixedAnnuity / data.financialProduction.total) * 100}%`,
                  }}
                ></div>
                <div
                  className="h-full bg-red-500"
                  style={{
                    width: `${(data.financialProduction.lifeInsurance / data.financialProduction.total) * 100}%`,
                  }}
                ></div>
                <div
                  className="h-full bg-cyan-500"
                  style={{ width: `${(data.financialProduction.aum / data.financialProduction.total) * 100}%` }}
                ></div>
                <div
                  className="h-full bg-emerald-500"
                  style={{
                    width: `${(data.financialProduction.financialPlanning / data.financialProduction.total) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <EnhancedChart title="Financial Breakdown" type="doughnut" data={financialBreakdownData} height={300} />
      </div>
    </div>
  )
}
