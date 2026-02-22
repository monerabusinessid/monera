# 🎨 MONERA STYLE GUIDE - Quick Reference

## 🎨 COLOR PALETTE

```css
/* Primary Colors */
--brand-purple: #6F03CD
--brand-yellow: #FFD52A

/* Background Colors */
--bg-white: #FFFFFF
--bg-light: #F9F7FC
--bg-dark: #6F03CD

/* Text Colors */
--text-primary: #111118
--text-secondary: #616289
--text-light: #FFFFFF
```

---

## 📐 SPACING SYSTEM

```tsx
/* Section Padding */
py-20              // 80px vertical padding (ALL sections)

/* Container */
max-w-7xl mx-auto px-4

/* Grid Gap */
gap-8              // 32px gap for all grids

/* Card Padding */
p-6                // 24px padding for cards
```

---

## 📝 TYPOGRAPHY

```tsx
/* Headings */
H1: text-5xl md:text-6xl font-bold          // Hero only
H2: text-3xl md:text-4xl font-bold          // Section titles
H3: text-xl font-bold                        // Card titles

/* Body Text */
Body: text-base md:text-lg                   // Regular text
Small: text-sm                               // Small text
```

---

## 🎴 COMPONENTS

### Card
```tsx
<Card className="border border-gray-200 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
  <CardHeader className="p-6">
    <CardTitle className="text-xl font-bold">Title</CardTitle>
  </CardHeader>
  <CardContent className="p-6 pt-0">
    Content
  </CardContent>
</Card>
```

### Primary Button
```tsx
<Button className="bg-brand-yellow text-gray-900 hover:bg-yellow-400 px-8 py-4 rounded-xl font-bold">
  Primary Action
</Button>
```

### Secondary Button
```tsx
<Button variant="outline" className="border-2 border-brand-purple text-brand-purple hover:bg-purple-50 px-8 py-4 rounded-xl font-semibold">
  Secondary Action
</Button>
```

### Ghost Button (Dark Background)
```tsx
<Button className="bg-white/10 text-white hover:bg-white/20 px-8 py-4 rounded-xl font-semibold">
  Ghost Action
</Button>
```

---

## 🎨 SECTION BACKGROUNDS

```tsx
/* Use only these 3 backgrounds */

// White sections (main content)
className="py-20 bg-white"

// Light purple sections (alternating)
className="py-20 bg-[#F9F7FC]"

// Purple sections (CTA/highlight)
className="py-20 bg-brand-purple text-white"
```

---

## 📋 SECTION PATTERN

```
1. Hero          → bg-brand-purple
2. Services      → bg-white
3. Cost          → bg-[#F9F7FC]
4. Guarantee     → bg-white
5. Trusted By    → bg-brand-purple
6. Testimonials  → bg-white
7. Roles         → bg-[#F9F7FC]
8. Why Choose    → bg-white
9. How It Works  → bg-brand-purple
10. Case Studies → bg-[#F9F7FC]
11. FAQ          → bg-brand-purple
12. CTA          → bg-brand-purple
```

**Pattern:** Purple → White → Light → repeat

---

## ✅ DO's

✅ Use `py-20` for all sections
✅ Use `border border-gray-200` for cards
✅ Use `rounded-xl` for cards and buttons
✅ Use `gap-8` for grids
✅ Use `max-w-7xl mx-auto px-4` for containers
✅ Use 3 background colors only
✅ Keep consistent spacing

---

## ❌ DON'Ts

❌ Don't use `py-16` or other spacing variations
❌ Don't use `border-2` or `border-0`
❌ Don't use `rounded-2xl` or `rounded-3xl`
❌ Don't use complex gradients
❌ Don't use `rounded-t-[3rem] -mt-8` on sections
❌ Don't mix button sizes
❌ Don't create new color variations

---

## 🚀 QUICK COMMANDS

```bash
# Run auto-fix script
node fix-landing-page.js

# Check sitemap
curl http://localhost:3000/sitemap.xml

# Check robots
curl http://localhost:3000/robots.txt

# Build for production
npm run build

# Start production server
npm run start
```

---

## 📁 KEY FILES

```
app/page.tsx              → Landing page
app/layout.tsx            → SEO metadata
app/globals.css           → Global styles
app/sitemap.ts            → SEO sitemap
app/robots.ts             → SEO robots
LANDING_PAGE_IMPROVEMENTS.md → Detailed guide
VISUAL_COMPARISON.md      → Before/After comparison
SUMMARY.md                → Complete summary
```

---

## 🎯 MAINTENANCE CHECKLIST

When adding new sections:
- [ ] Use `py-20` for padding
- [ ] Choose from 3 background colors
- [ ] Use standard card style
- [ ] Use standard button styles
- [ ] Follow typography hierarchy
- [ ] Use `max-w-7xl mx-auto px-4` container
- [ ] Use `gap-8` for grids
- [ ] Test on mobile

---

## 📞 NEED HELP?

1. Check `LANDING_PAGE_IMPROVEMENTS.md` for detailed guide
2. Check `VISUAL_COMPARISON.md` for examples
3. Check `SUMMARY.md` for complete overview
4. Review this file for quick reference

---

**Last Updated:** 2024
**Version:** 2.0 - Optimized & Consistent
**Status:** ✅ Production Ready
