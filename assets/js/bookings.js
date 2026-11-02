/**
 * STAYSCAPE — My Bookings History & Cancellation Management
 */

document.addEventListener('DOMContentLoaded', () => {
  renderHeader('bookings');
  renderFooter();

  // Elements
  const container = document.getElementById('bookings-list-container');
  const emailForm = document.getElementById('email-filter-form');
  const emailInput = document.getElementById('lookup-email-input');
  const showAllBtn = document.getElementById('show-all-bookings-btn');
  const indicatorBar = document.getElementById('filter-indicator-bar');
  const activeEmailLabel = document.getElementById('filter-active-email');
  const clearFilterLink = document.getElementById('clear-email-filter-link');

  const countAll = document.getElementById('count-all');
  const countUpcoming = document.getElementById('count-upcoming');
  const countPast = document.getElementById('count-past');
  const countCancelled = document.getElementById('count-cancelled');
  const tabButtons = document.querySelectorAll('.tab-btn');

  // URL Query Parameters
  const urlParams = new URLSearchParams(window.location.search);
  let activeEmail = (urlParams.get('email') || '').trim();
  let currentTab = 'all';

  if (activeEmail && emailInput) {
    emailInput.value = activeEmail;
  }

  // Derive Status Category
  function getBookingCategory(booking) {
    if (booking.status === 'cancelled') {
      return 'cancelled';
    }
    const todayStr = getTodayDateString();
    if (booking.checkOut < todayStr) {
      return 'past';
    }
    return 'upcoming';
  }

  // Render Bookings List
  function renderBookings() {
    const allBookings = getStoredBookings();
    const todayStr = getTodayDateString();

    // Filter by Email if active
    let emailFiltered = allBookings;
    if (activeEmail) {
      const query = activeEmail.toLowerCase();
      emailFiltered = allBookings.filter(b => b.email && b.email.toLowerCase().includes(query));
      if (indicatorBar && activeEmailLabel) {
        indicatorBar.style.display = 'flex';
        activeEmailLabel.textContent = activeEmail;
      }
    } else {
      if (indicatorBar) indicatorBar.style.display = 'none';
    }

    // Calculate Counts for Tabs
    let upCount = 0;
    let pastCount = 0;
    let cancCount = 0;

    emailFiltered.forEach(b => {
      const cat = getBookingCategory(b);
      if (cat === 'upcoming') upCount++;
      else if (cat === 'past') pastCount++;
      else if (cat === 'cancelled') cancCount++;
    });

    if (countAll) countAll.textContent = emailFiltered.length;
    if (countUpcoming) countUpcoming.textContent = upCount;
    if (countPast) countPast.textContent = pastCount;
    if (countCancelled) countCancelled.textContent = cancCount;

    // Filter by Active Tab
    let displayedBookings = emailFiltered.filter(b => {
      if (currentTab === 'all') return true;
      return getBookingCategory(b) === currentTab;
    });

    // Empty State Check
    if (displayedBookings.length === 0) {
      const tabName = currentTab === 'all' ? '' : ` (${currentTab})`;
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <i data-lucide="calendar-x" style="width: 32px; height: 32px; color: var(--charcoal-light);"></i>
          </div>
          <h3>No ${escapeHTML(currentTab !== 'all' ? currentTab : '')} bookings found</h3>
          <p>
            ${activeEmail ? `No reservations found for "${escapeHTML(activeEmail)}"${tabName}.` : `You have no ${escapeHTML(currentTab !== 'all' ? currentTab : '')} reservations in this browser.`}
          </p>
          <div style="display: flex; gap: var(--space-md); justify-content: center;">
            ${activeEmail ? `<button type="button" class="btn btn-secondary btn-sm" id="empty-clear-filter-btn">Show All Bookings</button>` : ''}
            <a href="search.html" class="btn btn-primary btn-sm">Find a Stay</a>
          </div>
        </div>
      `;

      const emptyClearBtn = document.getElementById('empty-clear-filter-btn');
      if (emptyClearBtn) {
        emptyClearBtn.addEventListener('click', () => {
          activeEmail = '';
          if (emailInput) emailInput.value = '';
          renderBookings();
        });
      }

      initIcons();
      return;
    }

    // Render Cards
    container.innerHTML = displayedBookings.map(b => {
      const category = getBookingCategory(b);
      const isCancelled = category === 'cancelled';
      const isUpcoming = category === 'upcoming';
      const statusBadge = isCancelled ?
        '<span class="status-badge cancelled"><i data-lucide="x-circle" style="width: 12px; height: 12px;"></i> Cancelled</span>' :
        (isUpcoming ?
          '<span class="status-badge confirmed"><i data-lucide="check-circle" style="width: 12px; height: 12px;"></i> Upcoming</span>' :
          '<span class="status-badge past"><i data-lucide="clock" style="width: 12px; height: 12px;"></i> Completed</span>');

      return `
        <article class="booking-history-card" id="booking-card-${escapeHTML(b.bookingId)}">
          <div class="booking-card-thumb-box">
            <img src="${escapeHTML(b.image)}" alt="${escapeHTML(b.hotelName)}" class="booking-card-thumb" onerror="this.src=FALLBACK_IMAGE">
          </div>

          <div class="booking-card-content">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; flex-wrap: wrap; gap: 8px;">
                <div>
                  <span style="font-size: 0.75rem; color: var(--copper); font-weight: 700; text-transform: uppercase;">${escapeHTML(b.city)}</span>
                  <h3 style="font-size: 1.3rem; margin: 2px 0;">
                    <a href="hotel.html?id=${b.hotelId}">${escapeHTML(b.hotelName)}</a>
                  </h3>
                </div>
                <div>
                  ${statusBadge}
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--charcoal); margin-bottom: var(--space-xs);">
                <span>Ref: <strong style="font-family: monospace; color: var(--navy);">${escapeHTML(b.bookingId)}</strong></span>
                <button type="button" class="btn btn-secondary btn-sm" style="padding: 2px 6px; min-height: 24px; font-size: 0.72rem;" onclick="navigator.clipboard.writeText('${b.bookingId}'); showToast('Copied booking reference!', 'success');">
                  Copy
                </button>
              </div>

              <!-- Information Grid -->
              <div class="booking-grid-info">
                <div>
                  <div class="voucher-item-label">Guest</div>
                  <div style="font-weight: 600; color: var(--navy); font-size: 0.95rem;">${escapeHTML(b.guestName)}</div>
                  <div style="font-size: 0.78rem; color: var(--charcoal);">${escapeHTML(b.email)}</div>
                </div>

                <div>
                  <div class="voucher-item-label">Stay Dates</div>
                  <div style="font-weight: 600; color: var(--navy); font-size: 0.92rem;">${formatDate(b.checkIn)}</div>
                  <div style="font-size: 0.8rem; color: var(--charcoal);">to ${formatDate(b.checkOut)}</div>
                </div>

                <div>
                  <div class="voucher-item-label">Duration &amp; Guests</div>
                  <div style="font-weight: 600; color: var(--navy); font-size: 0.92rem;">${b.nights} ${b.nights === 1 ? 'Night' : 'Nights'}</div>
                  <div style="font-size: 0.8rem; color: var(--charcoal);">${b.guests} ${b.guests === 1 ? 'Guest' : 'Guests'}</div>
                </div>

                <div>
                  <div class="voucher-item-label">Total Amount</div>
                  <div class="font-serif" style="font-size: 1.25rem; font-weight: 700; color: var(--copper);">${formatCurrency(b.total)}</div>
                  <div style="font-size: 0.75rem; color: var(--charcoal);">${formatCurrency(b.pricePerNight)}/night</div>
                </div>
              </div>

              ${b.addons && b.addons.length > 0 ? `
                <div style="font-size: 0.8rem; color: var(--navy); margin-bottom: 6px; display: flex; flex-wrap: wrap; gap: 6px;">
                  <span style="font-weight: 600; color: var(--charcoal);">Add-ons:</span>
                  ${b.addons.map(a => `<span class="amenity-pill">✨ ${escapeHTML(a.name)}</span>`).join('')}
                </div>
              ` : ''}

              ${b.specialRequest && b.specialRequest !== 'None' ? `
                <div style="font-size: 0.82rem; color: var(--charcoal); margin-bottom: var(--space-md); background: var(--ivory); padding: 6px 12px; border-radius: var(--radius-xs);">
                  <strong>Special Request:</strong> ${escapeHTML(b.specialRequest)}
                </div>
              ` : ''}
            </div>

            <!-- Card Actions -->
            <div style="display: flex; gap: var(--space-sm); align-items: center; justify-content: flex-end; flex-wrap: wrap; margin-top: var(--space-sm);">
              <a href="confirmation.html?id=${encodeURIComponent(b.bookingId)}" class="btn btn-secondary btn-sm">
                <i data-lucide="receipt" style="width: 14px; height: 14px;"></i>
                <span>View Voucher</span>
              </a>

              <a href="hotel.html?id=${b.hotelId}" class="btn btn-secondary btn-sm">
                <span>View Hotel</span>
              </a>

              ${isUpcoming ? `
                <button type="button" class="btn btn-danger btn-sm cancel-booking-btn" data-booking-id="${escapeHTML(b.bookingId)}" data-hotel-name="${escapeHTML(b.hotelName)}">
                  <i data-lucide="calendar-x" style="width: 14px; height: 14px;"></i>
                  <span>Cancel Reservation</span>
                </button>
              ` : ''}
            </div>

          </div>
        </article>
      `;
    }).join('');

    // Attach Cancellation Dialog Listeners
    document.querySelectorAll('.cancel-booking-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-booking-id');
        const hName = btn.getAttribute('data-hotel-name');

        openModal({
          title: 'Cancel Demo Reservation?',
          content: `
            <p style="margin-bottom: var(--space-sm);">
              Are you sure you want to cancel your simulated reservation at <strong>${escapeHTML(hName)}</strong> (ID: <code>${escapeHTML(id)}</code>)?
            </p>
            <p style="font-size: 0.85rem; color: var(--charcoal);">
              This reservation status will update to <em>Cancelled</em> and remain preserved in your booking history. No cancellation fees apply to demo bookings.
            </p>
          `,
          confirmText: 'Yes, Cancel Reservation',
          cancelText: 'Keep Reservation',
          isDanger: true,
          onConfirm: () => {
            updateBookingStatus(id, 'cancelled');
            showToast(`Reservation at ${hName} has been cancelled.`, 'info');
            renderBookings();
          }
        });
      });
    });

    initIcons();
  }

  // Tab Switching Handler
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      currentTab = btn.getAttribute('data-tab');
      renderBookings();
    });
  });

  // Email Lookup Form
  if (emailForm) {
    emailForm.addEventListener('submit', (e) => {
      e.preventDefault();
      activeEmail = (emailInput.value || '').trim();
      renderBookings();
      if (activeEmail) {
        showToast(`Filtered bookings for "${activeEmail}"`, 'info');
      }
    });
  }

  if (showAllBtn) {
    showAllBtn.addEventListener('click', () => {
      activeEmail = '';
      if (emailInput) emailInput.value = '';
      renderBookings();
      showToast('Showing all simulated reservations.', 'info');
    });
  }

  if (clearFilterLink) {
    clearFilterLink.addEventListener('click', () => {
      activeEmail = '';
      if (emailInput) emailInput.value = '';
      renderBookings();
    });
  }

  // Initial Render
  renderBookings();

  // Sync with live backend API if online
  if (window.StayscapeAPI) {
    window.StayscapeAPI.getBookings().then(res => {
      if (res && res.success && Array.isArray(res.data)) {
        safeSetStorage(STORAGE_KEYS.BOOKINGS, res.data);
        renderBookings();
      }
    }).catch(err => console.warn('[Bookings] Live API fetch failed:', err));
  }
});
