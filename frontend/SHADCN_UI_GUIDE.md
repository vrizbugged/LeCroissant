# Panduan Merancang UI dengan shadcn/ui

## 📚 Daftar Isi
1. [Pengenalan](#pengenalan)
2. [Menambahkan Komponen Baru](#menambahkan-komponen-baru)
3. [Menggunakan Komponen yang Ada](#menggunakan-komponen-yang-ada)
4. [Kustomisasi Komponen](#kustomisasi-komponen)
5. [Best Practices](#best-practices)
6. [Contoh Komponen Populer](#contoh-komponen-populer)

---

## 🎯 Pengenalan

Proyek Anda sudah memiliki shadcn/ui yang terpasang dengan benar! Komponen yang sudah tersedia:
- ✅ Button
- ✅ Badge
- ✅ Card
- ✅ Separator

Semua komponen menggunakan:
- **Tailwind CSS** untuk styling
- **CSS Variables** untuk theming (light/dark mode)
- **TypeScript** untuk type safety
- **Radix UI** untuk aksesibilitas

---

## ➕ Menambahkan Komponen Baru

### Cara 1: Menggunakan CLI (Recommended)

```bash
# Masuk ke folder frontend
cd frontend

# Tambahkan komponen yang diinginkan
npx shadcn@latest add [nama-komponen]

# Contoh:
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add form
npx shadcn@latest add table
```

### Cara 2: Manual Installation

1. Kunjungi [shadcn/ui Components](https://ui.shadcn.com/docs/components)
2. Pilih komponen yang diinginkan
3. Copy kode komponen ke `src/components/ui/[nama-komponen].tsx`

---

## 🎨 Menggunakan Komponen yang Ada

### Contoh: Button

```tsx
import { Button } from "@/components/ui/button"

// Variant yang tersedia: default, destructive, outline, secondary, ghost, link
// Size yang tersedia: default, sm, lg, icon

<Button variant="default" size="lg">
  Click Me
</Button>

<Button variant="outline" size="sm">
  Outline Button
</Button>

<Button variant="ghost">
  Ghost Button
</Button>
```

### Contoh: Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Judul Card</CardTitle>
    <CardDescription>Deskripsi singkat</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Konten card di sini</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Contoh: Badge

```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

---

## 🎨 Kustomisasi Komponen

### 1. Kustomisasi dengan className

Semua komponen shadcn menerima `className` prop untuk kustomisasi:

```tsx
<Button className="bg-blue-500 hover:bg-blue-600">
  Custom Button
</Button>

<Card className="border-2 border-primary shadow-lg">
  Custom Card
</Card>
```

### 2. Kustomisasi Theme (Warna)

Edit file `src/app/globals.css` untuk mengubah warna tema:

```css
:root {
  --primary: 222.2 47.4% 11.2%;        /* Warna primary */
  --secondary: 210 40% 96.1%;         /* Warna secondary */
  --destructive: 0 84.2% 60.2%;        /* Warna error/danger */
  --muted: 210 40% 96.1%;              /* Warna muted */
  --accent: 210 40% 96.1%;             /* Warna accent */
  --radius: 0.5rem;                    /* Border radius */
}
```

### 3. Kustomisasi Komponen Langsung

Edit file komponen di `src/components/ui/[nama-komponen].tsx` untuk mengubah styling default.

---

## ✨ Best Practices

### 1. Gunakan Komposisi Komponen

```tsx
// ✅ Baik: Komposisi yang jelas
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// ❌ Buruk: Semua dalam satu div
<div className="card">
  <div className="title">Title</div>
  <div className="content">Content</div>
</div>
```

### 2. Gunakan Variant Props

```tsx
// ✅ Baik: Gunakan variant yang sudah ada
<Button variant="outline">Click</Button>

// ❌ Buruk: Override dengan className
<Button className="border border-gray-300">Click</Button>
```

### 3. Konsisten dengan Spacing

```tsx
// Gunakan Tailwind spacing utilities
<div className="space-y-4">  {/* Gap 1rem antara children */}
  <Card />
  <Card />
</div>

<div className="gap-6">  {/* Gap 1.5rem */}
  <Button />
  <Button />
</div>
```

### 4. Responsive Design

```tsx
// Gunakan Tailwind responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card />
  <Card />
  <Card />
</div>
```

---

## 🚀 Contoh Komponen Populer

### Input Form

```bash
npx shadcn@latest add input label
```

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="email@example.com" />
</div>
```

### Dialog/Modal

```bash
npx shadcn@latest add dialog
```

```tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Judul Dialog</DialogTitle>
      <DialogDescription>Deskripsi dialog</DialogDescription>
    </DialogHeader>
    <p>Konten dialog</p>
  </DialogContent>
</Dialog>
```

### Dropdown Menu

```bash
npx shadcn@latest add dropdown-menu
```

```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Table

```bash
npx shadcn@latest add table
```

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Form dengan Validation

```bash
npx shadcn@latest add form
```

```tsx
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// Lihat dokumentasi react-hook-form untuk implementasi lengkap
```

---

## 📖 Sumber Daya

- **Dokumentasi Resmi**: https://ui.shadcn.com
- **Komponen Gallery**: https://ui.shadcn.com/docs/components
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Radix UI**: https://www.radix-ui.com

---

## 💡 Tips Tambahan

1. **Dark Mode**: Sudah tersedia! Tambahkan class `dark` ke parent element untuk mengaktifkan dark mode
2. **Icons**: Gunakan `lucide-react` (sudah terpasang) untuk icons
3. **Animations**: Gunakan `framer-motion` jika perlu animasi kompleks
4. **Accessibility**: Semua komponen shadcn sudah aksesibel, jangan ubah struktur HTML

---

## 🎯 Langkah Selanjutnya

1. Jelajahi [komponen yang tersedia](https://ui.shadcn.com/docs/components)
2. Tambahkan komponen yang dibutuhkan untuk proyek Anda
3. Kustomisasi tema sesuai brand Anda
4. Buat komponen komposit dari komponen shadcn dasar

Happy coding! 🚀

