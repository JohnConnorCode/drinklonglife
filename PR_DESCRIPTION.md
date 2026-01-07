# Add premium end-to-end website copy for Long Life

## Summary

This PR adds complete, premium website copy for Long Life—grounded, movement-oriented messaging that converts on day one and scales from Indiana kitchen to global brand.

## What's New

### New Pages
- **`/about`** - Brand story with "Return to nature in a world of machines" positioning
- **`/subscriptions`** - Weekly/bi-weekly plans with member perks
- **`/wholesale`** - B2B programs for cafés, gyms, offices, and events
- **`/how-we-make-it`** - 4-step cold-press process transparency
- **`/ingredients-sourcing`** - Sourcing standards and farm partner application

### Updated Pages
- **`/` (home)** - Enhanced hero copy, featured blends section, improved CTAs
- **Footer** - New tagline "Real juice. Real people." and location

### Documentation
- **`CONTENT_GUIDE.md`** - Complete guide for populating Sanity CMS with all copy

---

## 🎯 Next Steps to Go Live

### 1. Populate Sanity CMS

**Navigate to Sanity Studio:** `http://localhost:3000/studio` (or your deployed studio URL)

#### Site Settings
```
Title: Long Life
Tagline: Real juice. Real people.
Contact Email: hello@longlife.com
Address: Indiana, USA
Social:
  - Instagram: @DrinkLongLife
```

#### Navigation → Primary Links
Add these navigation items in order:
- Home → `/`
- Our Blends → `/blends`
- How We Make It → `/how-we-make-it`
- Ingredients & Sourcing → `/ingredients-sourcing`
- Subscriptions → `/subscriptions`
- Wholesale → `/wholesale`
- Journal → `/journal`
- FAQ → `/faq`

#### Home Page
**Hero Section:**
```
Heading: Small-batch juice for real humans.
Subheading: Cold-pressed, ingredient-dense, made weekly in Indiana.
Primary CTA: Shop Weekly Batches → /blends
Secondary CTA: Join the List → #newsletter
[Upload hero image]
```

**Value Propositions (3 cards):**
1. **Nothing fake** - Only whole fruits, roots, and greens. No concentrates. No fillers.
2. **Pressed for power** - Cold-pressed to preserve flavor and nutrients.
3. **Small-batch integrity** - Made in limited runs. First come, first served.

**Community Blurb:**
```
We grow by word of mouth. Taste it. Share it. Bring a friend to pickup day.
```

#### Create Blends
Create these three featured blends:

**🟡 Yellow Bomb - Dopamine Surge**
```
Name: Yellow Bomb
Slug: yellow-bomb
Tagline: "Wake the system. Feel the rush."
Label Color: Yellow
Functions: energy, focus, mood elevation
Ingredients: Guava, Orange, Ginger, Mango, Spinach, Pineapple, Papaya, Cucumber
Description: Bright tropicals and clean greens built for mornings and momentum.
Featured: ✓ Yes
Display Order: 1
SEO Title: Yellow Bomb - Energy & Focus Juice | Long Life
SEO Description: Cold-pressed tropical juice blend for natural energy, focus, and mood elevation. Made with guava, orange, ginger, and more.
```

**🔴 Red Bomb - Reset Formula**
```
Name: Red Bomb
Slug: red-bomb
Tagline: "Rebuild from the inside out."
Label Color: Red
Functions: circulation, detox, cellular recovery
Ingredients: Beet, Carrot, Strawberry, Papaya, Red Cabbage, Red Apple, Raspberry
Description: Earthy roots with red fruit lift. The go-to after tough weeks. Red Bomb supports circulation and cellular recovery.
Featured: ✓ Yes
Display Order: 2
SEO Title: Red Bomb - Detox & Recovery Juice | Long Life
SEO Description: Cold-pressed beet and berry juice for circulation, detox, and cellular recovery. A powerful reset formula.
```

**🟢 Green Bomb - The Clarity Formula**
```
Name: Green Bomb
Slug: green-bomb
Tagline: "Find your edge. Stay in flow."
Label Color: Green
Functions: hydration, gut balance, mental clarity
Ingredients: Spinach, Celery, Green Apple, Romaine, Pineapple, Pear, Mint, Parsley
Description: Crisp and cooling. A daily baseline for body and brain. Green Bomb combines hydrating greens with natural sweetness.
Featured: ✓ Yes
Display Order: 3
SEO Title: Green Bomb - Hydration & Clarity Juice | Long Life
SEO Description: Cold-pressed green juice for hydration, gut balance, and mental clarity. Your daily baseline blend.
```

#### Create Ingredients
Add all ingredients used in blends (create individual entries for each):

**Fruits:**
- Guava
- Orange
- Mango
- Pineapple
- Papaya
- Strawberry
- Raspberry
- Red Apple
- Green Apple
- Pear

**Vegetables & Greens:**
- Spinach
- Cucumber
- Beet
- Carrot
- Red Cabbage
- Celery
- Romaine

**Herbs & Roots:**
- Ginger
- Mint
- Parsley

#### Create Sizes & Pricing
```
1-Gallon: $50 (SKU: LLG-1GAL)
½-Gallon: $35 (SKU: LLG-HALF)
Shot: $5 (SKU: LLG-SHOT)
All Active: ✓
```

#### Process Steps
Create 4 process step entries:

1. **Cold-pressed**
```
Title: Cold-pressed
Body: Hydraulic pressure extracts juice without high heat. That helps keep flavors bright and preserves what nature put there.

Unlike centrifugal juicers that generate heat and oxidation, cold-pressing applies thousands of pounds of gentle pressure to extract maximum juice while maintaining nutrient integrity and enzyme activity.
[Upload process image]
```

2. **Immediate chill**
```
Title: Immediate chill
Body: We press, chill, and bottle the same day for maximum freshness.

Once pressed, juice is immediately chilled to slow natural degradation. From produce to bottle happens in hours, not days. This is small-batch integrity—we make what we can handle fresh, then start the next batch.
[Upload bottling image]
```

3. **Simple filters**
```
Title: Simple filters
Body: Just enough filtering to keep texture smooth while leaving character in the bottle.

We don't strip juice down to water. A little pulp, a little texture—that's real juice. We use minimal filtration to remove large particles while keeping beneficial plant fibers and natural characteristics intact.
[Upload texture image]
```

4. **No shortcuts**
```
Title: No shortcuts
Body: No added sugar. No artificial anything.

What you see on the ingredient list is what went into the press. No concentrates. No "natural flavors" (which aren't always natural). No preservatives beyond cold storage. If an ingredient doesn't meet our standard, we pause the batch or find a better source.
[Upload quality control image]
```

**Process Intro:**
```
We make fresh, functional blends with integrity and transparency.
```

#### Quality Standards
Create 4 standard entries:

1. **Prioritize organic and spray-free inputs**
```
Title: Prioritize organic and spray-free inputs
Body: We prefer certified organic. When that's not available or cost-prohibitive, we work with farms that use equivalent practices—no synthetic pesticides, no harmful sprays. If we can't verify clean inputs, we don't buy.
```

2. **Verify farm practices and harvest windows**
```
Title: Verify farm practices and harvest windows
Body: We visit farms when possible. We ask about soil health, pest management, and harvest timing. Peak ripeness matters—underripe or overripe produce doesn't taste right and doesn't deliver the nutrients we're after.
```

3. **Track lot codes for every batch**
```
Title: Track lot codes for every batch
Body: Every ingredient is logged with supplier info and lot number. If there's ever a quality issue, we can trace it back. This is basic food safety and accountability that many brands skip.
```

4. **Batch-date every bottle**
```
Title: Batch-date every bottle
Body: You'll see a date on every bottle showing when it was pressed. Fresh juice degrades over time. We don't hide behind long shelf life—we tell you when it was made so you can drink it at peak quality.
```

**Sourcing Intro:**
```
We source from trusted growers who share our standards. Seasonal rotation is part of the craft.
```

#### FAQs
Add these 5 FAQ entries:

1. **Where are you based?**
```
Question: Where are you based?
Answer: We craft in a small city in Indiana and serve the region first while we build capacity.
```

2. **How long does it last?**
```
Question: How long does it last?
Answer: For best taste, drink within 3–5 days of pickup. Keep it cold.
```

3. **Is it organic?**
```
Question: Is it organic?
Answer: We prioritize certified organic and equivalent practices. If a seasonal ingredient does not meet our standard, we substitute or pause.
```

4. **Can I customize?**
```
Question: Can I customize?
Answer: Yes. For subscriptions and wholesale, we can tailor mixes and sizes.
```

5. **Do you pasteurize?**
```
Question: Do you pasteurize?
Answer: No high heat. We rely on clean sourcing, cold-press, rapid chill, and strict handling.
```

---

### 2. Add Images

Upload high-quality images for:

**Home Page:**
- Hero image (juice bottles or fresh ingredients being pressed)
- Value prop icons (optional)
- Featured blend images (3 product shots)

**Process Steps:**
- Cold-press machine in action
- Bottling/chilling process
- Filtration setup
- Quality control/ingredient inspection

**Ingredients:**
- Individual produce photos for each ingredient
- Farm/sourcing imagery

**About Page:**
- Team photos
- Kitchen/production space
- Process behind-the-scenes

**Blends:**
- High-res product shots for Yellow, Red, Green Bomb
- Ingredient composition shots

---

### 3. Test Navigation & Links

After populating Sanity, verify these routes work:
- `/` - Home page
- `/about` - About/Story page
- `/blends` - All blends listing
- `/blends/yellow-bomb` - Yellow Bomb detail
- `/blends/red-bomb` - Red Bomb detail
- `/blends/green-bomb` - Green Bomb detail
- `/subscriptions` - Subscriptions page
- `/wholesale` - Wholesale page
- `/how-we-make-it` - Process page
- `/ingredients-sourcing` - Sourcing page
- `/journal` - Journal/blog listing
- `/faq` - FAQ page

---

### 4. Deploy Checklist

- [ ] Sanity CMS populated with all content above
- [ ] All navigation links configured in Sanity
- [ ] Featured blends appear on home page
- [ ] All images uploaded and displaying correctly
- [ ] Email capture form functionality added
- [ ] Mobile responsive verified on all new pages
- [ ] SEO metadata set for all pages
- [ ] Social links working in footer
- [ ] Test all CTAs and internal links
- [ ] Verify batch dating appears on blend pages
- [ ] Test forms (newsletter, wholesale, farm partner)

---

## 📖 Reference

See **`CONTENT_GUIDE.md`** for complete copy details, including:
- Full text for all sections
- Alternative copy options
- Journal post ideas
- Email newsletter templates
- Responsible language guidelines
- Positioning notes from industry research

---

## Design Philosophy

**Grounded Premium:**
- No hype, no medical claims
- "Real juice for real humans"
- Movement-oriented without being preachy

**Transparency First:**
- Batch-dating and lot tracking
- Farm practices and sourcing details
- Honest about process and limitations

**Community Growth:**
- Word-of-mouth emphasis
- Local-to-global narrative
- #DrinkLongLife community building

**Conversion Optimized:**
- Clear CTAs throughout
- Value props front and center
- Multiple entry points (subscriptions, wholesale, retail)

---

## Technical Notes

- All new pages use the existing component library
- Fully responsive layouts
- SEO-optimized metadata structure
- Newsletter form ready for email provider integration
- Wholesale/farm partner forms ready for backend hookup

---

## Copy Influences

This copy draws from best practices of leading cold-pressed juice brands:
- **Pressed** - Clarity and accessibility
- **Evolution Fresh** - Cold-press method emphasis
- **BluePrint/Suja** - Organic standards and purpose
- **Pulp & Press** - Community-first growth model

All adapted for Long Life's unique positioning as a small-batch, local-first, transparency-driven brand.
