"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, CheckCircle2, Rocket, Shield, Zap, MapPin, Clock, Phone, Mail, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar/navbar"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

export function LandingPage() {
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
          {/* Dark Overlay untuk kontras teks */}
          <div className="absolute inset-0 bg-black/0"></div>
        </div>

        {/* Text Content - di kiri agar background terlihat */}
        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Text Content - Kiri */}
            <div className="text-left max-w-2xl">
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                Freshly Baked Every Day
              </h1>
              <p className="mb-8 text-lg text-muted-foreground sm:text-xl md:text-2xl">
                Delight in flavors crafted with care-made fresh daily to give you the perfect experience, every time.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-start">
                <Link href="/shop">
                  <Button size="lg" className="text-lg bg-orange-500 text-white hover:bg-orange-600">
                    View shop
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg border-orange-500 text-orange-600 hover:bg-orange-50">
                  Learn More
                </Button>
              </div>
            </div>
            {/* Spacer untuk gambar di kanan */}
            <div className="hidden lg:block"></div>
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
            <ScrollReveal delay={0.8}>
              <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Fresh Daily Logistics</CardTitle>
                <CardDescription>
                  Optimized delivery routes ensuring your pastries arrive in Sanur and surroundings before your first guest wakes up.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>6:00 AM delivery windows</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Temperature-controlled transport</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Baked fresh, never frozen</span>
                  </li>
                </ul>
              </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Consistent Quality</CardTitle>
                <CardDescription>
                  Authentic French techniques meeting high-volume demands. Every croissant looks and tastes the same, every time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>100% Imported Butter (AOP)</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Uniform sizing & weight</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Certified ingredients</span>
                  </li>
                </ul>
              </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Rocket className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Scale with Your Demand</CardTitle>
                <CardDescription>
                  Grow your menu without worrying about kitchen capacity. We handle the baking; you handle the service.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>High-volume banquet capabilities</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Seasonal menu rotation</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Emergency restock options</span>
                  </li>
                </ul>
              </CardContent>
              </Card>
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
              className="border-2 rounded-lg overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow" 
              style={{ margin: 0, padding: 0 }}
              onClick={() => {
                window.open('https://www.google.com/maps/search/?api=1&query=Le+Croissant+Sanur+Bali', '_blank')
              }}
            >
              <div className="relative w-full h-[400px] md:h-[500px] bg-muted overflow-hidden" style={{ margin: 0, padding: 0 }}>
                <Image
                  src="/image/interior.jpg"
                  alt="Le Croissant Sanur Outlet"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                {/* Overlay dengan info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none z-10">
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
              <CardTitle className="text-3xl sm:text-4xl">
                Ready to to scale your Business?
              </CardTitle>
              <CardDescription className="text-lg">
                Get our premium products
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link href="/shop">
                  <Button className="w-full bg-orange-500 text-white hover:bg-orange-600 mt-2" size="lg">
                    View Products
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg">
                  Contact Sales
                </Button>
              </div>
            </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}

