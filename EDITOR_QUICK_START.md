# Long Life - Editor Quick Start Guide

**Welcome to the Long Life Content Management System!**

This guide will teach you how to update your website content in 60 seconds or less.

---

## 🎯 Accessing the CMS

1. Go to: **https://longlife.com/studio**
2. Log in with your Sanity credentials
3. You'll see the content dashboard

---

## 📋 Dashboard Overview

The left sidebar shows all your content organized by type:

### **Settings** (Top Section)
- ⚙️ **Site Settings**: Logo, contact info, social links
- 🧭 **Navigation**: Header and footer menus
- 🏠 **Home Page**: Homepage content

### **Products**
- 🍊 **Blends**: Your juice products (Yellow/Red/Green Bomb)
- 💰 **Size & Pricing**: Pricing tiers

### **Content**
- 📝 **Journal**: Blog posts
- 📄 **Pages**: About, How We Make It, etc.
- ❓ **FAQ**: Frequently asked questions

---

## ⚡ 5 Most Common Tasks

### 1. Update Homepage Hero Text

**Time**: 30 seconds

1. Click **"Home Page"** in sidebar (top section)
2. Scroll to **"Hero"** section
3. Edit the **Headline** or **Subheadline**
4. Click **"Publish"** button (top right)
5. ✅ Changes go live in 60 seconds

**Example**:
```
Headline: "Peak performance, one bottle at a time."
Subheadline: "Cold-pressed superfood blends..."
```

---

### 2. Add a New Blend

**Time**: 5 minutes

1. Click **"Blends"** in sidebar
2. Click **"+ Create"** button (top)
3. Fill in required fields:

**Required Fields** (marked with *):
- **Blend Name**: E.g., "Purple Bomb"
- **Slug**: Click "Generate" from name
- **Label Color**: Choose yellow, red, or green
- **Ingredients**: Select at least 2
- **Blend Image**: Upload photo (min 1200x1200px)
  - **Alt Text**: Describe the image (e.g., "Purple Bomb bottle on white background")
- **Display Order**: Enter number (1, 2, 3...)

**Optional Fields**:
- **Tagline**: Short catchy phrase
- **Functions**: Add badges like "Energy", "Focus"
- **Description**: Rich text body (see formatting guide below)
- **Available Sizes**: Link to pricing documents

4. Click **"Publish"**
5. ✅ Blend appears on homepage and `/blends` page

---

### 3. Publish a Blog Post

**Time**: 10 minutes

1. Click **"Journal"** in sidebar
2. Click **"+ Create"**
3. Fill in:

**Required**:
- **Title**: Post headline
- **Slug**: Auto-generated from title
- **Published At**: Set date and time
- **Excerpt**: Short summary (2-3 sentences)

**Optional**:
- **Main Image**: Featured image (1600x900px recommended)
- **Body**: Full article content (use rich text editor)
- **Author**: Your name or "Long Life Team"
- **Categories**: Tags like "Production", "Sourcing"

4. Click **"Publish"**
5. ✅ Post appears on `/journal` page

---

### 4. Update FAQ

**Time**: 2 minutes

1. Click **"FAQ"** in sidebar
2. Click existing FAQ to edit, or **"+ Create"** for new
3. Fill in:
   - **Question**: Customer question
   - **Answer**: Your response

**Example**:
```
Question: "How should I store Long Life juice?"
Answer: "Keep frozen until ready to use. Once thawed, refrigerate..."
```

4. Click **"Publish"**
5. ✅ Shows on `/faq` page immediately

---

### 5. Change Navigation Links

**Time**: 3 minutes

1. Click **"Navigation"** in sidebar
2. Edit **Header Links** or **Footer Links**

**Header Links** (simple list):
- Text: Link label (e.g., "Blends")
- Href: URL path (e.g., "/blends")

**Footer Links** (grouped):
- Title: Section heading (e.g., "Shop")
- Links: Array of links under that section

3. Click **"Publish"**
4. ✅ Navigation updates site-wide

---

## ✍️ Using the Rich Text Editor

When editing **Description** or **Body** fields, you have formatting options:

### Text Formatting
- **Bold**: Select text → Click **B**
- *Italic*: Select text → Click *I*
- Headings: Click **H2** or **H3** (don't use H1)

### Adding Content
- **Paragraph**: Just start typing
- **Bullet List**: Click list icon, then type
- **Numbered List**: Click numbered list icon
- **Quote**: Select text → Click quote icon
- **Link**: Select text → Click link icon → Paste URL

### Adding Images
1. Click **+** button → **Image**
2. Upload or select from library
3. **Alt Text** (required): Describe the image
4. **Caption** (optional): Text shown below image

### Best Practices
- Keep paragraphs short (3-4 sentences)
- Use headings to break up content
- Always add alt text to images
- Link to related pages when relevant

---

## 🖼️ Image Guidelines

### Size Requirements

| Image Type | Dimensions | Max File Size |
|------------|------------|---------------|
| Blend photos | 1200x1200px (square) | 500 KB |
| Blog featured images | 1600x900px (16:9) | 500 KB |
| Logos | Any (SVG preferred) | 100 KB |

### Optimization Tips
- Use JPEG for photos
- Use PNG for graphics with transparency
- Compress before uploading: [TinyPNG.com](https://tinypng.com)
- Use descriptive file names: `yellow-bomb-bottle.jpg` (not `IMG_1234.jpg`)

### Alt Text
**Always required** for accessibility.

✅ **Good**: "Yellow Bomb juice bottle with turmeric and ginger on white background"
❌ **Bad**: "product photo"

---

## 🔍 Finding Specific Content

### Search Bar
- Click search icon (top) or press **Cmd+K** (Mac) / **Ctrl+K** (Windows)
- Type content name or keywords
- Select from results

### Filters
- Each content type has filters at the top
- Example: Filter blends by "Featured" or "Label Color"

---

## ✅ Publishing Workflow

### Content States
- **Draft**: Saved but not live (visible only in Studio)
- **Published**: Live on website

### How to Publish
1. Make your changes
2. Click **"Publish"** button (top right, green)
3. Content goes live in ~60 seconds

### How to Unpublish
1. Open published document
2. Click **"Unpublish"** in menu (three dots)
3. Content removed from live site immediately

### Viewing History
1. Open any document
2. Click **"Changes"** tab (top)
3. See all edits with timestamps
4. Click any version to restore

---

## 🚨 Common Issues & Solutions

### "This field is required" Error
- Red outline means you missed a required field
- Scroll through form to find all red fields
- Fill them in before publishing

### Image Won't Upload
- Check file size (<500 KB for most images)
- Use supported formats: JPG, PNG, SVG, GIF
- Ensure file name has no special characters

### Changes Not Showing on Website
- Wait 60 seconds after publishing
- Hard refresh browser: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows)
- Check that you clicked "Publish" (not just "Save")

### Can't Find a Document
- Use search bar (Cmd+K / Ctrl+K)
- Check correct content type in sidebar
- Ask if document was deleted

---

## 🎓 Advanced Features

### Duplicate Content
1. Open existing document
2. Click menu (three dots, top right)
3. Select **"Duplicate"**
4. Edit the copy and publish

### Scheduling Content
1. Create your post
2. Set **"Published At"** to future date
3. Click **"Publish"**
4. Post will go live automatically at that time

### Preview Before Publishing
1. Make changes (don't publish yet)
2. Click **"Open preview"** (eye icon, top right)
3. See how it looks live
4. Return to Studio to edit or publish

---

## 📞 Need Help?

### Quick Reference
- **Undo**: Cmd+Z (Mac) / Ctrl+Z (Windows)
- **Redo**: Cmd+Shift+Z / Ctrl+Shift+Z
- **Save Draft**: Cmd+S / Ctrl+S
- **Search**: Cmd+K / Ctrl+K

### Getting Support
1. **First**: Check this guide
2. **Next**: Ask your website administrator
3. **Last resort**: Contact Sanity support at [help.sanity.io](https://help.sanity.io)

### Training Videos
- Sanity Basics: https://www.sanity.io/docs/getting-started
- Rich Text Editor: https://www.sanity.io/docs/block-content

---

## ✨ Pro Tips

1. **Save often**: Changes auto-save as drafts, but use Cmd+S to be safe
2. **Use hotspot**: When uploading images, drag the hotspot circle to focus area
3. **Copy from Word**: Paste into rich text editor, then clean up formatting
4. **Bulk edits**: Edit one blend, then duplicate it to create similar blends faster
5. **Preview on mobile**: After publishing, check your phone to see how it looks

---

**Need a 60-Second Refresher?**

1. Go to `/studio`
2. Click content type in sidebar
3. Edit your content
4. Click "Publish"
5. Wait 60 seconds
6. Done! ✅

---

**Last Updated**: Nov 2024
**Questions?** Contact: [your-email@longlife.com]
