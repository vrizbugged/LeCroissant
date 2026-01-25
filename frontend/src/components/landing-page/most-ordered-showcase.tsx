"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, TrendingUp, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { productsApi } from "@/lib/api"
import type { ProductResource } from "@/types/api"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"

const MIN_PURCHASE_QUANTITY = 10

export function MostOrderedShowcase() {
  const [products, setProducts] = React.useState<ProductResource[]>([])
  const [loading, setLoading] = React.useState(true)
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
  const { addItem, isAuthenticated } = useCart()
  const router = useRouter()

  React.useEffect(() => {
    async function fetchMostOrdered() {
      try {
        const data = await productsApi.getMostOrdered(3)
        console.log("Most ordered products:", data)
        if (data && Array.isArray(data) && data.length > 0) {
          // Log image URLs untuk debugging
          data.forEach((product, idx) => {
            console.log(`Product ${idx + 1} (${product.nama_produk}):`, {
              image_url: product.image_url,
              gambar_url: product.gambar_url,
              hasImage: !!(product.image_url || product.gambar_url)
            })
          })
          setProducts(data)
        } else {
          console.warn("No products returned from API")
        }
      } catch (error) {
        console.error("Error fetching most ordered products:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchMostOrdered()
  }, [])

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading Most Ordered Products...</div>
        </div>
      </section>
    )
  }

  // Jika tidak ada produk, tidak tampilkan section
  if (!products || products.length === 0) {
    return null
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.21, 1.11, 0.81, 0.99],
      },
    },
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="mb-12 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Trending</span>
              </motion.div>
              <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
                Most Ordered Products
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our Clients Love this very much. Check it out!
              </p>
            </div>
          </ScrollReveal>

          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group"
              >
                <Card className="relative h-full overflow-hidden border-2 transition-all duration-300 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/20">
                  {/* Badge untuk produk terpopuler */}
                  {index < 3 && (
                    <Badge
                      className="absolute top-4 left-4 z-10 bg-orange-500 hover:bg-orange-600 text-white"
                      variant="default"
                    >
                      #{index + 1} Trending
                    </Badge>
                  )}

                  <CardContent className="p-0">
                    {/* Image Container */}
                    <div className="relative h-64 w-full overflow-hidden bg-muted">
                      {(product.image_url || product.gambar_url) ? (
                        <img
                          src={product.image_url || product.gambar_url || ""}
                          alt={product.nama_produk}
                          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                            hoveredIndex === index ? "scale-110" : "scale-100"
                          }`}
                          onError={(e) => {
                            // Fallback jika gambar gagal dimuat
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent && !parent.querySelector('.fallback-image')) {
                              const fallback = document.createElement('div')
                              fallback.className = 'fallback-image flex items-center justify-center h-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20'
                              fallback.innerHTML = '<svg class="w-16 h-16 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>'
                              parent.appendChild(fallback)
                            }
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20">
                          <ShoppingCart className="w-16 h-16 text-orange-400" />
                        </div>
                      )}
                      
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Hover effect - Quick view button */}
                      <div
                        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                          hoveredIndex === index
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
                        }`}
                      >
                        <Link href="/shop">
                          <Button
                            size="lg"
                            className="bg-white text-orange-600 hover:bg-orange-50 shadow-lg"
                          >
                            See Details
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {product.nama_produk}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {product.deskripsi}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-2xl font-bold text-orange-600">
                            {product.harga_formatted}
                          </p>
                          <p className="text-xs text-muted-foreground">per unit</p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        >
                          Stok: {product.ketersediaan_stok}
                        </Badge>
                      </div>

                      <Button
                        className="w-full group-hover:bg-orange-600 group-hover:text-white transition-all"
                        variant="outline"
                        onClick={() => {
                          // Check if user is authenticated
                          if (!isAuthenticated) {
                            toast.error("Silakan login terlebih dahulu untuk menambahkan produk ke keranjang")
                            router.push("/login")
                            return
                          }

                          // Add to cart with minimum quantity
                          addItem(product, MIN_PURCHASE_QUANTITY)
                          toast.success(`${product.nama_produk} ditambahkan ke keranjang (${MIN_PURCHASE_QUANTITY} unit)`)
                        }}
                      >
                        <ShoppingCart className="mr-2 w-4 h-4" />
                        Add to cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <ScrollReveal delay={0.3}>
            <div className="mt-12 text-center">
              <Link href="/shop">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  See All Products
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
