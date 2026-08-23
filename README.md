# KASTUDIOPRODUCTION Portfolio Website

A responsive, modern portfolio site for KASTUDIOPRODUCTION, designed around the supplied orange, black and warm-cream brand identity.

## Included

- Prominent KA logo in the loader, navigation, hero and footer
- Real portfolio visuals cropped from the supplied Google Drive archive screenshots
- Editorial Apple/fashion-brand-inspired layout
- Responsive desktop, tablet and mobile design
- Scroll-reveal, hero parallax, animated project counter, moving service marquee and editing-timeline animation
- Filterable portfolio gallery and full-screen previews
- Working WhatsApp quotation form
- SEO and social-sharing metadata
- No paid plugins or external libraries

## Open locally

Double-click `START_WEBSITE.bat`, or open `index.html` directly.

## Add the Google Drive portfolio link

Open `site-config.js` and paste the public folder link:

```js
window.KASTUDIO_CONFIG = {
  whatsappNumber: "601125145629",
  googleDrivePortfolioUrl: "https://drive.google.com/drive/folders/YOUR_FOLDER_ID"
};
```

## Publish

Upload the entire `kastudio-portfolio` folder to Netlify, GitHub Pages, Cloudflare Pages, cPanel or any standard static hosting service. Keep the file structure unchanged so the logo and portfolio images load correctly.
