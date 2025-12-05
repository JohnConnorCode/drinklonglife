import { groq } from 'next-sanity';

const imageFragment = groq`{
  _key,
  asset->{
    _id,
    url,
    metadata {
      dimensions {
        height,
        width
      }
    }
  },
  hotspot,
  crop,
  alt,
  caption
}`;

const ctaFragment = groq`{
  _id,
  label,
  style,
  prefetch,
  "target": target {
    "type": type,
    "pageRef": pageRef->{
      _id,
      slug {
        current
      },
      title
    },
    "externalUrl": externalUrl,
    "newTab": newTab
  }
}`;

export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]{
  title,
  tagline,
  description,
  logo ${imageFragment},
  contactEmail,
  address,
  social,
  ogImage ${imageFragment},
  seo
}`;

export const navigationQuery = groq`*[_type == "navigation"][0]{
  primaryLinks[] {
    title,
    "reference": reference->{
      _id,
      slug { current },
      title
    },
    externalUrl,
    newTab
  },
  footerLinks[] {
    title,
    "reference": reference->{
      _id,
      slug { current },
      title
    },
    externalUrl
  },
  legalLinks[] {
    title,
    "reference": reference->{
      _id,
      slug { current },
      title
    }
  }
}`;

export const homePageQuery = groq`*[_type == "homePage"][0]{
  heroSlides[] {
    heading,
    subheading,
    ctaText,
    ctaLink,
    "desktopImage": desktopImage ${imageFragment},
    "mobileImage": mobileImage ${imageFragment}
  },
  "hero": hero {
    heading,
    subheading,
    "ctaPrimary": ctaPrimary-> ${ctaFragment},
    "ctaSecondary": ctaSecondary-> ${ctaFragment},
    "image": image ${imageFragment}
  },
  valueProps[] {
    title,
    body,
    "icon": icon ${imageFragment},
    "image": image ${imageFragment}
  },
  featuredBlendsHeading,
  featuredBlendsSubheading,
  featuredBlendsCtaText,
  featuredBlendsSizingText,
  featuredBlendsDeliveryText,
  statsHeading,
  testimonialsHeading,
  testimonialsSubheading,
  pricingHeading,
  "sizesPricing": sizesPricing[]->{
    _id,
    name,
    slug { current },
    volume,
    price,
    servingsPerBottle,
    description,
    stripePriceId
  },
  processHeading,
  processIntro,
  "processSteps": processSteps[]-> {
    _id,
    title,
    body,
    "image": image ${imageFragment},
    order
  } | order(order asc),
  sourcingHeading,
  sourcingIntro,
  "standards": standards[]->{
    _id,
    title,
    body,
    "icon": icon ${imageFragment},
    "image": image ${imageFragment}
  },
  newsletterHeading,
  newsletterSubheading,
  newsletterPlaceholder,
  newsletterButtonText,
  communityBlurb,
  communityHashtagText,
  "newsletterCta": newsletterCta-> ${ctaFragment},
  "socialProof": *[_type == "socialProof"][0]{
    stats,
    communityHashtag,
    "featuredTestimonials": featuredTestimonials[]->{
      _id,
      name,
      role,
      quote,
      "image": image ${imageFragment},
      "blend": blend->{
        _id,
        name,
        slug { current }
      },
      isFeatured,
      order
    } | order(order asc)
  }
}`;

export const blendsQuery = groq`*[_type == "blend"] | order(order asc) {
  _id,
  name,
  slug { current },
  tagline,
  image ${imageFragment},
  labelColor,
  functionList,
  isFeatured
}`;

export const blendQuery = groq`*[_type == "blend" && slug.current == $slug][0]{
  _id,
  name,
  slug { current },
  tagline,
  functionList,
  "ingredients": ingredients[]->{
    _id,
    name,
    type,
    seasonality,
    "farms": farms[]->{
      _id,
      name,
      location,
      website,
      contactEmail
    }
  },
  description,
  image ${imageFragment},
  labelColor,
  sizes,
  "stripeProduct": stripeProduct->{
    _id,
    title,
    stripeProductId,
    "variants": variants[]{
      sizeKey,
      label,
      stripePriceId,
      isDefault,
      uiOrder
    } | order(uiOrder asc)
  },
  seo
}`;

export const postsQuery = groq`*[_type == "post" && isPublished == true] | order(publishedAt desc) {
  _id,
  title,
  slug { current },
  excerpt,
  "coverImage": coverImage ${imageFragment},
  publishedAt,
  author,
  category
}`;

export const postQuery = groq`*[_type == "post" && slug.current == $slug && isPublished == true][0]{
  _id,
  title,
  slug { current },
  content,
  "coverImage": coverImage ${imageFragment},
  publishedAt,
  author,
  category,
  seo
}`;

export const faqQuery = groq`*[_type == "faq"] | order(isFeatured desc, order asc) {
  _id,
  question,
  answer,
  isFeatured
}`;

export const pagesQuery = groq`*[_type == "page"] {
  _id,
  title,
  slug { current }
}`;

export const pageQuery = groq`*[_type == "page" && slug.current == $slug][0]{
  _id,
  title,
  slug { current },
  "heroImage": heroImage ${imageFragment},
  intro,
  content,
  seo
}`;

export const ingredientQuery = groq`*[_type == "ingredient"] | order(name asc) {
  _id,
  name,
  type,
  seasonality,
  "farms": farms[]->{
    _id,
    name,
    location,
    website
  }
}`;

export const aboutPageQuery = groq`*[_type == "aboutPage"][0]{
  heroHeading,
  heroSubheading,
  introText,
  whyHeading,
  whyContent,
  howHeading,
  howContent,
  promiseHeading,
  promises[] {
    title,
    description
  },
  visionHeading,
  visionContent,
  teamHeading,
  "teamMembers": teamMembers[]->{
    _id,
    name,
    role,
    bio,
    "image": image ${imageFragment}
  },
  valuesHeading,
  values[] {
    emoji,
    title,
    description
  },
  ctaHeading,
  ctaText,
  disclaimer,
  seo
}`;

export const blendsPageQuery = groq`*[_type == "blendsPage"][0]{
  heading,
  subheading,
  seo
}`;

export const faqPageQuery = groq`*[_type == "faqPage"][0]{
  heading,
  subheading,
  "heroImage": heroImage {
    "url": asset->url,
    "alt": alt
  },
  seo
}`;

export const processPageQuery = groq`*[_type == "processPage"][0]{
  heroHeading,
  heroSubheading,
  "processSteps": processSteps[]->{
    _id,
    title,
    body,
    "image": image ${imageFragment},
    order
  } | order(order asc),
  whyHeading,
  whyCards[] {
    title,
    description
  },
  commitmentHeading,
  commitmentText,
  commitmentBadge,
  disclaimer,
  seo
}`;

export const ingredientsSourcingPageQuery = groq`*[_type == "ingredientsSourcingPage"][0]{
  heroHeading,
  heroSubheading,
  philosophyHeading,
  philosophyIntro,
  philosophyContent,
  standardsHeading,
  "standards": standards[]->{
    _id,
    title,
    body,
    "icon": icon ${imageFragment},
    "image": image ${imageFragment}
  },
  spotlightHeading,
  ingredientCategories[] {
    categoryName,
    color,
    hoverColor,
    ingredients
  },
  spotlightNote,
  farmHeading,
  farmText,
  farmFormNote,
  transparencyHeading,
  transparencyText,
  seo
}`;

export const subscriptionsPageQuery = groq`*[_type == "subscriptionsPage"][0]{
  heroHeading,
  heroTagline,
  heroText,
  howHeading,
  howSteps[] {
    stepNumber,
    title,
    description
  },
  perksHeading,
  perks[] {
    title,
    description
  },
  pricingHeading,
  plans[] {
    name,
    description,
    isPopular,
    priceItems[] {
      size,
      price
    },
    buttonText
  },
  pricingNote,
  ctaHeading,
  ctaText,
  seo
}`;

export const wholesalePageQuery = groq`*[_type == "wholesalePage"][0]{
  heroHeading,
  heroTagline,
  heroText,
  partnersHeading,
  partnerTypes[] {
    emoji,
    title,
    description
  },
  programsHeading,
  programs[] {
    title,
    description,
    options[] {
      name,
      description
    },
    note,
    noteColor
  },
  whyHeading,
  benefits[] {
    title,
    description
  },
  ctaHeading,
  ctaText,
  ctaNote,
  seo
}`;

export const stripeSettingsQuery = groq`*[_type == "stripeSettings"][0]{
  _id,
  mode,
  lastModified,
  modifiedBy
}`;

/**
 * Get active upsell offers for a specific page
 * @param page - The page to show offers on (e.g., 'thank_you', 'account', 'billing')
 */
export const upsellOffersQuery = groq`*[_type == "upsellOffer" && isActive == true && $page in showOnPages] | order(priority asc) {
  _id,
  title,
  shortDescription,
  offerType,
  stripePriceId,
  stripeProductId,
  discountPercentage,
  originalPrice,
  salePrice,
  "image": image {
    "url": asset->url,
    "alt": alt
  },
  ctaLabel,
  eligibleTiers,
  eligiblePlans,
  limitedTimeOffer,
  expiresAt
}`;

/**
 * Get the active referral reward with highest priority
 * Used for displaying referral program terms on landing pages
 */
export const activeReferralRewardQuery = groq`*[_type == "referralReward" && isActive == true] | order(priority asc)[0] {
  _id,
  title,
  slug,
  shortDescription,
  description,
  rewardType,
  stripeCouponId,
  discountPercentage,
  discountAmount,
  tierUpgrade,
  creditAmount,
  recipientType,
  triggerEvent,
  minimumPurchaseAmount,
  maxRedemptions,
  expirationDays,
  landingPageHeadline,
  "landingPageImage": landingPageImage ${imageFragment},
  priority
}`;

/**
 * Get all active referral rewards
 */
export const referralRewardsQuery = groq`*[_type == "referralReward" && isActive == true] | order(priority asc) {
  _id,
  title,
  slug,
  shortDescription,
  rewardType,
  discountPercentage,
  discountAmount,
  tierUpgrade,
  creditAmount,
  recipientType,
  triggerEvent,
  expirationDays,
  "landingPageImage": landingPageImage ${imageFragment}
}`;

/**
 * Get partnership perks, optionally filtered by tier
 */
export const partnershipPerksQuery = groq`*[_type == "partnershipPerk" && isActive == true] | order(featured desc, uiOrder asc) {
  _id,
  title,
  slug,
  description,
  shortDescription,
  requiredTier,
  category,
  icon,
  "image": image ${imageFragment},
  ctaLabel,
  ctaUrl,
  expiresAt,
  featured,
  uiOrder,
  discountCode,
  stripeCouponId
}`;
