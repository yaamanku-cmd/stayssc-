/**
 * STAYSCAPE — Hotel Details Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  renderHeader('search');
  renderFooter();

  const container = document.getElementById('hotel-details-container');
  const breadcrumbName = document.getElementById('breadcrumb-hotel-name');

  // Parse Query Parameters
  const urlParams = new URLSearchParams(window.location.search);
  const hotelId = urlParams.get('id');
  const checkInParam = urlParams.get('checkin') || getTodayDateString(2);
  const checkOutParam = urlParams.get('checkout') || getTodayDateString(5);
  const guestsParam = parseInt(urlParams.get('guests'), 10) || 2;

  const hotel = getHotelById(hotelId);

  // If Hotel Not Found
  if (!hotel) {
    if (breadcrumbName) breadcrumbName.textContent = 'Property Not Found';
    container.innerHTML = `
      <div class="empty-state" style="margin: var(--space-3xl) auto;">
        <div class="empty-state-icon">
          <i data-lucide="hotel" style="width: 32px; height: 32px; color: var(--error);"></i>
        </div>
        <h2>Stay Not Found</h2>
        <p>We could not find the hotel you were looking for. It may have been removed or the link is invalid.</p>
        <a href="search.html" class="btn btn-primary">Browse All Stays</a>
      </div>
    `;
    initIcons();
    return;
  }

  // Update Page Title and Breadcrumb
  document.title = `${hotel.name} — STAYSCAPE`;
  if (breadcrumbName) breadcrumbName.textContent = hotel.name;

  const isFav = isFavourite(hotel.id);
  const galleryImages = hotel.gallery && hotel.gallery.length > 0 ? hotel.gallery : [hotel.image];

  // Helper to get Lucide icon for amenity
  function getAmenityIcon(amenity) {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return 'wifi';
    if (lower.includes('pool')) return 'waves';
    if (lower.includes('spa') || lower.includes('bath')) return 'sparkles';
    if (lower.includes('ocean') || lower.includes('sea') || lower.includes('beach')) return 'sunset';
    if (lower.includes('breakfast') || lower.includes('dining') || lower.includes('restaurant')) return 'utensils';
    if (lower.includes('bar') || lower.includes('cocktail')) return 'glass-water';
    if (lower.includes('parking') || lower.includes('valet')) return 'car';
    if (lower.includes('fitness') || lower.includes('gym')) return 'activity';
    if (lower.includes('pet')) return 'heart';
    if (lower.includes('fire') || lower.includes('stove')) return 'flame';
    if (lower.includes('mountain') || lower.includes('glacier')) return 'mountain';
    if (lower.includes('lake') || lower.includes('boat')) return 'ship';
    if (lower.includes('concierge') || lower.includes('butler')) return 'bell';
    return 'check-circle';
  }

  // Render Page Content
  container.innerHTML = `
    <!-- Hotel Header Section -->
    <div class="hotel-header-meta">
      <div class="hotel-title-area">
        <h1>${escapeHTML(hotel.name)}</h1>
        <div class="hotel-submeta">
          <div class="rating-badge">
            <i data-lucide="star" style="width: 13px; height: 13px; fill: var(--sage-dark);"></i>
            <span>${hotel.rating}</span>
            <span class="review-count-text">(${hotel.reviewCount} verified guest reviews)</span>
          </div>
          <span>&bull;</span>
          <span style="color: #F39C12;">${'★'.repeat(hotel.stars || 5)} ${hotel.stars}-Star Luxury</span>
          <span>&bull;</span>
          <div style="display: inline-flex; align-items: center; gap: 4px;">
            <i data-lucide="map-pin" style="width: 14px; height: 14px; color: var(--copper);"></i>
            <span>${escapeHTML(hotel.location)}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; gap: var(--space-sm);">
        <button 
          type="button" 
          class="btn btn-secondary btn-sm ${isFav ? 'is-favourited' : ''}" 
          id="details-fav-btn"
          aria-pressed="${isFav ? 'true' : 'false'}"
        >
          <i data-lucide="${isFav ? 'heart-crack' : 'heart'}" style="width: 16px; height: 16px; color: ${isFav ? '#E74C3C' : 'inherit'};"></i>
          <span id="details-fav-text">${isFav ? 'Saved in Favourites' : 'Save to Favourites'}</span>
        </button>

        <button type="button" class="btn btn-secondary btn-sm" id="details-share-btn">
          <i data-lucide="share-2" style="width: 16px; height: 16px;"></i>
          <span>Share</span>
        </button>
      </div>
    </div>

    <!-- Gallery Section -->
    <div class="gallery-container">
      <!-- Main Active Image -->
      <div class="gallery-main-view">
        <img 
          src="${escapeHTML(galleryImages[0])}" 
          alt="${escapeHTML(hotel.name)} Main View" 
          id="active-gallery-image" 
          class="gallery-main-img" 
          onerror="this.src=FALLBACK_IMAGE"
        >
      </div>

      <!-- Thumbnail Column -->
      <div class="gallery-thumbnails-col">
        ${galleryImages.slice(0, 3).map((imgUrl, idx) => `
          <div class="gallery-thumb-box ${idx === 0 ? 'active' : ''}" data-thumb-idx="${idx}" role="button" aria-label="View photo ${idx + 1}">
            <img src="${escapeHTML(imgUrl)}" alt="${escapeHTML(hotel.name)} photo ${idx + 1}" class="gallery-thumb-img" onerror="this.src=FALLBACK_IMAGE">
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Two-Column Layout -->
    <div class="details-layout">
      
      <!-- Left Column: Story, Amenities, Room Details & House Rules -->
      <div class="details-left-col">
        
        <!-- Overview & Description -->
        <div class="details-section-card">
          <h2>
            <i data-lucide="book-open" style="width: 20px; height: 20px; color: var(--copper);"></i>
            <span>About The Property</span>
          </h2>
          <p style="font-size: 1.05rem; line-height: 1.7; color: var(--charcoal-dark); margin-bottom: var(--space-md);">
            ${escapeHTML(hotel.description)}
          </p>
          <div style="background-color: var(--sand-light); border-radius: var(--radius-sm); padding: var(--space-md); display: flex; gap: var(--space-md); align-items: center;">
            <i data-lucide="shield-check" style="width: 24px; height: 24px; color: var(--sage); flex-shrink: 0;"></i>
            <span style="font-size: 0.88rem; color: var(--charcoal-dark);">
              <strong>STAYSCAPE Heritage Guarantee:</strong> Verified high sanitation standards, organic botanical toiletries, and signature welcome rituals.
            </span>
          </div>
        </div>

        <!-- Featured Amenities with Icons -->
        <div class="details-section-card">
          <h2>
            <i data-lucide="check-circle" style="width: 20px; height: 20px; color: var(--copper);"></i>
            <span>Property Amenities & Services</span>
          </h2>
          <div class="amenities-icons-grid">
            ${(hotel.amenities || []).map(amenity => `
              <div class="amenity-icon-item">
                <div class="amenity-icon-bullet">
                  <i data-lucide="${getAmenityIcon(amenity)}" style="width: 16px; height: 16px;"></i>
                </div>
                <span>${escapeHTML(amenity)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Room Information -->
        <div class="details-section-card">
          <h2>
            <i data-lucide="bed-double" style="width: 20px; height: 20px; color: var(--copper);"></i>
            <span>Accommodations & Specifications</span>
          </h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-md);">
            <div style="background-color: var(--ivory); padding: var(--space-md); border-radius: var(--radius-sm); border: 1px solid var(--sand);">
              <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--charcoal); font-weight: 700;">Room Category</span>
              <p style="font-weight: 600; color: var(--navy); margin-top: 4px;">${escapeHTML(hotel.roomType)}</p>
            </div>
            <div style="background-color: var(--ivory); padding: var(--space-md); border-radius: var(--radius-sm); border: 1px solid var(--sand);">
              <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--charcoal); font-weight: 700;">Max Occupancy</span>
              <p style="font-weight: 600; color: var(--navy); margin-top: 4px;">Up to ${hotel.capacity} Guests</p>
            </div>
            <div style="background-color: var(--ivory); padding: var(--space-md); border-radius: var(--radius-sm); border: 1px solid var(--sand);">
              <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--charcoal); font-weight: 700;">Check-in / Out</span>
              <p style="font-weight: 600; color: var(--navy); margin-top: 4px;">${escapeHTML(hotel.checkIn)} / ${escapeHTML(hotel.checkOut)}</p>
            </div>
          </div>
        </div>

        <!-- House Rules -->
        <div class="details-section-card">
          <h2>
            <i data-lucide="clipboard-list" style="width: 20px; height: 20px; color: var(--copper);"></i>
            <span>House Policies & Guidelines</span>
          </h2>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; color: var(--charcoal-dark); font-size: 0.95rem;">
            ${(hotel.houseRules || []).map(rule => `
              <li style="display: flex; align-items: flex-start; gap: 10px;">
                <i data-lucide="check" style="width: 16px; height: 16px; color: var(--sage); flex-shrink: 0; margin-top: 4px;"></i>
                <span>${escapeHTML(rule)}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- Sample Guest Reviews Section -->
        <div class="details-section-card">
          <h2>
            <i data-lucide="message-square" style="width: 20px; height: 20px; color: var(--copper);"></i>
            <span>Guest Highlights (Sample Reviews)</span>
          </h2>
          <div style="display: flex; flex-direction: column; gap: var(--space-md);">
            <div style="border-left: 3px solid var(--copper); padding-left: var(--space-md);">
              <div style="font-weight: 600; color: var(--navy); font-size: 0.95rem;">&ldquo;Unparalleled hospitality & tranquility&rdquo;</div>
              <p style="font-size: 0.88rem; color: var(--charcoal); margin: 4px 0;">The architecture and private service surpassed all expectations. A truly memorable experience from start to finish.</p>
              <div style="font-size: 0.78rem; color: var(--charcoal-light);">&mdash; Siddharth M. &bull; Stayed 3 nights</div>
            </div>
            <div style="border-left: 3px solid var(--copper); padding-left: var(--space-md);">
              <div style="font-weight: 600; color: var(--navy); font-size: 0.95rem;">&ldquo;Breathtaking scenery and immaculate suites&rdquo;</div>
              <p style="font-size: 0.88rem; color: var(--charcoal); margin: 4px 0;">Every detail was taken care of. The gourmet breakfast and quiet evening ambience made this retreat unforgettable.</p>
              <div style="font-size: 0.78rem; color: var(--charcoal-light);">&mdash; Ananya R. &bull; Stayed 2 nights</div>
            </div>
          </div>
        </div>

      </div>

      <!-- Right Column: Sticky Live Price Calculator Card -->
      <div class="details-booking-card-wrapper">
        <div class="booking-calculator-card">
          
          <div class="booking-card-price-header">
            <div>
              <span class="price-sub">Tariff</span>
              <div class="price-amount" style="font-size: 1.8rem;">
                ${formatCurrency(hotel.pricePerNight)}
                <span class="price-night">/ night</span>
              </div>
            </div>
            <div class="rating-badge">
              <i data-lucide="star" style="width: 12px; height: 12px; fill: var(--sage-dark);"></i>
              <span>${hotel.rating}</span>
            </div>
          </div>

          <!-- Live Calculator Form -->
          <form id="details-booking-form">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm); margin-bottom: var(--space-sm);">
              <!-- Check-In -->
              <div class="form-group" style="margin-bottom: 0;">
                <label for="detail-checkin" class="form-label" style="font-size: 0.75rem;">Check-In</label>
                <input type="date" id="detail-checkin" class="form-input" style="padding: 8px 10px; font-size: 0.88rem;" required>
              </div>

              <!-- Check-Out -->
              <div class="form-group" style="margin-bottom: 0;">
                <label for="detail-checkout" class="form-label" style="font-size: 0.75rem;">Check-Out</label>
                <input type="date" id="detail-checkout" class="form-input" style="padding: 8px 10px; font-size: 0.88rem;" required>
              </div>
            </div>

            <!-- Guests -->
            <div class="form-group">
              <label for="detail-guests" class="form-label" style="font-size: 0.75rem;">Guests (Max ${hotel.capacity})</label>
              <select id="detail-guests" class="form-select" style="padding: 8px 10px; font-size: 0.88rem;">
                ${Array.from({ length: hotel.capacity }, (_, i) => i + 1).map(n => `
                  <option value="${n}" ${n === guestsParam ? 'selected' : ''}>${n} ${n === 1 ? 'Guest' : 'Guests'}</option>
                `).join('')}
              </select>
            </div>

            <!-- Live Calculation Breakdown -->
            <div class="live-calc-breakdown">
              <div class="calc-row">
                <span id="calc-nights-label">${formatCurrency(hotel.pricePerNight)} &times; 3 nights</span>
                <span id="calc-subtotal" style="font-weight: 600;">₹49,500</span>
              </div>
              <div class="calc-row">
                <span style="font-size: 0.82rem; color: var(--charcoal);">Taxes &amp; Service Fee</span>
                <span style="font-size: 0.82rem; color: var(--sage); font-weight: 600;">Included (Demo GST)</span>
              </div>
              <div class="calc-row total-row">
                <span>Estimated Total</span>
                <span id="calc-total-display" class="font-serif" style="color: var(--copper); font-size: 1.35rem;">₹49,500</span>
              </div>
            </div>

            <!-- Submit CTA -->
            <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: var(--space-sm);">
              <i data-lucide="calendar-check" style="width: 18px; height: 18px;"></i>
              <span>Proceed to Reservation</span>
            </button>

            <!-- Pricing Guarantee Note -->
            <p style="font-size: 0.75rem; color: var(--charcoal); text-align: center; margin-top: var(--space-sm); line-height: 1.4;">
              ✨ Best Tariff Guarantee &bull; Instant Confirmation &bull; Zero Booking Fees
            </p>
          </form>

        </div>
      </div>

    </div>
  `;

  // Initialize Elements & Calculation Logic
  const checkInInput = document.getElementById('detail-checkin');
  const checkOutInput = document.getElementById('detail-checkout');
  const guestsSelect = document.getElementById('detail-guests');
  const bookingForm = document.getElementById('details-booking-form');

  const nightsLabel = document.getElementById('calc-nights-label');
  const subtotalDisplay = document.getElementById('calc-subtotal');
  const totalDisplay = document.getElementById('calc-total-display');

  checkInInput.min = getTodayDateString();
  checkInInput.value = checkInParam;
  checkOutInput.min = getTodayDateString(1);
  checkOutInput.value = checkOutParam;

  function recalculate() {
    const nights = calculateNights(checkInInput.value, checkOutInput.value);
    const validNights = nights > 0 ? nights : 1;
    const total = hotel.pricePerNight * validNights;

    nightsLabel.textContent = `${formatCurrency(hotel.pricePerNight)} × ${validNights} ${validNights === 1 ? 'night' : 'nights'}`;
    subtotalDisplay.textContent = formatCurrency(total);
    totalDisplay.textContent = formatCurrency(total);
  }

  checkInInput.addEventListener('change', () => {
    if (checkInInput.value) {
      const parts = checkInInput.value.split('-').map(Number);
      const nextDay = new Date(parts[0], parts[1] - 1, parts[2] + 1);
      const nextDayStr = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
      checkOutInput.min = nextDayStr;
      if (checkOutInput.value <= checkInInput.value) {
        checkOutInput.value = nextDayStr;
      }
    }
    recalculate();
  });

  checkOutInput.addEventListener('change', recalculate);
  guestsSelect.addEventListener('change', recalculate);

  // Gallery Thumbnail Click Handling
  const mainImg = document.getElementById('active-gallery-image');
  const thumbBoxes = document.querySelectorAll('.gallery-thumb-box');

  thumbBoxes.forEach(box => {
    box.addEventListener('click', () => {
      const idx = parseInt(box.getAttribute('data-thumb-idx'), 10);
      if (galleryImages[idx]) {
        mainImg.style.opacity = '0.4';
        setTimeout(() => {
          mainImg.src = galleryImages[idx];
          mainImg.style.opacity = '1';
        }, 150);
        thumbBoxes.forEach(b => b.classList.remove('active'));
        box.classList.add('active');
      }
    });
  });

  // Action Buttons
  const favBtn = document.getElementById('details-fav-btn');
  const favText = document.getElementById('details-fav-text');
  favBtn.addEventListener('click', () => {
    const isNowFav = toggleFavourite(hotel.id);
    favBtn.classList.toggle('is-favourited', isNowFav);
    favBtn.setAttribute('aria-pressed', isNowFav ? 'true' : 'false');
    favText.textContent = isNowFav ? 'Saved in Favourites' : 'Save to Favourites';
    const icon = favBtn.querySelector('i');
    if (icon) {
      icon.style.color = isNowFav ? '#E74C3C' : 'inherit';
      icon.setAttribute('data-lucide', isNowFav ? 'heart-crack' : 'heart');
    }
    initIcons();
  });

  const shareBtn = document.getElementById('details-share-btn');
  shareBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => showToast('Hotel link copied to clipboard!', 'success'))
      .catch(() => showToast('Share URL: ' + window.location.href, 'info'));
  });

  // Booking Form Submission
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nights = calculateNights(checkInInput.value, checkOutInput.value);
    if (nights <= 0) {
      showToast('Check-out date must be after check-in date.', 'error');
      return;
    }

    const targetUrl = `checkout.html?id=${hotel.id}&checkin=${encodeURIComponent(checkInInput.value)}&checkout=${encodeURIComponent(checkOutInput.value)}&guests=${guestsSelect.value}`;
    window.location.href = targetUrl;
  });

  // Initial Calculation & Icons
  recalculate();
  initIcons();
});
