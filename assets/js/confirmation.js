/**
 * STAYSCAPE — Booking Confirmation Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  renderHeader('');
  renderFooter();

  const container = document.getElementById('confirmation-content-container');
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get('id');

  const bookings = getStoredBookings();
  const booking = bookings.find(b => b.bookingId === bookingId);

  // If Booking ID Not Found
  if (!booking) {
    container.innerHTML = `
      <div class="empty-state" style="margin: var(--space-3xl) auto;">
        <div class="empty-state-icon">
          <i data-lucide="file-question" style="width: 32px; height: 32px; color: var(--warning);"></i>
        </div>
        <h2>Booking Not Found</h2>
        <p>We could not find a confirmed reservation matching the provided reference ID. It may have been cleared from this browser's local storage.</p>
        <div style="display: flex; gap: var(--space-md); justify-content: center; margin-top: var(--space-md);">
          <a href="bookings.html" class="btn btn-secondary btn-sm">View My Bookings</a>
          <a href="search.html" class="btn btn-primary btn-sm">Find a Stay</a>
        </div>
      </div>
    `;
    initIcons();
    return;
  }

  // Look up Hotel metadata if available
  const hotel = getHotelById(booking.hotelId) || {
    name: booking.hotelName,
    city: booking.city,
    checkIn: '14:00',
    checkOut: '11:00',
    stars: 5,
    rating: 4.9
  };

  // Render Confirmation Voucher
  container.innerHTML = `
    <div class="confirmation-voucher" id="printable-voucher">
      
      <!-- Success Icon -->
      <div class="confirmation-hero-badge">
        <i data-lucide="check" style="width: 38px; height: 38px;"></i>
      </div>

      <div style="text-align: center;">
        <span class="status-badge confirmed" style="margin-bottom: var(--space-sm);">Demo Booking Confirmed</span>
        <h1 style="font-size: clamp(1.8rem, 3.5vw, 2.6rem); margin-bottom: 8px;">
          Your demo booking is confirmed.
        </h1>
        <p style="color: var(--charcoal); max-width: 580px; margin: 0 auto;">
          Thank you, <strong>${escapeHTML(booking.guestName)}</strong>. Your simulated reservation at <strong>${escapeHTML(booking.hotelName)}</strong> has been recorded in your browser's local storage.
        </p>

        <!-- Booking ID Reference Box -->
        <div class="booking-ref-box">
          <div style="text-align: left;">
            <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--charcoal); font-weight: 700;">Demo Confirmation Code</div>
            <div class="booking-ref-code" id="booking-ref-text">${escapeHTML(booking.bookingId)}</div>
          </div>
          <button type="button" class="btn btn-secondary btn-sm btn-print-hide" id="copy-ref-btn" title="Copy confirmation code">
            <i data-lucide="copy" style="width: 15px; height: 15px;"></i>
            <span id="copy-ref-label">Copy</span>
          </button>
        </div>
      </div>

      <!-- Hotel Mini Showcase -->
      <div style="display: flex; gap: var(--space-md); align-items: center; background-color: var(--ivory); padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--sand); margin-bottom: var(--space-xl);">
        <img src="${escapeHTML(booking.image)}" alt="${escapeHTML(booking.hotelName)}" style="width: 90px; height: 80px; object-fit: cover; border-radius: var(--radius-sm);" onerror="this.src=FALLBACK_IMAGE">
        <div>
          <div style="font-size: 0.75rem; color: var(--copper); font-weight: 700; text-transform: uppercase;">${escapeHTML(booking.city)}</div>
          <h3 style="font-size: 1.25rem; margin: 2px 0; color: var(--navy);">${escapeHTML(booking.hotelName)}</h3>
          <div style="font-size: 0.82rem; color: var(--charcoal);">${'★'.repeat(hotel.stars || 5)} &bull; ${hotel.rating} Rating</div>
        </div>
      </div>

      <!-- Itemised Voucher Grid -->
      <div class="voucher-grid">
        
        <div>
          <div class="voucher-item-label">Primary Guest</div>
          <div class="voucher-item-val">${escapeHTML(booking.guestName)}</div>
          <div style="font-size: 0.85rem; color: var(--charcoal); margin-top: 2px;">
            ${escapeHTML(booking.email)}<br>
            ${escapeHTML(booking.phone)}
          </div>
        </div>

        <div>
          <div class="voucher-item-label">Occupancy &amp; Duration</div>
          <div class="voucher-item-val">${booking.nights} ${booking.nights === 1 ? 'Night' : 'Nights'}, ${booking.guests} ${booking.guests === 1 ? 'Guest' : 'Guests'}</div>
          <div style="font-size: 0.85rem; color: var(--charcoal); margin-top: 2px;">
            ${formatCurrency(booking.pricePerNight)} / night
          </div>
        </div>

        <div>
          <div class="voucher-item-label">Check-In</div>
          <div class="voucher-item-val">${formatDate(booking.checkIn)}</div>
          <div style="font-size: 0.85rem; color: var(--charcoal); margin-top: 2px;">
            Standard check-in from ${escapeHTML(hotel.checkIn || '14:00')}
          </div>
        </div>

        <div>
          <div class="voucher-item-label">Check-Out</div>
          <div class="voucher-item-val">${formatDate(booking.checkOut)}</div>
          <div style="font-size: 0.85rem; color: var(--charcoal); margin-top: 2px;">
            Standard check-out until ${escapeHTML(hotel.checkOut || '11:00')}
          </div>
        </div>

        <div>
          <div class="voucher-item-label">Room &amp; Arrival Customization</div>
          <div class="voucher-item-val" style="font-size: 0.95rem;">${escapeHTML(booking.bedPreference || '1 King Size Bed')}</div>
          <div style="font-size: 0.85rem; color: var(--charcoal); margin-top: 2px;">
            Estimated Arrival: ${escapeHTML(booking.arrivalTime || '14:00 - 16:00 (Standard)')}
          </div>
        </div>

        <div>
          <div class="voucher-item-label">Payment Method</div>
          <div class="voucher-item-val" style="font-size: 0.95rem;">${escapeHTML(booking.paymentMethod || 'Pay upon Arrival at Hotel')}</div>
          <div style="font-size: 0.82rem; color: var(--sage); font-weight: 600; margin-top: 2px;">Confirmed Reservation</div>
        </div>

        ${booking.addons && booking.addons.length > 0 ? `
          <div style="grid-column: span 2;">
            <div class="voucher-item-label">Included Experience Add-ons</div>
            <div style="background-color: var(--ivory); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--sand-light); display: flex; flex-direction: column; gap: 4px;">
              ${booking.addons.map(a => `
                <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: var(--navy);">
                  <span>✨ ${escapeHTML(a.name)}</span>
                  <span style="font-weight: 600;">${formatCurrency(a.price)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div style="grid-column: span 2;">
          <div class="voucher-item-label">Special Requests &amp; Dietary Preferences</div>
          <div style="font-size: 0.92rem; color: var(--charcoal-dark); background-color: var(--ivory); padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--sand-light);">
            ${booking.dietaryPreferences && booking.dietaryPreferences.length > 0 ? `
              <div style="margin-bottom: 4px;"><strong>Dietary Preferences:</strong> ${booking.dietaryPreferences.map(d => `<span class="amenity-pill" style="margin-left: 4px;">${escapeHTML(d)}</span>`).join('')}</div>
            ` : ''}
            <div>${escapeHTML(booking.specialRequest || 'No special requests specified.')}</div>
          </div>
        </div>

        <div style="grid-column: span 2; display: flex; justify-content: space-between; align-items: baseline; border-top: 2px solid var(--sand); padding-top: 14px;">
          <div>
            <div class="voucher-item-label">Total Grand Tariff</div>
            <div style="font-size: 0.78rem; color: var(--sage); font-weight: 600;">Includes All Taxes &amp; Luxury Amenity Access</div>
          </div>
          <div class="font-serif" style="font-size: 1.8rem; font-weight: 700; color: var(--copper);">${formatCurrency(booking.total)}</div>
        </div>

      </div>

      <!-- Verified Reservation Guarantee Callout -->
      <div class="demo-alert-box" style="margin: 0 0 var(--space-lg);">
        <i data-lucide="shield-check" style="width: 22px; height: 22px; color: var(--sage); flex-shrink: 0;"></i>
        <div style="font-size: 0.85rem; line-height: 1.5;">
          <strong>Reservation Voucher Guarantee:</strong>
          Your stay details and guest preferences have been successfully recorded in the system. Please present this confirmation code upon hotel check-in.
        </div>
      </div>

      <!-- Action Buttons Row (Hidden when printing) -->
      <div class="action-button-row btn-print-hide">
        <button type="button" class="btn btn-navy" id="print-voucher-btn">
          <i data-lucide="printer" style="width: 17px; height: 17px;"></i>
          <span>Print Voucher</span>
        </button>

        <a href="bookings.html?email=${encodeURIComponent(booking.email)}" class="btn btn-secondary">
          <i data-lucide="calendar" style="width: 17px; height: 17px;"></i>
          <span>View in My Bookings</span>
        </a>

        <a href="search.html" class="btn btn-outline">
          <span>Explore More Stays</span>
        </a>
      </div>

    </div>
  `;

  // Copy Reference ID Handler
  const copyBtn = document.getElementById('copy-ref-btn');
  const copyLabel = document.getElementById('copy-ref-label');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(booking.bookingId)
        .then(() => {
          copyLabel.textContent = 'Copied!';
          showToast('Booking Reference ID copied to clipboard!', 'success');
          setTimeout(() => {
            copyLabel.textContent = 'Copy';
          }, 2500);
        })
        .catch(() => {
          showToast(`Reference ID: ${booking.bookingId}`, 'info');
        });
    });
  }

  // Print Voucher Handler
  const printBtn = document.getElementById('print-voucher-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  initIcons();
});
