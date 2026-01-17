"use client"

import * as React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, CheckCircle2, Rocket, Shield, Zap, MapPin, Clock, Phone, Mail, ExternalLink, Sparkles, ShoppingCart, Search, CreditCard, Package } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar/navbar"
import { Footer } from "@/components/footer/footer"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { motion } from "framer-motion"

// Import API dan Type order SUDAH DIHAPUS karena tidak dipakai

export function LandingPage() {
  // State dan UseEffect untuk fetching order SUDAH DIHAPUS

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero Section */}
      <section className="relative w-full min-h-[300px] md:min-h-[400px] lg:min-h-[700px] flex items-center justify-center overflow-hidden pt-16 md:pt-20">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/image/almondbg.png"
            alt="Freshly baked goods background"
            fill
            className="object-cover"
            priority
          />
          {/* Simple Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/10" />
        </div>

        {/* Text Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Text Content - Kiri */}
            <ScrollReveal>
              <div className="text-left max-w-2xl">
                <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                  <span className="inline-block">Freshly Baked</span>
                  <br />
                  <span className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                    Every Day
                  </span>
                </h1>
                <p className="mb-8 text-lg text-muted-foreground sm:text-xl md:text-2xl">
                  Delight in flavors crafted with care-made fresh daily to give you the perfect experience, every time.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-start">
                  <Link href="/shop">
                    <Button size="lg" className="text-lg bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 group">
                      View shop
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="text-lg border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-600 transition-all duration-300">
                    Learn More
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <Separator />

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Why Choose Us?
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to scale up your business
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ScrollReveal delay={0.1}>
              <Card className="h-full border-2 hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg cursor-pointer group">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 group-hover:from-orange-500/30 group-hover:to-orange-600/30 transition-all duration-300">
                    <Zap className="h-6 w-6 text-orange-600 group-hover:text-orange-500 transition-colors" />
                  </div>
                  <CardTitle className="group-hover:text-orange-600 transition-colors">Fresh Daily Logistics</CardTitle>
                  <CardDescription>
                    Optimized delivery routes ensuring your pastries arrive in Sanur and surroundings before your first guest wakes up.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {[
                      "6:00 AM delivery windows",
                      "Temperature-controlled transport",
                      "Baked fresh, never frozen"
                    ].map((item, idx) => (
                      <li 
                        key={idx}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle2 className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <Card className="h-full border-2 hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg cursor-pointer group">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 group-hover:from-orange-500/30 group-hover:to-orange-600/30 transition-all duration-300">
                    <Shield className="h-6 w-6 text-orange-600 group-hover:text-orange-500 transition-colors" />
                  </div>
                  <CardTitle className="group-hover:text-orange-600 transition-colors">Consistent Quality</CardTitle>
                  <CardDescription>
                    Authentic French techniques meeting high-volume demands. Every croissant looks and tastes the same, every time.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {[
                      "100% Imported Butter (AOP)",
                      "Uniform sizing & weight",
                      "Certified ingredients"
                    ].map((item, idx) => (
                      <li 
                        key={idx}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle2 className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <Card className="h-full border-2 hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg cursor-pointer group">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 group-hover:from-orange-500/30 group-hover:to-orange-600/30 transition-all duration-300">
                    <Rocket className="h-6 w-6 text-orange-600 group-hover:text-orange-500 transition-colors" />
                  </div>
                  <CardTitle className="group-hover:text-orange-600 transition-colors">Scale with Your Demand</CardTitle>
                  <CardDescription>
                    Grow your menu without worrying about kitchen capacity. We handle the baking; you handle the service.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {[
                      "High-volume banquet capabilities",
                      "Seasonal menu rotation",
                      "Emergency restock options"
                    ].map((item, idx) => (
                      <li 
                        key={idx}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle2 className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <Separator />

      {/* How to Order Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                How to Order
              </h2>
              <p className="text-lg text-muted-foreground">
                Simple steps to get your fresh pastries delivered
              </p>
            </div>
          </ScrollReveal>

          <div className="relative">
            {/* Connecting Line (Desktop only) */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200 -z-0" />

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 relative z-10">
              {[
                {
                  step: 1,
                  icon: Search,
                  title: "Browse Products",
                  description: "Explore our wide selection of freshly baked pastries and baked goods",
                  color: "from-blue-500 to-blue-600",
                  bgColor: "bg-blue-500/10",
                  iconColor: "text-blue-600"
                },
                {
                  step: 2,
                  icon: ShoppingCart,
                  title: "Add to Cart",
                  description: "Select your favorite items and add them to your shopping cart",
                  color: "from-purple-500 to-purple-600",
                  bgColor: "bg-purple-500/10",
                  iconColor: "text-purple-600"
                },
                {
                  step: 3,
                  icon: CreditCard,
                  title: "Checkout",
                  description: "Review your order and complete the payment securely",
                  color: "from-green-500 to-green-600",
                  bgColor: "bg-green-500/10",
                  iconColor: "text-green-600"
                },
                {
                  step: 4,
                  icon: Package,
                  title: "Receive Order",
                  description: "Get your fresh pastries delivered or ready for pickup",
                  color: "from-orange-500 to-orange-600",
                  bgColor: "bg-orange-500/10",
                  iconColor: "text-orange-600"
                }
              ].map((item, index) => (
                <ScrollReveal key={item.step} delay={index * 0.1}>
                  <div className="relative">
                    <Card className="h-full border-2 hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg cursor-pointer group bg-background">
                      <CardHeader className="text-center pb-4">
                        {/* Step Number Badge */}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-lg z-20">
                          {item.step}
                        </div>

                        {/* Icon Container */}
                        <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl ${item.bgColor} group-hover:scale-105 transition-transform duration-300`}>
                          <item.icon className={`h-10 w-10 ${item.iconColor} transition-transform`} />
                        </div>

                        <CardTitle className="text-xl group-hover:text-orange-600 transition-colors">
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center pt-0">
                        <CardDescription className="text-sm leading-relaxed">
                          {item.description}
                        </CardDescription>
                      </CardContent>
                    </Card>

                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* CTA Button */}
            <ScrollReveal delay={0.6}>
              <motion.div
                className="mt-12 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Link href="/shop">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block"
                  >
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 group px-8"
                    >
                      Start Shopping Now
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <Separator />

      {/* Location Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Visit Us
              </h2>
              <p className="text-lg text-muted-foreground">
                Find us at Le Croissant Sanur
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Outlet Image - Clickable untuk Google Maps */}
            <ScrollReveal delay={0.1} direction="left">
              <div 
                className="border-2 rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300" 
                style={{ margin: 0, padding: 0 }}
                onClick={() => {
                  window.open('https://www.google.com/maps/search/?api=1&query=Le+Croissant+Sanur+Bali', '_blank')
                }}
              >
                <div className="relative w-full h-[400px] md:h-[500px] bg-muted overflow-hidden" style={{ margin: 0, padding: 0 }}>
                  <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src="/image/interior.jpg"
                      alt="Le Croissant Sanur Outlet"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  </div>
                  {/* Overlay dengan info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none z-10 group-hover:from-black/80 transition-all duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5" />
                        <p className="font-semibold text-lg">Click to open in Google Maps</p>
                        <ExternalLink className="h-4 w-4" />
                      </div>
                      <p className="text-sm text-white/90">Le Croissant Sanur, Bali</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Location Details */}
            <ScrollReveal delay={0.2} direction="right">
              <div className="space-y-4">
                <Card className="border-2">
                <CardHeader className="pb-8">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                    <MapPin className="h-4 w-4 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl">Location Details</CardTitle>
                  <CardDescription className="text-sm">
                    Visit our beautiful bakery in Sanur
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 flex-shrink-0">
                      <MapPin className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-0.5">Address</p>
                      <p className="text-muted-foreground text-sm">
                        Le Croissant Sanur
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Sanur, Bali, Indonesia
                      </p>
                    </div>
                  </div>

                  {/* Opening Hours */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 flex-shrink-0">
                      <Clock className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-0.5">Opening Hours</p>
                      <p className="text-muted-foreground text-sm">
                        Monday - Sunday
                      </p>
                      <p className="text-muted-foreground text-sm font-medium">
                        6:00 AM - 8:00 PM
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 flex-shrink-0">
                      <Phone className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-0.5">Phone</p>
                      <a href="tel:+62XXXXXXXXXX" className="text-orange-600 hover:text-orange-700 hover:underline text-sm">
                        +62 XXX XXX XXXX
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 flex-shrink-0">
                      <Mail className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-0.5">Email</p>
                      <a href="mailto:info@lecroissant.com" className="text-orange-600 hover:text-orange-700 hover:underline text-sm">
                        info@lecroissant.com
                      </a>
                    </div>
                  </div>

                  {/* Google Maps Button */}
                  <Button 
                    className="w-full bg-orange-500 text-white hover:bg-orange-600 mt-2"
                    size="sm"
                    onClick={() => {
                      window.open('https://www.google.com/maps/search/?api=1&query=Le+Croissant+Sanur+Bali', '_blank')
                    }}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Open in Google Maps
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <Separator />

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal>
            <Card className="border-2">
              <CardHeader className="text-center">
                <div className="inline-block mb-4">
                  <Sparkles className="h-8 w-8 text-orange-500 mx-auto" />
                </div>
                <CardTitle className="text-3xl sm:text-4xl">
                  Ready to scale your Business?
                </CardTitle>
                <CardDescription className="text-lg">
                  Get our premium products
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <Link href="/shop">
                    <Button className="w-full bg-orange-500 text-white hover:bg-orange-600 mt-2 shadow-lg hover:shadow-xl transition-all duration-300 group" size="lg">
                      View Products
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="text-lg border-2 hover:border-orange-500 hover:text-orange-600 transition-all duration-300">
                    Contact Sales
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}