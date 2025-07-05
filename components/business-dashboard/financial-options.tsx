"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export function FinancialOptions() {
  // Total book data
  const totalBookData = [
    { name: "Annuity Book", value: 180000000, color: "#3b82f6" },
    { name: "AUM Book", value: 62000000, color: "#f97316" },
  ]

  // Option 1 data - Annuity Book
  const option1Data = [
    { name: "% out of Surrender", amount: 18000000, percentage: "10%", income: 1080000, rate: "6%" },
    { name: "Average Income Rider %", amount: 10800000, percentage: "6%", income: 1080000, rate: "10%" },
    { name: "% Free Withdrawal", amount: 18000000, percentage: "10%", income: 1080000, rate: "6%" },
    { name: "Income From Life Insurance", amount: 0, percentage: "10%", income: 1800000, rate: "10%" },
  ]

  // Option 2 data - AUM Book
  const option2Data = [
    { name: "Life Strategy", amount: 620000, percentage: "1%", income: 62000, rate: "10%" },
    { name: "Life Strategy 2", amount: 1240000, percentage: "2%", income: 124000, rate: "10%" },
  ]

  // Option 3 data - Qualified Money
  const option3Data = [
    { name: "IRA to 7702 Money", amount: 51909000, percentage: "33%", income: 5190900, rate: "10%" },
    { name: "Approval Rate", amount: 0, percentage: "50%", income: 2595450, rate: "-" },
  ]

  // Chart data for option 1
  const option1ChartData = option1Data.map((item) => ({
    name: item.name,
    value: item.amount,
    income: item.income,
  }))

  // Chart data for option 2
  const option2ChartData = [
    { name: "Current AUM", value: 62000000 },
    ...option2Data.map((item) => ({
      name: item.name,
      value: item.amount,
      income: item.income,
    })),
  ]

  // Chart data for option 3
  const option3ChartData = [
    { name: "Qualified Money", value: 157300000, color: "#64748b" },
    { name: "IRA to 7702 Money", value: 51909000, color: "#22c55e" },
  ]

  return (
    <div className="grid gap-6">
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Total Book</CardTitle>
          <CardDescription>Overview of total book value</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-6 text-center font-bold text-xl mb-6 rounded-lg shadow-md text-black">
                $242,000,000.00
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Opportunity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Current Annuity</TableCell>
                    <TableCell>$180,000,000.00</TableCell>
                    <TableCell>74.4%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Current AUM</TableCell>
                    <TableCell>$62,000,000.00</TableCell>
                    <TableCell>25.6%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={totalBookData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    labelLine={false}
                  >
                    {totalBookData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`$${(value as number).toLocaleString()}`, undefined]}
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      color: "var(--popover-foreground)",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="option1" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="option1">Option 1 - Annuity Book</TabsTrigger>
          <TabsTrigger value="option2">Option 2 - AUM Book</TabsTrigger>
          <TabsTrigger value="option3">Option 3 - Qualified Money</TabsTrigger>
        </TabsList>
        <TabsContent value="option1">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Option 1 - Annuity Book</CardTitle>
              <CardDescription>Current annuity: $180,000,000.00</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Option</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Income</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {option1Data.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>${item.amount.toLocaleString()}</TableCell>
                          <TableCell>{item.percentage}</TableCell>
                          <TableCell>
                            ${item.income.toLocaleString()} ({item.rate})
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold">
                        <TableCell>Total Potential Income</TableCell>
                        <TableCell colSpan={3}>
                          ${option1Data.reduce((sum, item) => sum + item.income, 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={option1ChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#888" strokeOpacity={0.2} />
                      <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis
                        stroke="#888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value / 1000000}M`}
                      />
                      <Tooltip
                        formatter={(value) => [`$${(value as number).toLocaleString()}`, undefined]}
                        contentStyle={{
                          backgroundColor: "var(--popover)",
                          borderRadius: "6px",
                          border: "1px solid var(--border)",
                          color: "var(--popover-foreground)",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Legend />
                      <Bar name="Amount" dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar name="Income" dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="option2">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Option 2 - AUM Book</CardTitle>
              <CardDescription>Current AUM: $62,000,000.00</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Option</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Income</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="font-bold">
                        <TableCell>Current AUM</TableCell>
                        <TableCell>$62,000,000.00</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                      {option2Data.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>${item.amount.toLocaleString()}</TableCell>
                          <TableCell>{item.percentage}</TableCell>
                          <TableCell>
                            ${item.income.toLocaleString()} ({item.rate})
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold">
                        <TableCell>Total Potential Income</TableCell>
                        <TableCell colSpan={3}>
                          ${option2Data.reduce((sum, item) => sum + item.income, 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={option2ChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                        labelLine={false}
                      >
                        <Cell fill="#f97316" />
                        <Cell fill="#3b82f6" />
                        <Cell fill="#22c55e" />
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`$${(value as number).toLocaleString()}`, undefined]}
                        contentStyle={{
                          backgroundColor: "var(--popover)",
                          borderRadius: "6px",
                          border: "1px solid var(--border)",
                          color: "var(--popover-foreground)",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="option3">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Option 3 - Qualified Money</CardTitle>
              <CardDescription>Qualified Money: $157,300,000.00</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Option</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Income</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="font-bold">
                        <TableCell>Qualified Money</TableCell>
                        <TableCell>$157,300,000.00</TableCell>
                        <TableCell>65%</TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                      {option3Data.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>${item.amount.toLocaleString()}</TableCell>
                          <TableCell>{item.percentage}</TableCell>
                          <TableCell>
                            ${item.income.toLocaleString()} {item.rate !== "-" ? `(${item.rate})` : ""}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold">
                        <TableCell>Total Potential Income</TableCell>
                        <TableCell colSpan={3}>
                          ${option3Data.reduce((sum, item) => sum + item.income, 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={option3ChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                        labelLine={false}
                      >
                        {option3ChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`$${(value as number).toLocaleString()}`, undefined]}
                        contentStyle={{
                          backgroundColor: "var(--popover)",
                          borderRadius: "6px",
                          border: "1px solid var(--border)",
                          color: "var(--popover-foreground)",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
