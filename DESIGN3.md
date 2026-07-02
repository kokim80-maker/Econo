---
name: Arbor Economics
colors:
  surface: '#fbf8ff'
  surface-dim: '#d6d8f9'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2ff'
  surface-container: '#edecff'
  surface-container-high: '#e6e6ff'
  surface-container-highest: '#dfe0ff'
  on-surface: '#161a32'
  on-surface-variant: '#414844'
  inverse-surface: '#2b2e48'
  inverse-on-surface: '#f1efff'
  outline: '#717973'
  outline-variant: '#c1c8c2'
  surface-tint: '#3f6653'
  primary: '#012d1d'
  on-primary: '#ffffff'
  primary-container: '#1b4332'
  on-primary-container: '#86af99'
  inverse-primary: '#a5d0b9'
  secondary: '#9a442d'
  on-secondary: '#ffffff'
  secondary-container: '#fc9174'
  on-secondary-container: '#742814'
  tertiary: '#27261a'
  on-tertiary: '#ffffff'
  tertiary-container: '#3d3c2f'
  on-tertiary-container: '#a8a695'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1ecd4'
  primary-fixed-dim: '#a5d0b9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#274e3d'
  secondary-fixed: '#ffdbd2'
  secondary-fixed-dim: '#ffb4a1'
  on-secondary-fixed: '#3c0800'
  on-secondary-fixed-variant: '#7c2e19'
  tertiary-fixed: '#e6e3d0'
  tertiary-fixed-dim: '#c9c7b5'
  on-tertiary-fixed: '#1c1c11'
  on-tertiary-fixed-variant: '#48473a'
  background: '#fbf8ff'
  on-background: '#161a32'
  surface-variant: '#dfe0ff'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  margin-mobile: 20px
  gutter-mobile: 12px
---

## Brand & Style

The design system is centered on demystifying economic concepts through a "Warm Minimalist" lens. The target audience includes students, young professionals, and curious learners who find traditional finance intimidating. The emotional response is one of calm confidence, growth, and intellectual accessibility.

By blending the clarity of Swiss minimalism with a soft, organic palette, this design system replaces corporate rigidity with a welcoming, editorial atmosphere. It prioritizes generous whitespace and a rhythmic vertical flow to reduce cognitive load during daily learning sessions.

## Colors

The palette intentionally avoids the standard "financial blue" to establish a unique market position rooted in organic growth and grounded education.

- **Primary (Forest Green):** Represents stability, wealth, and long-term growth. Used for key branding, primary actions, and success states.
- **Secondary (Terracotta):** Provides a warm, energetic counterpoint. Used for highlights, call-outs, and interactive elements that need a friendly "nudge."
- **Background (Cream/Off-white):** A soft `#F4F1DE` base that reduces eye strain compared to pure white, enhancing the editorial feel.
- **Neutral (Deep Slate):** Used for typography and iconography to maintain high legibility without the harshness of pure black.

## Typography

This design system utilizes **Hanken Grotesk** across all levels to maintain a cohesive, modern, and highly legible experience. 

- **Headlines:** Use a tighter letter-spacing and heavier weights to create a strong visual anchor for educational topics.
- **Body Text:** Designed with a generous line-height to ensure that dense economic explanations remain readable and inviting.
- **Labels:** Set in Medium or SemiBold weights with slight tracking to differentiate them from body copy at smaller scales.

## Layout & Spacing

The layout follows a fluid 4-column grid for mobile devices, emphasizing vertical rhythm and breathable margins.

- **Safe Zones:** A 20px outer margin ensures content doesn't feel cramped against the device edges.
- **Vertical Rhythm:** Components are spaced using 8px increments. Lessons and articles should use the `xl` (40px) spacing between major sections to prevent visual clutter.
- **Content Flow:** Text containers are capped at a comfortable reading width (approx. 65 characters) even if the screen is wider, centered to maintain the minimalist aesthetic.

## Elevation & Depth

This design system avoids heavy shadows in favor of **Tonal Layers** and **Soft Insets**. 

- **Surfaces:** Depth is communicated through subtle shifts in background color. Primary content lives on a white surface elevated against the off-white background.
- **Shadows:** When used, shadows are extremely soft and tinted with the primary forest green (e.g., 4% opacity, 12px blur) to create an "ambient lift" rather than a hard physical shadow.
- **Outlines:** Interactive elements like input fields and inactive cards use 1px solid borders in a lightened version of the neutral slate (#E2E2E2) to define boundaries without adding visual weight.

## Shapes

The shape language is consistently "Rounded" to evoke friendliness and safety. 

- **Standard Elements:** Buttons, cards, and input fields use a `0.5rem` (8px) radius.
- **Large Containers:** Educational modules or "Daily Insight" cards use `1rem` (16px) to appear more distinctive and tactile.
- **Icons:** Use a 2px stroke width with rounded caps and joins to match the softening of the UI borders.

## Components

- **Buttons:** Primary buttons are Forest Green with white text; secondary buttons use the Terracotta color to highlight "Learn More" or "Start Quiz" actions. All buttons have a subtle 4px bottom-offset shadow for a slightly tactile feel.
- **Chips/Tags:** Used for categorizing topics (e.g., "Macroeconomics," "Inflation"). These should have a light tint of the primary color and no border.
- **Progress Indicators:** Linear bars for lesson progress use the Forest Green for the fill and a pale version of the same hue for the track.
- **Cards:** The primary vehicle for daily lessons. Cards feature a white background, 16px corner radius, and 24px internal padding.
- **Input Fields:** Large, 56px height inputs with 8px corner radius. Focus states are indicated by a 2px Forest Green border.
- **Lists:** Clean, borderless list items with 16px vertical padding, separated by a 1px hairline divider that does not span the full width of the screen.