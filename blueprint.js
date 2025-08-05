// blueprints.js
// Reusable component blueprints injected into prompts

export const sectionBlueprints = {
  HeroSection: {
    variants: ["centered", "withCTA", "splitImage"],
    contentHints: ["projectName", "headline", "subtext", "actionButtons"],
    styling: {
      background: "gradient",
      animation: true,
      darkMode: true,
      responsive: true
    }
  },
  FeaturesSection: {
    variants: ["cardsGrid", "iconsWithText", "animatedReveal"],
    contentHints: ["featureList", "icons", "titles", "descriptions"],
    styling: {
      layout: "3-column",
      motion: true,
      lightMode: true
    }
  },
  PricingSection: {
    variants: ["simpleTiers", "togglePlans", "highlightedTier"],
    contentHints: ["planName", "price", "benefits", "cta"],
    styling: {
      accentColor: "blue",
      comparisonLayout: true,
      responsive: true
    }
  },
  FAQSection: {
    variants: ["accordion", "twoColumn"],
    contentHints: ["question", "answer", "category"],
    styling: {
      spacing: "comfortable",
      accessible: true
    }
  },
  CTASection: {
    variants: ["fullWidth", "split", "minimal"],
    contentHints: ["headline", "ctaButton", "benefitHighlight"],
    styling: {
      contrast: "high",
      motion: false,
      align: "center"
    }
  }
};
