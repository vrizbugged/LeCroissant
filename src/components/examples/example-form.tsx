"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Lock, User } from "lucide-react"

/**
 * Contoh komponen form menggunakan shadcn/ui
 * 
 * Untuk menggunakan komponen ini:
 * 1. Install komponen yang dibutuhkan: npx shadcn@latest add input label
 * 2. Uncomment import dan kode yang menggunakan Input dan Label
 */
export function ExampleForm() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Contoh Form dengan shadcn/ui</CardTitle>
              <CardDescription className="mt-2">
                Demonstrasi penggunaan komponen shadcn untuk membuat form yang menarik
              </CardDescription>
            </div>
            <Badge variant="secondary">Example</Badge>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="space-y-6 pt-6">
          {/* Info Section */}
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Untuk menggunakan Input dan Label, jalankan:
            </p>
            <code className="mt-2 block rounded bg-background p-2 text-xs">
              npx shadcn@latest add input label
            </code>
          </div>

          {/* Form Fields Example */}
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              {/* Uncomment setelah install Input component */}
              {/* <Input id="email" type="email" placeholder="nama@email.com" /> */}
              <div className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                (Input component akan muncul di sini)
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </label>
              {/* Uncomment setelah install Input component */}
              {/* <Input id="password" type="password" placeholder="••••••••" /> */}
              <div className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                (Input component akan muncul di sini)
              </div>
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Username
              </label>
              {/* Uncomment setelah install Input component */}
              {/* <Input id="username" type="text" placeholder="username" /> */}
              <div className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                (Input component akan muncul di sini)
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button className="w-full sm:w-auto">
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Examples */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Button Variants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="default" className="w-full">Default</Button>
            <Button variant="secondary" className="w-full">Secondary</Button>
            <Button variant="outline" className="w-full">Outline</Button>
            <Button variant="ghost" className="w-full">Ghost</Button>
            <Button variant="destructive" className="w-full">Destructive</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Badge Variants</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

