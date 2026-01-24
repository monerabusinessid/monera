# What's New Page - Specification

## Overview
Halaman "What's New" untuk menampilkan update terbaru, fitur baru, dan improvement dari platform Monera.

## Design Requirements

### 1. Hero Section
- Background: Gradient purple (sama seperti homepage)
- Padding top: `pt-40 sm:pt-36` (konsisten dengan page lain)
- Margin top: `-mt-20 sm:-mt-24` (untuk overlap dengan navbar)
- Animated background: Stars/particles effect
- Content:
  - Title: "What's New at Monera"
  - Subtitle: "Stay updated with our latest features, updates, and improvements"

### 2. Content Section
- Background: White dengan `rounded-t-3xl -mt-6 sm:-mt-8`
- Container: `container mx-auto px-4 py-16`
- Max width: `max-w-6xl mx-auto`

### 3. Latest Updates Grid
- Title: "Latest Updates"
- Layout: Grid 1 kolom (mobile), 2 kolom (tablet), 3 kolom (desktop)
- Card items:
  - Enhanced Job Search (January 2026)
  - New Admin Dashboard (January 2026)
  - Improved Profile System (December 2025)
  - Real-time Notifications (December 2025)
  - Mobile App Updates (November 2025)
  - Security Enhancements (November 2025)

### 4. Categories Section
- Layout: Grid 1 kolom (mobile), 2 kolom (tablet), 4 kolom (desktop)
- Cards:
  - Monera Updates
  - Blog
  - Research Institute
  - Release Notes
- Semua link ke `/news`

### 5. Newsletter Signup
- Background: Gradient purple-yellow
- Border: 2px purple
- Form fields:
  - Email input
  - Subscribe button (bg-brand-yellow)

## Technical Requirements

### Structure
```tsx
<div className="min-h-screen">
  <section className="hero">
    {/* Animated background */}
    {/* Title & subtitle */}
  </section>
  
  <div className="bg-white rounded-t-3xl -mt-6 sm:-mt-8">
    <div className="container mx-auto px-4 py-16">
      {/* Latest Updates Grid */}
      {/* Categories Grid */}
      {/* Newsletter Signup */}
    </div>
  </div>
  
  <Footer />
</div>
```

### Consistency Requirements
1. Hero section HARUS sama dengan jobs, hire-talent, about-us pages
2. Padding top HARUS `pt-40 sm:pt-36`
3. Margin top HARUS `-mt-20 sm:-mt-24`
4. Rounded section HARUS `-mt-6 sm:-mt-8`
5. TIDAK ada `bg-white` di main div (hanya di rounded section)

### Responsive Breakpoints
- Mobile: < 768px (1 column)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (3-4 columns)

## Color Scheme
- Primary: `brand-purple` (#7C3AED)
- Secondary: `brand-yellow` (#FCD34D)
- Background: White
- Text: Gray-900, Gray-600

## Components to Use
- Card, CardContent, CardHeader, CardTitle from `@/components/ui/card`
- Footer from `@/components/footer`
- Link from `next/link`

## Notes
- Page ini HARUS konsisten dengan page lain (jobs, hire-talent, about-us)
- Navbar spacing HARUS sesuai
- Mobile responsive HARUS perfect
- Animated background HARUS sama dengan homepage
