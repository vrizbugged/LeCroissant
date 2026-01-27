"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <div className="relative w-24 h-24 md:w-32 md:h-32">
                <Image
                  src="/image/lecroissant.png"
                  alt="Le Croissant Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
              Freshly baked every day. Delight in flavors crafted with care-made fresh daily to give you the perfect experience, every time.
            </p>
            {/* Social Media Links */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/le.croissant.bali/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/my-transactions"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  My Transactions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Jl. Danau Tamblingan No.47 <br />
                  Sanur, Denpasar Selatan, Kota Denpasar, Bali 80228
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <a
                  href="tel:+6281234567890"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  +62 822-4764-4041
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <a
                  href="mailto:info@lecroissant.com"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  info@lecroissant.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
              © {currentYear} Le Croissant. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
