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
    "icon": icon ${imageFragment}
  },
  featuredBlendsHeading,
  featuredBlendsSubheading,
  "featuredBlends": featuredBlends[]->{
    _id,
    name,
    slug { current },
    tagline,
    image ${imageFragment},
    labelColor,
    functionList
  },
  featuredBlendsCtaText,
  featuredBlendsSizingText,
  featuredBlendsDeliveryText,
  statsHeading,
  testimonialsHeading,
  testimonialsSubheading,
  pricingHeading,
  "sizesPricing": sizesPricing[]->{
    _id,
    label,
    price,
    sku,
    isActive
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
    "icon": icon ${imageFragment}
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
  "sizes": sizes[]->{
    _id,
    label,
    price,
    sku,
    isActive
  },
  seo
}`;

export const postsQuery = groq`*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  slug { current },
  excerpt,
  "coverImage": coverImage ${imageFragment},
  publishedAt,
  author
}`;

export const postQuery = groq`*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  slug { current },
  content,
  "coverImage": coverImage ${imageFragment},
  publishedAt,
  author,
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
