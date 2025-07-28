"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
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
  // Base values
  const annuityBook = 180000000
  const aumBook = 62000000
  const qualifiedMoney = 157300000

  // Default percentages (these would come from the business data entry form)
  const percentages = {
    // Option 1 - Annuity Book
    surrenderPercent: 10,
    incomeRiderPercent: 6,
    freeWithdrawalPercent: 10,
    lifeInsurancePercent: 10,
    // Option 2 - AUM Book
    lifeStrategy1Percent: 1,
    lifeStrategy2Percent: 2,
    // Option 3 - Qualified Money
    iraTo7702Percent: 33,
    approvalRatePercent: 50,
  }

  // Default rates (these would come from the business data entry form)
  const rates = {
    // Option 1 - Annuity Book
    surrenderRate: 6,
    incomeRiderRate: 10,
    freeWithdrawalRate: 6,
    lifeInsuranceRate: 10,
    // Option 2 - AUM Book
    lifeStrategy1Rate: 10,
    lifeStrategy2Rate: 10,
    // Option 3 - Qualified Money
    iraTo7702Rate: 10,
  }

  // Calculate dynamic data based on percentages
  const option1Data = useMemo(() => [
    { 
      name: "% out of Surrender", 
      amount: (annuityBook * percentages.surrenderPercent) / 100, 
      percentage: `${percentages.surrenderPercent}%`, 
      income: (annuityBook * percentages.surrenderPercent * rates.surrenderRate) / 10000, 
      rate: `${rates.surrenderRate}%` 
    },
    { 
      name: "Average Income Rider %", 
      amount: (annuityBook * percentages.incomeRiderPercent) / 100, 
      percentage: `${percentages.incomeRiderPercent}%`, 
      income: (annuityBook * percentages.incomeRiderPercent * rates.incomeRiderRate) / 10000, 
      rate: `${rates.incomeRiderRate}%` 
    },
    { 
      name: "% Free Withdrawal", 
      amount: (annuityBook * percentages.freeWithdrawalPercent) / 100, 
      percentage: `${percentages.freeWithdrawalPercent}%`, 
      income: (annuityBook * percentages.freeWithdrawalPercent * rates.freeWithdrawalRate) / 10000, 
      rate: `${rates.freeWithdrawalRate}%` 
    },
    { 
      name: "Income From Life Insurance", 
      amount: 0, 
      percentage: `${percentages.lifeInsurancePercent}%`, 
      income: (annuityBook * percentages.lifeInsurancePercent * rates.lifeInsuranceRate) / 10000, 
      rate: `${rates.lifeInsuranceRate}%` 
    },
  ], [percentages, rates])

  const option2Data = useMemo(() => [
    { 
      name: "Life Strategy", 
      amount: (aumBook * percentages.lifeStrategy1Percent) / 100, 
      percentage: `${percentages.lifeStrategy1Percent}%`, 
      income: (aumBook * percentages.lifeStrategy1Percent * rates.lifeStrategy1Rate) / 10000, 
      rate: `${rates.lifeStrategy1Rate}%` 
    },
    { 
      name: "Life Strategy 2", 
      amount: (aumBook * percentages.lifeStrategy2Percent) / 100, 
      percentage: `${percentages.lifeStrategy2Percent}%`, 
      income: (aumBook * percentages.lifeStrategy2Percent * rates.lifeStrategy2Rate) / 10000, 
      rate: `${rates.lifeStrategy2Rate}%` 
    },
  ], [percentages, rates])

  const option3Data = useMemo(() => [
    { 
      name: "IRA to 7702 Money", 
      amount: (qualifiedMoney * percentages.iraTo7702Percent) / 100, 
      percentage: `${percentages.iraTo7702Percent}%`, 
      income: (qualifiedMoney * percentages.iraTo7702Percent * rates.iraTo7702Rate) / 10000, 
      rate: `${rates.iraTo7702Rate}%` 
    },
    { 
      name: "Approval Rate", 
      amount: 0, 
      percentage: `${percentages.approvalRatePercent}%`, 
      income: (qualifiedMoney * percentages.iraTo7702Percent * rates.iraTo7702Rate * percentages.approvalRatePercent) / 1000000, 
      rate: "-" 
    },
  ], [percentages, rates])

  // Total advisor book data
  const totalBookData = [
    { name: "Annuity Book", value: annuityBook, color: "#3b82f6" },
    { name: "AUM Book", value: aumBook, color: "#f97316" },
  ]

  // Chart data for option 1
  const option1ChartData = option1Data.map((item) => ({
    name: item.name,
    value: item.amount,
    income: item.income,
  }))

  // Chart data for option 2
  const option2ChartData = [
    { name: "Current AUM", value: aumBook },
    ...option2Data.map((item) => ({
      name: item.name,
      value: item.amount,
      income: item.income,
    })),
  ]

  // Chart data for option 3
  const option3ChartData = [
    { name: "Qualified Money", value: qualifiedMoney, color: "#64748b" },
    { name: "IRA to 7702 Money", value: (qualifiedMoney * percentages.iraTo7702Percent) / 100, color: "#22c55e" },
  ]

  return (
    <div className="grid gap-6">
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Total Advisor Book</CardTitle>
          <CardDescription>Overview of total advisor book</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-6 text-center font-bold text-xl mb-6 rounded-lg shadow-md text-black">
                ${(annuityBook + aumBook).toLocaleString()}.00
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
                    <TableCell>${annuityBook.toLocaleString()}.00</TableCell>
                    <TableCell>{((annuityBook / (annuityBook + aumBook)) * 100).toFixed(1)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Current AUM</TableCell>
                    <TableCell>${aumBook.toLocaleString()}.00</TableCell>
                    <TableCell>{((aumBook / (annuityBook + aumBook)) * 100).toFixed(1)}%</TableCell>
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
              <CardDescription>Current annuity: ${annuityBook.toLocaleString()}.00</CardDescription>
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
                        <TableHead>Annuity Production</TableHead>
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
              <CardDescription>Current AUM: ${aumBook.toLocaleString()}.00</CardDescription>
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
                        <TableCell>${aumBook.toLocaleString()}.00</TableCell>
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
              <CardDescription>Qualified Money: ${qualifiedMoney.toLocaleString()}.00</CardDescription>
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
                        <TableCell>${qualifiedMoney.toLocaleString()}.00</TableCell>
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
