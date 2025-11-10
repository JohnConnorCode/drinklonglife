import type { StructureResolver } from 'sanity/structure';

// Desk structure configuration for Sanity Studio
// Organizes content with singletons at top, logical grouping, and clear hierarchy

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // === SINGLETONS (Settings & Config) ===
      S.listItem()
        .title('Site Settings')
        .icon(() => '⚙️')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
        ),

      S.listItem()
        .title('Navigation')
        .icon(() => '🧭')
        .child(
          S.document()
            .schemaType('navigation')
            .documentId('navigation')
        ),

      S.listItem()
        .title('Home Page')
        .icon(() => '🏠')
        .child(
          S.document()
            .schemaType('homePage')
            .documentId('homePage')
        ),

      S.divider(),

      // === PRODUCTS ===
      S.listItem()
        .title('Blends')
        .icon(() => '🍊')
        .child(
          S.documentList()
            .title('Blends')
            .filter('_type == "blend"')
            .defaultOrdering([{ field: 'order', direction: 'asc' }])
        ),

      S.listItem()
        .title('Size & Pricing')
        .icon(() => '💰')
        .child(
          S.documentList()
            .title('Size & Pricing')
            .filter('_type == "sizePrice"')
        ),

      S.divider(),

      // === INGREDIENTS & SOURCING ===
      S.listItem()
        .title('Ingredients')
        .icon(() => '🥕')
        .child(
          S.documentList()
            .title('Ingredients')
            .filter('_type == "ingredient"')
        ),

      S.listItem()
        .title('Farms')
        .icon(() => '🚜')
        .child(
          S.documentList()
            .title('Farms')
            .filter('_type == "farm"')
        ),

      S.listItem()
        .title('Sourcing Standards')
        .icon(() => '✓')
        .child(
          S.documentList()
            .title('Standards')
            .filter('_type == "standard"')
        ),

      S.divider(),

      // === PROCESS & EDUCATION ===
      S.listItem()
        .title('Process Steps')
        .icon(() => '⚡')
        .child(
          S.documentList()
            .title('Process Steps')
            .filter('_type == "processStep"')
            .defaultOrdering([{ field: 'order', direction: 'asc' }])
        ),

      S.divider(),

      // === CONTENT ===
      S.listItem()
        .title('Journal')
        .icon(() => '📝')
        .child(
          S.documentList()
            .title('Journal Posts')
            .filter('_type == "post"')
            .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
        ),

      S.listItem()
        .title('Pages')
        .icon(() => '📄')
        .child(
          S.documentList()
            .title('Pages')
            .filter('_type == "page"')
        ),

      S.listItem()
        .title('FAQ')
        .icon(() => '❓')
        .child(
          S.documentList()
            .title('FAQ')
            .filter('_type == "faq"')
        ),

      S.divider(),

      // === REUSABLE COMPONENTS ===
      S.listItem()
        .title('CTAs')
        .icon(() => '🔘')
        .child(
          S.documentList()
            .title('Call-to-Actions')
            .filter('_type == "cta"')
        ),
    ]);
