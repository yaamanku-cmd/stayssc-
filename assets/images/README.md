# STAYSCAPE — Image Assets & Photography Credits

This directory contains local photographic assets used throughout the STAYSCAPE hotel booking demonstration.

## Included High-Resolution Assets

The local photography assets included in this directory were sourced from Unsplash photographers under the [Unsplash License](https://unsplash.com/license):

1. **`fernando-alvarez-rodriguez-M7GddPqJowg-unsplash.jpg`**
   - **Photographer:** Fernando Alvarez Rodriguez ([Unsplash Profile](https://unsplash.com/@fernando_alvarez))
   - **Subject:** Luxury resort pool, palm architecture, and sunset reflection.
   - **Usage:** Hero banner, The Azure Bay Resort & Spa (Goa).

2. **`linus-mimietz-p3UWyaujtQo-unsplash.jpg`**
   - **Photographer:** Linus Mimietz ([Unsplash Profile](https://unsplash.com/@linusmimietz))
   - **Subject:** Minimalist luxury concrete villa and modern architecture.
   - **Usage:** The Regent Sky Residences (Noida) / Casa Del Sol Villa.

3. **`toni-osmundson-XHBCqZGZre0-unsplash.jpg`**
   - **Photographer:** Toni Osmundson ([Unsplash Profile](https://unsplash.com/@toniosmundson))
   - **Subject:** Alpine mountain lodge amidst pine forests and snowy peaks.
   - **Usage:** Cedar Ridge Alpine Lodge (Manali).

4. **`vojtech-bruzek-Yrxr3bsPdS0-unsplash.jpg`**
   - **Photographer:** Vojtech Bruzek ([Unsplash Profile](https://unsplash.com/@vojtechbruzek))
   - **Subject:** Opulent interior hotel suite with luxury bed, warm lighting, and editorial furniture.
   - **Usage:** The Marine Grand Suites (Mumbai) / Room interiors.

## How Images Are Loaded in STAYSCAPE

1. **Centralized Asset Registry:** All image URLs and local paths are defined in `assets/js/data.js`.
2. **Offline-Resilient Fallbacks:** Every `<img>` tag in the system implements an `onerror` handler that seamlessly falls back to a locally generated SVG graphic placeholder to prevent broken images and layout shifts if external CDNs are unavailable.
3. **Adding Your Own Local Photos:**
   - Drop your JPEG/PNG/WebP image files into this `assets/images/` folder.
   - Update the corresponding `image` or `gallery` path in `assets/js/data.js` to point to `assets/images/your-image-filename.jpg`.
