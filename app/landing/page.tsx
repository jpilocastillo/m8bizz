"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart3,
  Building2,
  TrendingUp,
  Users,
  Target,
  Calendar,
  DollarSign,
  PieChart,
  Award,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Star,
  Activity,
  Briefcase,
  FileText,
  LineChart
} from "lucide-react"

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const features = [
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Marketing Event Management",
      description: "Create, track, and analyze marketing events with comprehensive ROI metrics and performance insights."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Performance Analytics",
      description: "Real-time analytics dashboard with detailed ROI tracking, conversion rates, and revenue insights."
    },
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "Business Dashboard",
      description: "Financial advisor basecamp with goal tracking, metrics monitoring, and business intelligence."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Client Acquisition",
      description: "Monitor client acquisition, track conversion rates, and measure the effectiveness of your marketing efforts."
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Financial Production",
      description: "Track AUM fees, commissions, annuity sales, and financial planning revenue all in one place."
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Campaign Management",
      description: "Manage marketing campaigns, track their performance, and optimize your marketing strategy."
    },
  ]

  const benefits = [
    "Comprehensive marketing analytics and ROI tracking",
    "Real-time business performance monitoring",
    "Goal tracking and progress visualization",
    "Client acquisition and conversion analytics",
    "Financial production and revenue insights",
    "Campaign performance optimization",
  ]

  const stats = [
    { label: "Marketing Events Tracked", value: "1000+" },
    { label: "ROI Insights", value: "Real-time" },
    { label: "Business Metrics", value: "50+" },
    { label: "Client Data Points", value: "Unlimited" },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-m8bs-blue/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-m8bs-purple/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-m8bs-pink/10 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          className="relative z-10 max-w-7xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <motion.div
            className="mb-8 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Image
              src="/logo.png"
              alt="M8 Business Suite Logo"
              width={300}
              height={100}
              className="h-auto"
            />
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-m8bs-blue via-m8bs-purple to-m8bs-pink bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Marketing & Business
            <br />
            Management Dashboard
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl text-m8bs-muted mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Comprehensive analytics platform for financial advisors and marketing professionals.
            Track events, measure ROI, and grow your business.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Link href="/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark hover:from-m8bs-blue-dark hover:to-m8bs-blue text-white text-lg px-8 py-6 shadow-lg shadow-m8bs-blue/30"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button
                size="lg"
                variant="outline"
                className="border-m8bs-border hover:bg-m8bs-card-alt text-lg px-8 py-6"
              >
                Learn More
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-m8bs-muted">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <div className="animate-bounce">
            <ArrowRight className="h-6 w-6 text-m8bs-muted rotate-90" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-m8bs-card/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-m8bs-blue to-m8bs-purple bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-m8bs-muted max-w-2xl mx-auto">
              Everything you need to manage your marketing and track your business performance
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={item}>
                <Card className="bg-m8bs-card border-m8bs-border hover:border-m8bs-blue transition-all duration-300 h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-m8bs-blue to-m8bs-purple rounded-lg flex items-center justify-center text-white mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-m8bs-muted text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-m8bs-blue to-m8bs-purple bg-clip-text text-transparent">
                Why Choose M8 Business Suite?
              </h2>
              <p className="text-xl text-m8bs-muted mb-8">
                A comprehensive platform designed specifically for financial advisors and marketing professionals who need powerful analytics and business intelligence.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <CheckCircle2 className="h-6 w-6 text-m8bs-green flex-shrink-0 mt-0.5" />
                    <span className="text-lg text-white">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 gap-6"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-m8bs-blue/20 to-m8bs-blue/5 border-m8bs-border">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-12 w-12 text-m8bs-blue mx-auto mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">Real-time</div>
                  <div className="text-m8bs-muted">Analytics</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-m8bs-purple/20 to-m8bs-purple/5 border-m8bs-border">
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 text-m8bs-purple mx-auto mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">Secure</div>
                  <div className="text-m8bs-muted">Data Protection</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-m8bs-pink/20 to-m8bs-pink/5 border-m8bs-border">
                <CardContent className="p-6 text-center">
                  <Zap className="h-12 w-12 text-m8bs-pink mx-auto mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">Fast</div>
                  <div className="text-m8bs-muted">Performance</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-m8bs-green/20 to-m8bs-green/5 border-m8bs-border">
                <CardContent className="p-6 text-center">
                  <Award className="h-12 w-12 text-m8bs-green mx-auto mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">Proven</div>
                  <div className="text-m8bs-muted">Results</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-m8bs-blue/10 via-m8bs-purple/10 to-m8bs-pink/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-m8bs-blue to-m8bs-purple bg-clip-text text-transparent">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-m8bs-muted mb-8 max-w-2xl mx-auto">
              Join financial advisors and marketing professionals who are already using M8 Business Suite to track their performance and grow their business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark hover:from-m8bs-blue-dark hover:to-m8bs-blue text-white text-lg px-8 py-6 shadow-lg shadow-m8bs-blue/30"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-m8bs-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Image
                src="/logo.png"
                alt="M8 Business Suite"
                width={150}
                height={50}
                className="h-auto"
              />
            </div>
            <div className="text-m8bs-muted text-sm">
              © {new Date().getFullYear()} M8 Business Suite. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}






