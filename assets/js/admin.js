/**
 * STAYSCAPE — Admin Demo Dashboard & Inventory CRUD Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  renderHeader('admin');
  renderFooter();

  // Elements
  const metricHotels = document.getElementById('metric-total-hotels');
  const metricBookings = document.getElementById('metric-total-bookings');
  const metricConfirmed = document.getElementById('metric-confirmed-bookings');
  const metricCancelled = document.getElementById('metric-cancelled-bookings');
  const metricRevenue = document.getElementById('metric-demo-revenue');

  const tabBtnBookings = document.getElementById('tab-btn-bookings');
  const tabBtnHotels = document.getElementById('tab-btn-hotels');
  const sectionBookings = document.getElementById('admin-bookings-section');
  const sectionHotels = document.getElementById('admin-hotels-section');

  const bookingSearch = document.getElementById('admin-booking-search');
  const bookingFilter = document.getElementById('admin-booking-status-filter');
  const bookingsTbody = document.getElementById('admin-bookings-tbody');
  const hotelsTbody = document.getElementById('admin-hotels-tbody');

  const addHotelBtn1 = document.getElementById('add-hotel-modal-btn');
  const addHotelBtn2 = document.getElementById('add-hotel-btn-2');
  const resetDataBtn = document.getElementById('reset-sample-data-btn');

  // 1. Calculate & Render Metrics
  function updateMetrics() {
    const hotels = getStoredHotels();
    const bookings = getStoredBookings();

    const confirmed = bookings.filter(b => b.status === 'confirmed');
    const cancelled = bookings.filter(b => b.status === 'cancelled');
    const totalRev = confirmed.reduce((acc, b) => acc + (Number(b.total) || 0), 0);

    if (metricHotels) metricHotels.textContent = hotels.length;
    if (metricBookings) metricBookings.textContent = bookings.length;
    if (metricConfirmed) metricConfirmed.textContent = confirmed.length;
    if (metricCancelled) metricCancelled.textContent = cancelled.length;
    if (metricRevenue) metricRevenue.textContent = formatCurrency(totalRev);

    // If backend API is online, query server metrics
    if (window.StayscapeAPI && window.StayscapeAPI.isOnline) {
      window.StayscapeAPI.getAdminStats().then(res => {
        if (res && res.success && res.data) {
          if (metricHotels) metricHotels.textContent = res.data.totalHotels;
          if (metricBookings) metricBookings.textContent = res.data.totalBookings;
          if (metricConfirmed) metricConfirmed.textContent = res.data.confirmedBookings;
          if (metricCancelled) metricCancelled.textContent = res.data.cancelledBookings;
          if (metricRevenue) metricRevenue.textContent = formatCurrency(res.data.totalRevenue);
        }
      }).catch(err => console.warn('[Admin] Live stats query failed:', err));
    }
  }

  // 2. Render Bookings Table
  function renderBookingsTable() {
    const bookings = getStoredBookings();
    const query = (bookingSearch.value || '').toLowerCase().trim();
    const statusVal = bookingFilter.value;

    let filtered = bookings.filter(b => {
      // Status filter
      if (statusVal !== 'all' && b.status !== statusVal) {
        return false;
      }
      // Search filter
      if (query) {
        const matchName = (b.guestName || '').toLowerCase().includes(query);
        const matchEmail = (b.email || '').toLowerCase().includes(query);
        const matchId = (b.bookingId || '').toLowerCase().includes(query);
        const matchHotel = (b.hotelName || '').toLowerCase().includes(query);
        if (!matchName && !matchEmail && !matchId && !matchHotel) {
          return false;
        }
      }
      return true;
    });

    if (filtered.length === 0) {
      bookingsTbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: var(--space-2xl); color: var(--charcoal);">
            No bookings match your search query.
          </td>
        </tr>
      `;
      return;
    }

    bookingsTbody.innerHTML = filtered.map(b => {
      const isConfirmed = b.status === 'confirmed';
      const badge = isConfirmed ?
        '<span class="status-badge confirmed">Confirmed</span>' :
        '<span class="status-badge cancelled">Cancelled</span>';

      return `
        <tr>
          <td><strong style="font-family: monospace; color: var(--copper);">${escapeHTML(b.bookingId)}</strong></td>
          <td>
            <strong>${escapeHTML(b.guestName)}</strong><br>
            <span style="font-size: 0.8rem; color: var(--charcoal);">${escapeHTML(b.email)}</span>
          </td>
          <td>
            <strong>${escapeHTML(b.hotelName)}</strong><br>
            <span style="font-size: 0.8rem; color: var(--charcoal);">${escapeHTML(b.city)}</span>
          </td>
          <td style="white-space: nowrap;">
            ${formatDate(b.checkIn)}<br>
            <span style="font-size: 0.8rem; color: var(--charcoal);">to ${formatDate(b.checkOut)}</span>
          </td>
          <td>${b.nights}</td>
          <td><strong>${formatCurrency(b.total)}</strong></td>
          <td>${badge}</td>
          <td>
            <div style="display: flex; gap: 6px; align-items: center;">
              <a href="confirmation.html?id=${encodeURIComponent(b.bookingId)}" class="btn btn-secondary btn-sm" style="padding: 4px 8px; font-size: 0.75rem;" title="View Voucher">
                Voucher
              </a>
              ${isConfirmed ? `
                <button type="button" class="btn btn-danger btn-sm cancel-admin-booking-btn" data-id="${escapeHTML(b.bookingId)}" style="padding: 4px 8px; font-size: 0.75rem;" title="Mark Cancelled">
                  Cancel
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach cancel listeners
    document.querySelectorAll('.cancel-admin-booking-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openModal({
          title: 'Mark Booking Cancelled?',
          content: `<p>Are you sure you want to change the status of booking <code>${escapeHTML(id)}</code> to cancelled?</p>`,
          confirmText: 'Mark Cancelled',
          isDanger: true,
          onConfirm: () => {
            updateBookingStatus(id, 'cancelled');
            showToast(`Booking ${id} marked as cancelled.`, 'info');
            updateMetrics();
            renderBookingsTable();
          }
        });
      });
    });

    initIcons();
  }

  // 3. Render Hotels Inventory Table
  function renderHotelsTable() {
    const hotels = getStoredHotels();

    hotelsTbody.innerHTML = hotels.map(h => `
      <tr>
        <td>#${h.id}</td>
        <td>
          <div style="display: flex; gap: 10px; align-items: center;">
            <img src="${escapeHTML(h.image)}" alt="${escapeHTML(h.name)}" style="width: 50px; height: 40px; object-fit: cover; border-radius: var(--radius-xs);" onerror="this.src=FALLBACK_IMAGE">
            <div>
              <a href="hotel.html?id=${h.id}" target="_blank" style="font-weight: 600; color: var(--navy);">${escapeHTML(h.name)}</a>
              <div style="font-size: 0.78rem; color: var(--charcoal);">${escapeHTML(h.roomType || 'Deluxe Suite')}</div>
            </div>
          </div>
        </td>
        <td>${escapeHTML(h.city)}</td>
        <td><strong>${formatCurrency(h.pricePerNight)}</strong></td>
        <td><span style="color: var(--sage); font-weight: 700;">${h.rating} ★</span></td>
        <td>${h.capacity} Guests</td>
        <td><span class="amenity-pill">${escapeHTML(h.availability || 'Available')}</span></td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button type="button" class="btn btn-secondary btn-sm edit-hotel-btn" data-id="${h.id}" style="padding: 4px 8px; font-size: 0.75rem;">
              Edit
            </button>
            <button type="button" class="btn btn-danger btn-sm delete-hotel-btn" data-id="${h.id}" data-name="${escapeHTML(h.name)}" style="padding: 4px 8px; font-size: 0.75rem;">
              Delete
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Attach Edit and Delete listeners
    document.querySelectorAll('.edit-hotel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openHotelModal(id);
      });
    });

    document.querySelectorAll('.delete-hotel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        const name = btn.getAttribute('data-name');
        openModal({
          title: 'Delete Hotel Property?',
          content: `<p>Are you sure you want to delete <strong>${escapeHTML(name)}</strong> from your local browser dataset? This action cannot be undone.</p>`,
          confirmText: 'Delete Property',
          isDanger: true,
          onConfirm: () => {
            const currentHotels = getStoredHotels().filter(h => Number(h.id) !== id);
            saveStoredHotels(currentHotels);

            if (window.StayscapeAPI) {
              window.StayscapeAPI.deleteHotel(id).catch(err => console.warn(err));
            }

            showToast(`Deleted "${name}" from portfolio.`, 'info');
            updateMetrics();
            renderHotelsTable();
          }
        });
      });
    });

    initIcons();
  }

  // 4. Hotel Add / Edit Modal System
  function openHotelModal(editId = null) {
    const isEditing = editId !== null;
    const hotel = isEditing ? getHotelById(editId) : {
      name: '',
      city: 'Goa',
      location: '',
      pricePerNight: 12000,
      rating: 4.8,
      stars: 5,
      capacity: 2,
      roomType: 'Deluxe Suite',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      description: 'A serene luxury boutique resort featuring handcrafted furnishings and panoramic views.'
    };

    const modalContent = `
      <form id="admin-hotel-form">
        <div class="form-group">
          <label for="form-hotel-name" class="form-label">Hotel Name <span class="required-star">*</span></label>
          <input type="text" id="form-hotel-name" class="form-input" value="${escapeHTML(hotel.name)}" required placeholder="e.g. The Grand Azure Sanctuary">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
          <div class="form-group">
            <label for="form-hotel-city" class="form-label">Destination City <span class="required-star">*</span></label>
            <select id="form-hotel-city" class="form-select">
              ${['Goa', 'Jaipur', 'Manali', 'Mumbai', 'Bengaluru', 'Udaipur', 'Noida', 'Delhi'].map(c => `
                <option value="${c}" ${hotel.city === c ? 'selected' : ''}>${c}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label for="form-hotel-price" class="form-label">Price per Night (INR) <span class="required-star">*</span></label>
            <input type="number" id="form-hotel-price" class="form-input" value="${hotel.pricePerNight}" min="1000" step="500" required>
          </div>
        </div>

        <div class="form-group">
          <label for="form-hotel-location" class="form-label">Full Location / Address</label>
          <input type="text" id="form-hotel-location" class="form-input" value="${escapeHTML(hotel.location || '')}" placeholder="e.g. Cavelossim Beach, South Goa">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-md);">
          <div class="form-group">
            <label for="form-hotel-stars" class="form-label">Star Rating</label>
            <select id="form-hotel-stars" class="form-select">
              <option value="5" ${hotel.stars === 5 ? 'selected' : ''}>5 Stars</option>
              <option value="4" ${hotel.stars === 4 ? 'selected' : ''}>4 Stars</option>
              <option value="3" ${hotel.stars === 3 ? 'selected' : ''}>3 Stars</option>
            </select>
          </div>

          <div class="form-group">
            <label for="form-hotel-rating" class="form-label">Review Score</label>
            <input type="number" id="form-hotel-rating" class="form-input" value="${hotel.rating || 4.8}" step="0.1" min="3.0" max="5.0">
          </div>

          <div class="form-group">
            <label for="form-hotel-capacity" class="form-label">Max Guests</label>
            <input type="number" id="form-hotel-capacity" class="form-input" value="${hotel.capacity || 2}" min="1" max="10">
          </div>
        </div>

        <div class="form-group">
          <label for="form-hotel-roomtype" class="form-label">Room Type</label>
          <input type="text" id="form-hotel-roomtype" class="form-input" value="${escapeHTML(hotel.roomType || 'Deluxe Suite')}">
        </div>

        <div class="form-group">
          <label for="form-hotel-image" class="form-label">Image URL / Local Path</label>
          <input type="text" id="form-hotel-image" class="form-input" value="${escapeHTML(hotel.image || '')}" placeholder="assets/images/... or https://...">
        </div>

        <div class="form-group">
          <label for="form-hotel-desc" class="form-label">Description</label>
          <textarea id="form-hotel-desc" class="form-textarea" rows="3">${escapeHTML(hotel.description || '')}</textarea>
        </div>
      </form>
    `;

    openModal({
      title: isEditing ? `Edit "${hotel.name}"` : 'Add New Stay to Portfolio',
      content: modalContent,
      confirmText: isEditing ? 'Save Changes' : 'Add Property',
      onConfirm: () => {
        const nameVal = document.getElementById('form-hotel-name').value.trim();
        const cityVal = document.getElementById('form-hotel-city').value;
        const priceVal = parseInt(document.getElementById('form-hotel-price').value, 10) || 10000;
        const locVal = document.getElementById('form-hotel-location').value.trim() || `${cityVal}, India`;
        const starsVal = parseInt(document.getElementById('form-hotel-stars').value, 10) || 5;
        const ratingVal = parseFloat(document.getElementById('form-hotel-rating').value) || 4.8;
        const capVal = parseInt(document.getElementById('form-hotel-capacity').value, 10) || 2;
        const roomVal = document.getElementById('form-hotel-roomtype').value.trim() || 'Premier Suite';
        const imgVal = document.getElementById('form-hotel-image').value.trim() || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
        const descVal = document.getElementById('form-hotel-desc').value.trim() || 'An authentic retreat designed for relaxation and discovery.';

        if (!nameVal) {
          showToast('Property name is required.', 'error');
          return;
        }

        const currentHotels = getStoredHotels();

        if (isEditing) {
          const idx = currentHotels.findIndex(h => String(h.id) === String(editId));
          const updatedPayload = {
            name: nameVal,
            city: cityVal,
            location: locVal,
            pricePerNight: priceVal,
            stars: starsVal,
            rating: ratingVal,
            capacity: capVal,
            roomType: roomVal,
            image: imgVal,
            description: descVal
          };

          if (idx !== -1) {
            currentHotels[idx] = {
              ...currentHotels[idx],
              ...updatedPayload
            };
            saveStoredHotels(currentHotels);
            showToast(`Updated "${nameVal}" successfully!`, 'success');
          }

          if (window.StayscapeAPI) {
            window.StayscapeAPI.updateHotel(editId, updatedPayload).catch(err => console.warn(err));
          }
        } else {
          const newId = Date.now();
          const newHotel = {
            id: newId,
            name: nameVal,
            tagline: 'Handpicked luxury retreat',
            city: cityVal,
            location: locVal,
            pricePerNight: priceVal,
            stars: starsVal,
            rating: ratingVal,
            reviewCount: 42,
            capacity: capVal,
            roomType: roomVal,
            image: imgVal,
            gallery: [imgVal],
            description: descVal,
            amenities: ['Free High-Speed WiFi', 'Infinity Pool', 'Complimentary Gourmet Breakfast', 'Valet Parking'],
            houseRules: ['Government ID required at check-in', 'Non-smoking premises'],
            availability: 'Available',
            featured: false
          };
          currentHotels.unshift(newHotel);
          saveStoredHotels(currentHotels);

          if (window.StayscapeAPI) {
            window.StayscapeAPI.createHotel(newHotel).then(res => {
              if (res && res.success && res.data) {
                console.log('[Admin] Hotel persisted in backend database:', res.data.id);
              }
            }).catch(err => console.warn(err));
          }

          showToast(`Added "${nameVal}" to portfolio!`, 'success');
        }

        updateMetrics();
        renderHotelsTable();
      }
    });
  }

  if (addHotelBtn1) addHotelBtn1.addEventListener('click', () => openHotelModal(null));
  if (addHotelBtn2) addHotelBtn2.addEventListener('click', () => openHotelModal(null));

  // 5. Reset to Default Sample Data
  if (resetDataBtn) {
    resetDataBtn.addEventListener('click', () => {
      openModal({
        title: 'Reset All Sample Data?',
        content: `
          <p>This will restore the original 14 curated hotels and initial demo bookings both locally and in the backend database.</p>
        `,
        confirmText: 'Reset Sample Data',
        isDanger: true,
        onConfirm: () => {
          safeSetStorage(STORAGE_KEYS.HOTELS, SAMPLE_HOTELS);
          safeSetStorage(STORAGE_KEYS.BOOKINGS, INITIAL_DEMO_BOOKINGS);

          if (window.StayscapeAPI) {
            window.StayscapeAPI.resetDatabase().then(res => {
              console.log('[Admin] Backend database restored to factory defaults');
            }).catch(err => console.warn(err));
          }

          showToast('Sample dataset restored to factory defaults.', 'success');
          updateMetrics();
          renderBookingsTable();
          renderHotelsTable();
        }
      });
    });
  }

  // 6. Tab Navigation Handling
  tabBtnBookings.addEventListener('click', () => {
    tabBtnBookings.classList.add('is-active');
    tabBtnBookings.setAttribute('aria-selected', 'true');
    tabBtnHotels.classList.remove('is-active');
    tabBtnHotels.setAttribute('aria-selected', 'false');
    sectionBookings.style.display = 'block';
    sectionHotels.style.display = 'none';
  });

  tabBtnHotels.addEventListener('click', () => {
    tabBtnHotels.classList.add('is-active');
    tabBtnHotels.setAttribute('aria-selected', 'true');
    tabBtnBookings.classList.remove('is-active');
    tabBtnBookings.setAttribute('aria-selected', 'false');
    sectionHotels.style.display = 'block';
    sectionBookings.style.display = 'none';
  });

  // Table Search and Filters
  bookingSearch.addEventListener('input', renderBookingsTable);
  bookingFilter.addEventListener('change', renderBookingsTable);

  // Initialize
  updateMetrics();
  renderBookingsTable();
  renderHotelsTable();
});
