"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo dan Navigation Menu - Kiri */}
          <div className="flex items-center gap-4 md:gap-6 pl-4 md:pl-6">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative w-20 h-20 md:w-40 md:h-40">
                <Image
                  src="/image/lecroissant.png"
                  alt="Brand Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>

            {/* Navigation Menu - Menempel di sebelah logo */}
            <div className="hidden md:flex items-center gap-1">
              <Link href="/">
                <Button variant="ghost" className="text-sm font-medium text-black hover:text-black/90 hover:bg-black/20">
                  Home
                </Button>
              </Link>
              <span className="text-black/70 mx-1">·</span>
              <Link href="/shop">
                <Button variant="ghost" className="text-sm font-medium text-black hover:text-black/90 hover:bg-black/20">
                  Shop
                </Button>
              </Link>
              <span className="text-black/70 mx-1">·</span>
              <Link href="/contact">
                <Button variant="ghost" className="text-sm font-medium text-black hover:text-black/90 hover:bg-black/20">
                  Contact Us
                </Button>
              </Link>
              <span className="text-black/70 mx-1">·</span>
              <Link href="/services">
                <Button variant="ghost" className="text-sm font-medium text-black hover:text-black/90 hover:bg-black/20">
                  Services
                </Button>
              </Link>
            </div>

            {/* Mobile Menu - akan ditambahkan nanti jika perlu */}
            <div className="md:hidden">
              {/* Mobile menu button bisa ditambahkan di sini */}
            </div>
          </div>

          {/* Logout Button - Pojok Kanan */}
          <div className="flex items-center gap-2 pr-4 md:pr-6">
            <Button
              variant="outline"
              size="sm"
              className="text-sm bg-white border-white/30 text-orange-600 hover:bg-white/90 hover:text-orange-700"
              onClick={() => {
                // Tambahkan logic logout di sini
                console.log("Logout clicked")
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

