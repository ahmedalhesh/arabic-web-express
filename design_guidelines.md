# Design Guidelines: نظام إدارة تراخيص البرامج

## Design Approach

**Selected System:** Material Design 3 with RTL Arabic optimization
**Justification:** Enterprise admin dashboard requiring clear information hierarchy, efficient data management, and consistent patterns for forms and tables.

## Core Design Principles

1. **RTL-First Design:** All layouts flow right-to-left naturally
2. **Information Clarity:** Dense data presented with clear visual hierarchy
3. **Functional Efficiency:** Quick access to CRUD operations
4. **Professional Minimalism:** Clean, distraction-free interface

---

## Color Palette

### Light Mode
- **Primary:** 220 90% 56% (Professional blue for actions/buttons)
- **Surface:** 0 0% 100% (White backgrounds)
- **Surface Variant:** 220 14% 96% (Card backgrounds)
- **Border:** 220 13% 91% (Subtle borders)
- **Text Primary:** 220 9% 15%
- **Text Secondary:** 220 9% 46%
- **Success:** 142 71% 45% (Active licenses)
- **Warning:** 38 92% 50% (Expiring licenses)
- **Error:** 0 84% 60% (Suspended/invalid)

### Dark Mode
- **Primary:** 220 90% 65%
- **Surface:** 220 15% 11% (Dark background)
- **Surface Variant:** 220 13% 15% (Card backgrounds)
- **Border:** 220 10% 23%
- **Text Primary:** 220 9% 95%
- **Text Secondary:** 220 9% 70%
- **Success/Warning/Error:** Same hues, adjusted lightness

---

## Typography

**Font Family:** 
- Primary: 'Cairo', sans-serif (Google Fonts - excellent Arabic support)
- Monospace: 'JetBrains Mono', monospace (for serial numbers)

**Scale:**
- Page Title: text-3xl font-bold (h1)
- Section Headers: text-xl font-semibold (h2)
- Card Titles: text-lg font-medium
- Body: text-base font-normal
- Labels: text-sm font-medium
- Captions/Meta: text-sm text-secondary

**RTL Considerations:** Ensure proper Arabic kashida and letter spacing

---

## Layout System

**Container Strategy:**
- Max width: max-w-7xl mx-auto
- Page padding: px-4 sm:px-6 lg:px-8
- Consistent vertical spacing: Use py-6 for sections, gap-6 between cards

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Tight spacing: p-2, gap-2
- Standard spacing: p-4, gap-4, mb-6
- Generous spacing: p-6, gap-6, mt-8

**Grid System:**
- Login page: Single centered card (max-w-md)
- Dashboard: Full-width table with action sidebar
- Forms: Two-column on desktop (grid-cols-1 lg:grid-cols-2)

---

## Component Library

### Authentication
**Login Card:**
- Centered vertically and horizontally
- White/dark surface with shadow-lg
- Logo/title at top with mb-8
- Form fields with gap-6
- Full-width primary button
- Rounded corners: rounded-lg

### Dashboard Header
- **Layout:** Sticky top bar with gradient background
- **Content:** App title (right), user info + logout button (left)
- **Height:** h-16 with px-6
- **Shadow:** shadow-md for depth

### Data Table
**Structure:**
- Full-width responsive table with horizontal scroll on mobile
- Alternating row colors (even:bg-surface-variant)
- Hover states: hover:bg-surface-variant/50
- Compact padding: px-4 py-3

**Columns:**
1. رقم السيريال (monospace font, bold)
2. نشط (Badge component: green/gray)
3. رقم الجهاز (truncated with tooltip)
4. تاريخ التفعيل (text-sm text-secondary)
5. الحالة (Status badge with color coding)
6. الملاحظات (truncated, expandable)
7. إجراءات (Icon buttons: edit, delete)

**Status Badges:**
- صالح: bg-success/10 text-success border-success
- منتهي: bg-warning/10 text-warning border-warning
- موقوف: bg-error/10 text-error border-error
- غير مفعّل: bg-slate-100 text-slate-600 border-slate-300

### Action Toolbar
**Layout:** Sticky bar above table with gap-4
**Components:**
- زر "إضافة ترخيص" (Primary button with + icon)
- Search input (w-full max-w-sm with magnifying glass icon)
- Filter dropdown (Status filter)
- Export button (Secondary button with download icon)

### Forms (Add/Edit License)
**Modal/Slide-over:** 
- Fixed overlay with backdrop blur
- Slide from left (RTL): transform transition
- Width: max-w-2xl
- Padding: p-6

**Form Fields:**
- Labels above inputs (mb-2)
- Inputs: rounded-md border with focus:ring
- Required field indicator: red asterisk
- Helper text: text-xs text-secondary mt-1
- Toggle switches for boolean (نشط)
- Date picker for activation date
- Textarea for notes (rows-3)

**Form Actions:**
- Fixed bottom bar with shadow-up
- Save (Primary), Cancel (Secondary/Ghost)
- Gap: gap-3, padding: p-4

### Buttons
**Primary:** bg-primary text-white hover:bg-primary/90 rounded-md px-4 py-2.5
**Secondary:** bg-surface-variant text-primary border-primary hover:bg-primary/5
**Ghost/Icon:** hover:bg-surface-variant rounded-md p-2
**Destructive:** bg-error text-white hover:bg-error/90

### Navigation (if needed)
- Vertical sidebar (right side for RTL): w-64
- Menu items: px-4 py-3 rounded-r-lg hover:bg-surface-variant
- Active state: bg-primary/10 text-primary border-r-2 border-primary

---

## Interactions & Animations

**Minimal, Purposeful Motion:**
- Page transitions: None (instant)
- Modal/Dialog: Fade in backdrop (200ms), slide content (300ms ease-out)
- Button hover: 150ms ease
- Focus rings: 200ms ease
- Loading states: Pulsing skeleton or spinner

**No Decorative Animations:** Prioritize data visibility over visual flair

---

## Responsive Behavior

**Breakpoints:**
- Mobile (<640px): Stacked layout, horizontal scroll table
- Tablet (640px-1024px): Two-column forms
- Desktop (>1024px): Full layout with sidebar if used

**Mobile Adaptations:**
- Hamburger menu for actions
- Cards instead of table rows
- Bottom sheet for forms instead of modal

---

## Accessibility (Dark Mode)

**Consistent Dark Implementation:**
- All inputs use dark surface colors
- Maintain WCAG AA contrast ratios
- Focus indicators visible in both modes
- System preference detection with manual toggle

---

## Images

**No hero images** - This is a utility dashboard
**Icons Only:** Use Heroicons (outline style) via CDN for:
- Actions: PlusIcon, PencilIcon, TrashIcon
- UI: MagnifyingGlassIcon, ArrowDownTrayIcon, XMarkIcon
- Status: CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon