/**
 * STAYSCAPE — Checkout & Booking Simulation Logic
 * Includes rich guest form features, 1-click demo profiles, add-ons calculation, and saved profile persistence.
 */

document.addEventListener('DOMContentLoaded', () => {
  renderHeader('search');
  renderFooter();

  const container = document.getElementById('checkout-content-container');
  const breadcrumbHotel = document.getElementById('breadcrumb-hotel-link');

  // Parse Query Parameters
  const urlParams = new URLSearchParams(window.location.search);
  const hotelId = urlParams.get('id');
  const checkInParam = urlParams.get('checkin') || getTodayDateString(2);
  const checkOutParam = urlParams.get('checkout') || getTodayDateString(5);
  const guestsParam = parseInt(urlParams.get('guests'), 10) || 2;

  const hotel = getHotelById(hotelId);

  // If Hotel Not Found
  if (!hotel) {
    container.innerHTML = `
      <div class="empty-state" style="margin: var(--space-3xl) auto;">
        <div class="empty-state-icon">
          <i data-lucide="alert-circle" style="width: 32px; height: 32px; color: var(--error);"></i>
        </div>
        <h2>Invalid Booking Request</h2>
        <p>No valid stay was selected for checkout. Please browse our curated stays to begin a reservation.</p>
        <a href="search.html" class="btn btn-primary">Explore Stays</a>
      </div>
    `;
    initIcons();
    return;
  }

  // Update Breadcrumb Link
  if (breadcrumbHotel) {
    breadcrumbHotel.innerHTML = `<a href="hotel.html?id=${hotel.id}">${escapeHTML(hotel.name)}</a>`;
  }

  // Check for Saved Profile
  const savedProfile = getSavedProfile();

  // Add-ons Definition
  const ADDONS_CONFIG = [
    {
      id: 'addon-chauffeur',
      name: 'Private Airport Chauffeur Transfer',
      desc: 'Chauffeured luxury sedan pickup from the airport direct to the hotel.',
      price: 1800,
      icon: 'car'
    },
    {
      id: 'addon-spa',
      name: 'Signature Ayurvedic Spa & Wellness Pass',
      desc: '60-minute revitalizing holistic therapy for 2 guests.',
      price: 2500,
      icon: 'sparkles'
    },
    {
      id: 'addon-champagne',
      name: 'Chilled Champagne & Artisanal Fruit Atelier',
      desc: 'Handcrafted welcome amenities awaiting in your suite on arrival.',
      price: 1200,
      icon: 'wine'
    },
    {
      id: 'addon-late-checkout',
      name: 'Guaranteed Late Check-out (Until 3:00 PM)',
      desc: 'Relax and unwind with extended afternoon room privileges.',
      price: 950,
      icon: 'clock'
    }
  ];

  // Render Checkout Form & Summary Layout
  container.innerHTML = `
    <!-- Quick-Fill Demo Profiles Bar -->
    <div class="quick-fill-bar" id="quick-fill-container">
      <div class="quick-fill-header">
        <span style="display: flex; align-items: center; gap: 6px;">
          <i data-lucide="sparkles" style="width: 16px; height: 16px; color: var(--copper);"></i>
          <span>Fast Booking Demo: 1-Click Form Autofill</span>
        </span>
        <span style="font-size: 0.78rem; font-weight: normal; color: var(--charcoal);">Select a traveler profile or fill manually below</span>
      </div>
      <div class="quick-fill-buttons">
        <button type="button" class="quick-fill-btn" id="autofill-vacationer-btn">
          <i data-lucide="user" style="width: 14px; height: 14px;"></i>
          <span>👤 Rohan Mehta (Vacation Stay)</span>
        </button>
        <button type="button" class="quick-fill-btn" id="autofill-wellness-btn">
          <i data-lucide="award" style="width: 14px; height: 14px;"></i>
          <span>👤 Dr. Ananya Roy (Wellness Retreat)</span>
        </button>
        <button type="button" class="quick-fill-btn" id="autofill-business-btn">
          <i data-lucide="briefcase" style="width: 14px; height: 14px;"></i>
          <span>👤 Vikram Singhania (Executive)</span>
        </button>
        <button type="button" class="quick-fill-btn" id="autofill-clear-btn" style="color: var(--charcoal); margin-left: auto;">
          <i data-lucide="rotate-ccw" style="width: 13px; height: 13px;"></i>
          <span>Clear Form</span>
        </button>
      </div>
    </div>

    <!-- Saved Profile Banner (if previously saved) -->
    <div id="saved-profile-banner" class="saved-profile-banner" style="${savedProfile ? 'display: flex;' : 'display: none;'}">
      <div style="display: flex; align-items: center; gap: 8px;">
        <i data-lucide="check-circle" style="width: 18px; height: 18px; color: var(--sage);"></i>
        <span>Welcome back! We've pre-filled your details from your saved guest profile.</span>
      </div>
      <button type="button" id="clear-saved-profile-btn" style="font-size: 0.78rem; text-decoration: underline; color: var(--navy); font-weight: 600;">
        Clear saved profile
      </button>
    </div>

    <div class="checkout-layout">
      
      <!-- Left Column: Guest Details Form -->
      <div class="checkout-form-card">
        <form id="checkout-form" novalidate>
          
          <!-- Step 1: Guest Information -->
          <div style="margin-bottom: var(--space-2xl);">
            <h2 class="form-step-title">
              <i data-lucide="user-check" style="width: 20px; height: 20px; color: var(--copper);"></i>
              <span>1. Primary Guest Details</span>
            </h2>

            <div style="display: grid; grid-template-columns: 100px 1fr; gap: var(--space-md);">
              <div class="form-group">
                <label for="guest-title" class="form-label">Title</label>
                <select id="guest-title" class="form-select">
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Dr.">Dr.</option>
                </select>
              </div>

              <div class="form-group">
                <label for="guest-name" class="form-label">
                  Full Name <span class="required-star">*</span>
                </label>
                <input type="text" id="guest-name" class="form-input" placeholder="e.g. Rohan Mehta" required autocomplete="name">
                <div class="field-error-text" id="err-guest-name" style="display: none;"></div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
              <div class="form-group">
                <label for="guest-email" class="form-label">
                  Email Address <span class="required-star">*</span>
                </label>
                <input type="email" id="guest-email" class="form-input" placeholder="rohan.mehta@example.com" required autocomplete="email">
                <span class="form-hint">Confirmation code &amp; voucher lookup</span>
                <div class="field-error-text" id="err-guest-email" style="display: none;"></div>
              </div>

              <div class="form-group">
                <label for="guest-phone" class="form-label">
                  Phone Number <span style="font-weight: normal; color: var(--charcoal);">(Optional)</span>
                </label>
                <input type="tel" id="guest-phone" class="form-input" placeholder="+91 98765 43210" autocomplete="tel">
                <div class="field-error-text" id="err-guest-phone" style="display: none;"></div>
              </div>
            </div>

            <div class="form-group" style="margin-top: 4px;">
              <label class="form-checkbox-label">
                <input type="checkbox" id="save-guest-profile-check" checked>
                <span style="font-size: 0.85rem; color: var(--charcoal-dark);">
                  Remember my details for faster future bookings
                </span>
              </label>
            </div>
          </div>

          <!-- Step 2: Dates & Room Preferences -->
          <div style="margin-bottom: var(--space-2xl);">
            <h2 class="form-step-title">
              <i data-lucide="calendar" style="width: 20px; height: 20px; color: var(--copper);"></i>
              <span>2. Reservation Dates &amp; Room Customization</span>
            </h2>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-md); margin-bottom: var(--space-md);">
              <div class="form-group">
                <label for="checkout-checkin" class="form-label">Check-In <span class="required-star">*</span></label>
                <input type="date" id="checkout-checkin" class="form-input" required>
                <div class="field-error-text" id="err-checkout-checkin" style="display: none;"></div>
              </div>

              <div class="form-group">
                <label for="checkout-checkout" class="form-label">Check-Out <span class="required-star">*</span></label>
                <input type="date" id="checkout-checkout" class="form-input" required>
                <div class="field-error-text" id="err-checkout-checkout" style="display: none;"></div>
              </div>

              <div class="form-group">
                <label for="checkout-guests" class="form-label">Guests (Max ${hotel.capacity})</label>
                <select id="checkout-guests" class="form-select">
                  ${Array.from({ length: hotel.capacity }, (_, i) => i + 1).map(n => `
                    <option value="${n}" ${n === guestsParam ? 'selected' : ''}>${n} ${n === 1 ? 'Guest' : 'Guests'}</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <!-- Room Preferences -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
              <div class="form-group">
                <label for="bed-preference" class="form-label">Bedding Preference</label>
                <select id="bed-preference" class="form-select">
                  <option value="1 King Size Bed">🛏️ 1 King Size Bed</option>
                  <option value="2 Twin / Queen Beds">🛏️🛏️ 2 Separate Twin Beds</option>
                  <option value="No Preference">No Preference</option>
                </select>
              </div>

              <div class="form-group">
                <label for="arrival-time" class="form-label">Estimated Arrival Time</label>
                <select id="arrival-time" class="form-select">
                  <option value="14:00 - 16:00 (Standard)">14:00 - 16:00 (Standard Check-in)</option>
                  <option value="12:00 - 14:00 (Early Arrival)">12:00 - 14:00 (Early Arrival)</option>
                  <option value="16:00 - 18:00 (Late Afternoon)">16:00 - 18:00 (Late Afternoon)</option>
                  <option value="18:00 - 20:00 (Evening)">18:00 - 20:00 (Evening)</option>
                  <option value="After 20:00 (Night Arrival)">After 20:00 (Night Arrival)</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="trip-purpose" class="form-label">Trip Purpose</label>
              <select id="trip-purpose" class="form-select">
                <option value="Leisure & Vacation">Leisure &amp; Holiday Getaway</option>
                <option value="Anniversary & Celebration">Anniversary / Romantic Celebration</option>
                <option value="Business & Relaxation">Business &amp; Workation</option>
                <option value="Family Gathering">Family Gathering</option>
              </select>
            </div>
          </div>

          <!-- Step 3: Experience Enhancements & Add-ons -->
          <div style="margin-bottom: var(--space-2xl);">
            <h2 class="form-step-title">
              <i data-lucide="plus-circle" style="width: 20px; height: 20px; color: var(--copper);"></i>
              <span>3. Curated Experience Add-ons</span>
            </h2>
            <p style="font-size: 0.85rem; color: var(--charcoal); margin-bottom: var(--space-sm);">
              Enhance your stay with optional signature experiences. Costs are added directly to your price breakdown.
            </p>

            <div id="addons-selection-list">
              ${ADDONS_CONFIG.map(addon => `
                <label class="addon-card" id="card-${addon.id}">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <input type="checkbox" class="addon-checkbox" id="${addon.id}" data-price="${addon.price}" data-name="${escapeHTML(addon.name)}" style="width: 18px; height: 18px; accent-color: var(--copper);">
                    <div>
                      <strong style="color: var(--navy); font-size: 0.95rem; display: block;">${escapeHTML(addon.name)}</strong>
                      <span style="font-size: 0.8rem; color: var(--charcoal);">${escapeHTML(addon.desc)}</span>
                    </div>
                  </div>
                  <span class="addon-price-badge">+${formatCurrency(addon.price)}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- Step 4: Dietary & Special Requests -->
          <div style="margin-bottom: var(--space-2xl);">
            <h2 class="form-step-title">
              <i data-lucide="message-square" style="width: 20px; height: 20px; color: var(--copper);"></i>
              <span>4. Dietary Preferences &amp; Special Requests</span>
            </h2>

            <div class="form-group">
              <label class="form-label">Dietary Preferences</label>
              <div class="preference-chips-group" id="dietary-chips-group">
                <button type="button" class="preference-chip" data-diet="Vegetarian">🥗 Vegetarian</button>
                <button type="button" class="preference-chip" data-diet="Vegan">🌱 Vegan</button>
                <button type="button" class="preference-chip" data-diet="Jain">🌾 Jain</button>
                <button type="button" class="preference-chip" data-diet="Gluten-Free">🌾 Gluten-Free</button>
                <button type="button" class="preference-chip" data-diet="Halal">🥩 Halal</button>
              </div>
            </div>

            <div class="form-group">
              <label for="guest-requests" class="form-label">Special Inquiries or Requests</label>
              <textarea id="guest-requests" class="form-textarea" rows="3" placeholder="e.g. Quiet room on upper level, feather-free pillows, late check-in notification..."></textarea>
              <span class="form-hint">Requests are noted and provided complimentary subject to availability.</span>
            </div>
          </div>

          <!-- Step 5: Payment Method -->
          <div style="margin-bottom: var(--space-2xl);">
            <h2 class="form-step-title">
              <i data-lucide="credit-card" style="width: 20px; height: 20px; color: var(--copper);"></i>
              <span>5. Guaranteed Payment Method</span>
            </h2>

            <div class="payment-option-card selected" id="opt-pay-hotel">
              <input type="radio" name="payment-method" id="pay-hotel" value="Pay upon Arrival at Hotel" checked style="accent-color: var(--copper);">
              <label for="pay-hotel" style="cursor: pointer; flex: 1;">
                <strong>Pay upon Arrival at Hotel</strong>
                <p style="font-size: 0.82rem; color: var(--charcoal); margin-top: 2px;">No upfront deposit required. Settle charges in full upon check-in.</p>
              </label>
              <i data-lucide="building-2" style="width: 24px; height: 24px; color: var(--copper);"></i>
            </div>

            <div class="payment-option-card" id="opt-pay-mock-card">
              <input type="radio" name="payment-method" id="pay-card" value="Instant Digital Pre-Authorization" style="accent-color: var(--copper);">
              <label for="pay-card" style="cursor: pointer; flex: 1;">
                <strong>Instant Digital Pre-Authorization</strong>
                <p style="font-size: 0.82rem; color: var(--charcoal); margin-top: 2px;">Simulated instant card guarantee without entering sensitive details.</p>
              </label>
              <i data-lucide="check-check" style="width: 24px; height: 24px; color: var(--sage);"></i>
            </div>
          </div>

          <!-- Terms Checkbox -->
          <div class="form-group" style="margin-bottom: var(--space-xl);">
            <label class="form-checkbox-label">
              <input type="checkbox" id="terms-agree" required>
              <span style="font-size: 0.88rem;">
                I agree to the hotel booking policies, guest house guidelines, and reservation terms.
              </span>
            </label>
            <div class="field-error-text" id="err-terms-agree" style="display: none;"></div>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="btn btn-primary btn-lg" id="submit-booking-btn" style="width: 100%;">
            <i data-lucide="lock" style="width: 18px; height: 18px;"></i>
            <span id="submit-btn-text">Confirm Luxury Reservation</span>
          </button>

          <p style="text-align: center; font-size: 0.78rem; color: var(--charcoal); margin-top: 10px;">
            Instant booking confirmation &bull; Zero reservation fees &bull; Local private storage
          </p>

        </form>
      </div>

      <!-- Right Column: Itemised Booking Summary -->
      <aside class="checkout-summary-card" aria-label="Booking summary">
        
        <h3 style="font-size: 1.25rem; margin-bottom: var(--space-md); color: var(--navy);">
          Reservation Summary
        </h3>

        <!-- Hotel Mini Header -->
        <div class="summary-hotel-header">
          <img src="${escapeHTML(hotel.image)}" alt="${escapeHTML(hotel.name)}" class="summary-hotel-thumb" onerror="this.src=FALLBACK_IMAGE">
          <div>
            <div style="font-size: 0.78rem; color: var(--copper); font-weight: 700; text-transform: uppercase;">${escapeHTML(hotel.city)}</div>
            <h4 style="font-size: 1.05rem; margin: 2px 0; color: var(--navy);">${escapeHTML(hotel.name)}</h4>
            <div style="font-size: 0.8rem; color: var(--charcoal);">${'★'.repeat(hotel.stars || 5)} (${hotel.rating} ★)</div>
          </div>
        </div>

        <!-- Room Specs -->
        <div style="padding-bottom: var(--space-md); border-bottom: 1px solid var(--sand-light); margin-bottom: var(--space-md); font-size: 0.88rem;">
          <div style="color: var(--charcoal);">Room Category:</div>
          <strong style="color: var(--navy); display: block; margin-top: 2px;">${escapeHTML(hotel.roomType)}</strong>
          <div id="summary-bed-type" style="font-size: 0.8rem; color: var(--charcoal); margin-top: 2px;">King Size Bed</div>
        </div>

        <!-- Dates & Guests Row -->
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.88rem; padding-bottom: var(--space-md); border-bottom: 1px solid var(--sand-light); margin-bottom: var(--space-md);">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--charcoal);">Check-In:</span>
            <strong id="summary-checkin-display">${formatDate(checkInParam)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--charcoal);">Check-Out:</span>
            <strong id="summary-checkout-display">${formatDate(checkOutParam)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--charcoal);">Stay Duration:</span>
            <strong id="summary-nights-display">3 Nights</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--charcoal);">Occupancy:</span>
            <strong id="summary-guests-display">${guestsParam} Guests</strong>
          </div>
        </div>

        <!-- Itemised Price Calculation -->
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.92rem; margin-bottom: var(--space-lg);">
          <div style="display: flex; justify-content: space-between;">
            <span id="summary-calc-label">${formatCurrency(hotel.pricePerNight)} &times; 3 nights</span>
            <span id="summary-calc-subtotal" style="font-weight: 600;">₹0</span>
          </div>

          <!-- Dynamic Add-ons Itemised Rows -->
          <div id="summary-addons-container" style="display: flex; flex-direction: column; gap: 6px; padding: 4px 0;"></div>

          <div style="display: flex; justify-content: space-between; font-size: 0.82rem;">
            <span style="color: var(--charcoal);">Taxes &amp; Service Charges</span>
            <span style="color: var(--sage); font-weight: 600;">Included</span>
          </div>
          
          <div style="border-top: 2px solid var(--sand); padding-top: 10px; margin-top: 6px; display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-weight: 700; color: var(--navy); font-size: 1.1rem;">Total Amount</span>
            <span id="summary-grand-total" class="font-serif" style="font-size: 1.5rem; font-weight: 700; color: var(--copper);">₹0</span>
          </div>
        </div>

        <!-- Tariff Guarantee Box -->
        <div style="background-color: var(--sand-light); border-radius: var(--radius-sm); padding: 10px; font-size: 0.78rem; color: var(--charcoal-dark); line-height: 1.4;">
          <i data-lucide="shield-check" style="width: 14px; height: 14px; color: var(--sage); vertical-align: middle; margin-right: 4px;"></i>
          <strong>STAYSCAPE Best Tariff Guarantee:</strong> Transparent itemised pricing with no hidden checkout surcharges.
        </div>

      </aside>

    </div>
  `;

  // Bind Form Elements
  const form = document.getElementById('checkout-form');
  const titleSelect = document.getElementById('guest-title');
  const nameInput = document.getElementById('guest-name');
  const emailInput = document.getElementById('guest-email');
  const phoneInput = document.getElementById('guest-phone');
  const checkInInput = document.getElementById('checkout-checkin');
  const checkOutInput = document.getElementById('checkout-checkout');
  const guestsSelect = document.getElementById('checkout-guests');
  const bedSelect = document.getElementById('bed-preference');
  const arrivalSelect = document.getElementById('arrival-time');
  const purposeSelect = document.getElementById('trip-purpose');
  const requestsInput = document.getElementById('guest-requests');
  const saveProfileCheck = document.getElementById('save-guest-profile-check');
  const termsCheckbox = document.getElementById('terms-agree');
  const submitBtn = document.getElementById('submit-booking-btn');
  const submitText = document.getElementById('submit-btn-text');

  // Summary Elements
  const sumCheckIn = document.getElementById('summary-checkin-display');
  const sumCheckOut = document.getElementById('summary-checkout-display');
  const sumNights = document.getElementById('summary-nights-display');
  const sumGuests = document.getElementById('summary-guests-display');
  const sumBed = document.getElementById('summary-bed-type');
  const sumCalcLabel = document.getElementById('summary-calc-label');
  const sumCalcSubtotal = document.getElementById('summary-calc-subtotal');
  const sumAddonsContainer = document.getElementById('summary-addons-container');
  const sumGrandTotal = document.getElementById('summary-grand-total');

  // Set initial dates
  checkInInput.min = getTodayDateString();
  checkInInput.value = checkInParam;
  checkOutInput.min = getTodayDateString(1);
  checkOutInput.value = checkOutParam;

  // Selected Dietary state
  const selectedDiets = new Set();
  document.querySelectorAll('.preference-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const diet = chip.getAttribute('data-diet');
      if (selectedDiets.has(diet)) {
        selectedDiets.delete(diet);
        chip.classList.remove('is-active');
      } else {
        selectedDiets.add(diet);
        chip.classList.add('is-active');
      }
    });
  });

  // Calculate & Update Price Breakdown
  function updateSummary() {
    const nights = calculateNights(checkInInput.value, checkOutInput.value) || 1;
    const baseTotal = hotel.pricePerNight * nights;
    const gCount = guestsSelect.value;

    sumCheckIn.textContent = formatDate(checkInInput.value);
    sumCheckOut.textContent = formatDate(checkOutInput.value);
    sumNights.textContent = `${nights} ${nights === 1 ? 'Night' : 'Nights'}`;
    sumGuests.textContent = `${gCount} ${gCount === '1' ? 'Guest' : 'Guests'}`;
    sumBed.textContent = bedSelect.value;

    sumCalcLabel.textContent = `${formatCurrency(hotel.pricePerNight)} × ${nights} ${nights === 1 ? 'night' : 'nights'}`;
    sumCalcSubtotal.textContent = formatCurrency(baseTotal);

    // Calculate Add-ons
    let addonsTotal = 0;
    const activeAddons = [];
    document.querySelectorAll('.addon-checkbox:checked').forEach(cb => {
      const price = Number(cb.getAttribute('data-price')) || 0;
      const name = cb.getAttribute('data-name');
      addonsTotal += price;
      activeAddons.push({ name, price });
    });

    // Update Addons Display in Summary
    if (activeAddons.length > 0) {
      sumAddonsContainer.innerHTML = activeAddons.map(a => `
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--navy);">
          <span>+ ${escapeHTML(a.name)}</span>
          <span style="font-weight: 600;">${formatCurrency(a.price)}</span>
        </div>
      `).join('');
    } else {
      sumAddonsContainer.innerHTML = '';
    }

    const grandTotal = baseTotal + addonsTotal;
    sumGrandTotal.textContent = formatCurrency(grandTotal);
  }

  // Date changes trigger recalculation
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
    updateSummary();
  });

  checkOutInput.addEventListener('change', updateSummary);
  guestsSelect.addEventListener('change', updateSummary);
  bedSelect.addEventListener('change', updateSummary);

  // Addon Checkbox Handling & Visual Highlighting
  document.querySelectorAll('.addon-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const card = document.getElementById(`card-${cb.id}`);
      if (card) {
        card.classList.toggle('is-selected', cb.checked);
      }
      updateSummary();
    });
  });

  // Payment Option selection visual styling
  document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.payment-option-card').forEach(c => c.classList.remove('selected'));
      radio.closest('.payment-option-card').classList.add('selected');
    });
  });

  // Quick-Fill Demo Profiles Implementation
  function applyProfile(data) {
    if (data.title) titleSelect.value = data.title;
    if (data.name) nameInput.value = data.name;
    if (data.email) emailInput.value = data.email;
    if (data.phone) phoneInput.value = data.phone;
    if (data.bed) bedSelect.value = data.bed;
    if (data.arrival) arrivalSelect.value = data.arrival;
    if (data.purpose) purposeSelect.value = data.purpose;
    if (data.requests) requestsInput.value = data.requests;

    // Reset and apply dietary chips
    selectedDiets.clear();
    document.querySelectorAll('.preference-chip').forEach(chip => {
      const diet = chip.getAttribute('data-diet');
      if (data.diets && data.diets.includes(diet)) {
        selectedDiets.add(diet);
        chip.classList.add('is-active');
      } else {
        chip.classList.remove('is-active');
      }
    });

    // Reset and apply add-ons
    document.querySelectorAll('.addon-checkbox').forEach(cb => {
      const shouldCheck = data.addons && data.addons.includes(cb.id);
      cb.checked = shouldCheck;
      const card = document.getElementById(`card-${cb.id}`);
      if (card) card.classList.toggle('is-selected', shouldCheck);
    });

    clearError('guest-name');
    clearError('guest-email');
    updateSummary();
  }

  // Preload saved profile if available
  if (savedProfile) {
    applyProfile(savedProfile);
  }

  // Button 1: Rohan Mehta (Vacationer)
  document.getElementById('autofill-vacationer-btn').addEventListener('click', () => {
    applyProfile({
      title: 'Mr.',
      name: 'Rohan Mehta',
      email: 'rohan.mehta@example.com',
      phone: '+91 98765 43210',
      bed: '1 King Size Bed',
      arrival: '14:00 - 16:00 (Standard)',
      purpose: 'Leisure & Vacation',
      diets: ['Vegetarian'],
      addons: ['addon-chauffeur', 'addon-late-checkout'],
      requests: 'Upper floor suite with serene sunrise view. Feather-free bedding preferred.'
    });
    showToast('Applied traveler profile: Rohan Mehta', 'success');
  });

  // Button 2: Dr. Ananya Roy (Wellness Retreat)
  document.getElementById('autofill-wellness-btn').addEventListener('click', () => {
    applyProfile({
      title: 'Dr.',
      name: 'Ananya Roy',
      email: 'ananya.roy@example.com',
      phone: '+91 91234 56789',
      bed: '1 King Size Bed',
      arrival: '16:00 - 18:00 (Late Afternoon)',
      purpose: 'Anniversary & Celebration',
      diets: ['Vegan', 'Gluten-Free'],
      addons: ['addon-spa', 'addon-champagne'],
      requests: 'Celebrating our anniversary! Extra herbal tea kettle in room appreciated.'
    });
    showToast('Applied traveler profile: Dr. Ananya Roy', 'success');
  });

  // Button 3: Vikram Singhania (Executive)
  document.getElementById('autofill-business-btn').addEventListener('click', () => {
    applyProfile({
      title: 'Mr.',
      name: 'Vikram Singhania',
      email: 'vikram.singhania@example.com',
      phone: '+91 99887 76655',
      bed: '1 King Size Bed',
      arrival: '18:00 - 20:00 (Evening)',
      purpose: 'Business & Relaxation',
      diets: [],
      addons: ['addon-chauffeur'],
      requests: 'High-speed fiber ethernet connection and express luggage service requested.'
    });
    showToast('Applied traveler profile: Vikram Singhania', 'success');
  });

  // Button 4: Clear Form
  document.getElementById('autofill-clear-btn').addEventListener('click', () => {
    nameInput.value = '';
    emailInput.value = '';
    phoneInput.value = '';
    requestsInput.value = '';
    selectedDiets.clear();
    document.querySelectorAll('.preference-chip').forEach(c => c.classList.remove('is-active'));
    document.querySelectorAll('.addon-checkbox').forEach(cb => {
      cb.checked = false;
      const card = document.getElementById(`card-${cb.id}`);
      if (card) card.classList.remove('is-selected');
    });
    updateSummary();
    showToast('Cleared guest form details.', 'info');
  });

  // Clear Saved Profile Link
  const clearSavedBtn = document.getElementById('clear-saved-profile-btn');
  if (clearSavedBtn) {
    clearSavedBtn.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
      document.getElementById('saved-profile-banner').style.display = 'none';
      showToast('Saved profile cleared from this browser.', 'info');
    });
  }

  // Validation Helpers
  function showError(fieldId, errorMsg) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(`err-${fieldId}`);
    if (input) {
      input.classList.add('is-invalid');
      input.setAttribute('aria-invalid', 'true');
    }
    if (errorEl) {
      errorEl.textContent = errorMsg;
      errorEl.style.display = 'flex';
    }
  }

  function clearError(fieldId) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(`err-${fieldId}`);
    if (input) {
      input.classList.remove('is-invalid');
      input.removeAttribute('aria-invalid');
    }
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  }

  [nameInput, emailInput, phoneInput, checkInInput, checkOutInput, termsCheckbox].forEach(el => {
    el.addEventListener('input', () => clearError(el.id));
    el.addEventListener('change', () => clearError(el.id));
  });

  // Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // Validate Name
    const nameVal = nameInput.value.trim();
    if (!nameVal || nameVal.length < 3) {
      showError('guest-name', 'Please enter your full name (at least 3 characters).');
      isValid = false;
    }

    // Validate Email
    const emailVal = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailRegex.test(emailVal)) {
      showError('guest-email', 'Please provide a valid email address.');
      isValid = false;
    }

    // Validate Phone (if entered)
    const phoneVal = phoneInput.value.trim();
    if (phoneVal && phoneVal.replace(/[^0-9]/g, '').length < 8) {
      showError('guest-phone', 'Please enter a valid telephone number.');
      isValid = false;
    }

    // Validate Dates
    const todayStr = getTodayDateString();
    if (!checkInInput.value || checkInInput.value < todayStr) {
      showError('checkout-checkin', 'Check-in date cannot be in the past.');
      isValid = false;
    }

    const calculatedNights = calculateNights(checkInInput.value, checkOutInput.value);
    if (!checkOutInput.value || calculatedNights <= 0) {
      showError('checkout-checkout', 'Check-out date must be strictly after check-in date.');
      isValid = false;
    }

    // Validate Terms
    if (!termsCheckbox.checked) {
      showError('terms-agree', 'Please agree to the booking policies and reservation terms.');
      isValid = false;
    }

    if (!isValid) {
      showToast('Please correct the highlighted fields.', 'error');
      const firstInvalid = form.querySelector('.is-invalid, input:invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Prevent Double-Submission
    submitBtn.disabled = true;
    submitText.textContent = 'Securing luxury reservation...';

    // Calculate Final Total with Add-ons
    const nights = calculateNights(checkInInput.value, checkOutInput.value) || 1;
    let addonsTotal = 0;
    const selectedAddonsList = [];

    document.querySelectorAll('.addon-checkbox:checked').forEach(cb => {
      const price = Number(cb.getAttribute('data-price')) || 0;
      const name = cb.getAttribute('data-name');
      addonsTotal += price;
      selectedAddonsList.push({ id: cb.id, name, price });
    });

    const grandTotal = (hotel.pricePerNight * nights) + addonsTotal;
    const finalBookingId = generateBookingId();
    const paymentRadio = document.querySelector('input[name="payment-method"]:checked');
    const paymentMethodVal = paymentRadio ? paymentRadio.value : 'Pay upon Arrival at Hotel';

    // Construct Reservation Record
    const newBooking = {
      bookingId: finalBookingId,
      hotelId: hotel.id,
      hotelName: hotel.name,
      city: hotel.city,
      image: hotel.image,
      salutation: titleSelect.value,
      guestName: `${titleSelect.value} ${nameVal}`,
      email: emailVal,
      phone: phoneVal || 'Not provided',
      guests: parseInt(guestsSelect.value, 10),
      checkIn: checkInInput.value,
      checkOut: checkOutInput.value,
      nights: nights,
      pricePerNight: hotel.pricePerNight,
      bedPreference: bedSelect.value,
      arrivalTime: arrivalSelect.value,
      tripPurpose: purposeSelect.value,
      dietaryPreferences: Array.from(selectedDiets),
      addons: selectedAddonsList,
      total: grandTotal,
      specialRequest: requestsInput.value.trim() || 'None',
      paymentMethod: paymentMethodVal,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // Save Guest Profile if checked
    if (saveProfileCheck.checked) {
      saveProfile({
        title: titleSelect.value,
        name: nameVal,
        email: emailVal,
        phone: phoneVal,
        bed: bedSelect.value,
        arrival: arrivalSelect.value,
        purpose: purposeSelect.value,
        diets: Array.from(selectedDiets),
        addons: selectedAddonsList.map(a => a.id),
        requests: requestsInput.value.trim()
      });
    }

    // Save Booking in localStorage
    addBooking(newBooking);

    showToast('Reservation confirmed successfully!', 'success');
    setTimeout(() => {
      window.location.href = `confirmation.html?id=${encodeURIComponent(finalBookingId)}`;
    }, 450);
  });

  // Initial Calculation & Icons
  updateSummary();
  initIcons();
});
