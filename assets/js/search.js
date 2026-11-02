/**
 * STAYSCAPE — Search & Discovery Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  renderHeader('search');
  renderFooter();

  // Elements
  const topForm = document.getElementById('modify-search-form');
  const citySelect = document.getElementById('top-search-city');
  const checkInInput = document.getElementById('top-search-checkin');
  const checkOutInput = document.getElementById('top-search-checkout');
  const guestsSelect = document.getElementById('top-search-guests');
  
  const cityFilterList = document.getElementById('city-filter-list');
  const amenitiesFilterList = document.getElementById('amenities-filter-list');
  const priceSlider = document.getElementById('price-range-slider');
  const priceDisplay = document.getElementById('price-slider-display');
  const sortSelect = document.getElementById('sort-select');
  const resetBtn = document.getElementById('reset-filters-btn');
  const emptyResetBtn = document.getElementById('empty-state-reset-btn');
  
  const resultsTitle = document.getElementById('results-title');
  const criteriaHint = document.getElementById('search-criteria-hint');
  const grid = document.getElementById('search-hotels-grid');
  const emptyState = document.getElementById('search-empty-state');

  // Parse Initial URL Query Params
  const urlParams = new URLSearchParams(window.location.search);
  const initialCity = urlParams.get('city') || '';
  const initialCheckIn = urlParams.get('checkin') || getTodayDateString(2);
  const initialCheckOut = urlParams.get('checkout') || getTodayDateString(5);
  const initialGuests = parseInt(urlParams.get('guests'), 10) || 2;
  const initialSort = urlParams.get('sort') || 'recommended';

  // Set Top Form Inputs
  if (citySelect) citySelect.value = initialCity;
  if (checkInInput) {
    checkInInput.min = getTodayDateString();
    checkInInput.value = initialCheckIn;
  }
  if (checkOutInput) {
    checkOutInput.min = getTodayDateString(1);
    checkOutInput.value = initialCheckOut;
  }
  if (guestsSelect) guestsSelect.value = String(initialGuests);
  if (sortSelect) sortSelect.value = initialSort;

  // Ensure check-out remains strictly after check-in
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
  });

  // Collect All Available Cities & Amenities from dataset
  const allHotels = getStoredHotels();
  const cityCounts = {};
  const allAmenitiesSet = new Set();

  allHotels.forEach(h => {
    cityCounts[h.city] = (cityCounts[h.city] || 0) + 1;
    (h.amenities || []).forEach(a => allAmenitiesSet.add(a));
  });

  // Populate Destination Checkbox List
  const cities = ['Goa', 'Jaipur', 'Manali', 'Mumbai', 'Bengaluru', 'Udaipur', 'Noida', 'Delhi'];
  if (cityFilterList) {
    cityFilterList.innerHTML = cities.map(city => {
      const count = cityCounts[city] || 0;
      const isChecked = initialCity.toLowerCase() === city.toLowerCase();
      return `
        <label class="form-checkbox-label">
          <input type="checkbox" name="city-filter" value="${escapeHTML(city)}" ${isChecked ? 'checked' : ''}>
          <span>${escapeHTML(city)}</span>
          <span style="font-size: 0.75rem; color: var(--charcoal); margin-left: auto;">(${count})</span>
        </label>
      `;
    }).join('');
  }

  // Populate Curated Amenities Checkbox List
  const keyAmenities = [
    'Free High-Speed WiFi',
    'Infinity Pool',
    'Ayurvedic Spa',
    'Ocean View',
    'Complimentary Gourmet Breakfast',
    'Valet Parking',
    'Cocktail Lounge',
    'Fine Dining Restaurant',
    'Pet Friendly'
  ];

  if (amenitiesFilterList) {
    amenitiesFilterList.innerHTML = keyAmenities.map(amenity => `
      <label class="form-checkbox-label">
        <input type="checkbox" name="amenity-filter" value="${escapeHTML(amenity)}">
        <span>${escapeHTML(amenity)}</span>
      </label>
    `).join('');
  }

  // Live Slider Value Display
  priceSlider.addEventListener('input', () => {
    priceDisplay.textContent = formatCurrency(priceSlider.value);
    applyFilters();
  });

  // Filter & Render Function
  function applyFilters() {
    const selectedCities = Array.from(document.querySelectorAll('input[name="city-filter"]:checked')).map(cb => cb.value.toLowerCase());
    const maxPrice = Number(priceSlider.value) || 30000;
    const ratingRadio = document.querySelector('input[name="rating-filter"]:checked');
    const minRating = ratingRadio ? parseFloat(ratingRadio.value) : 0;
    const selectedAmenities = Array.from(document.querySelectorAll('input[name="amenity-filter"]:checked')).map(cb => cb.value);
    const selectedGuests = parseInt(guestsSelect.value, 10) || 1;
    const sortMode = sortSelect.value;

    let filtered = allHotels.filter(hotel => {
      // City Match
      if (selectedCities.length > 0) {
        if (!selectedCities.includes(hotel.city.toLowerCase())) {
          return false;
        }
      }
      // Price Match
      if (hotel.pricePerNight > maxPrice) {
        return false;
      }
      // Rating Match
      if (hotel.rating < minRating) {
        return false;
      }
      // Capacity Match
      if (hotel.capacity < selectedGuests) {
        return false;
      }
      // Amenities Match (Must have all selected)
      if (selectedAmenities.length > 0) {
        const hasAll = selectedAmenities.every(a => (hotel.amenities || []).includes(a));
        if (!hasAll) return false;
      }
      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (sortMode === 'price-asc') return a.pricePerNight - b.pricePerNight;
      if (sortMode === 'price-desc') return b.pricePerNight - a.pricePerNight;
      if (sortMode === 'rating-desc') return b.rating - a.rating;
      // Recommended: featured first, then rating
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.rating - a.rating;
    });

    // Save Last Search
    saveLastSearch({
      city: selectedCities.length === 1 ? selectedCities[0] : '',
      checkIn: checkInInput.value,
      checkOut: checkOutInput.value,
      guests: selectedGuests
    });

    // Update Counts & Title
    const destinationLabel = selectedCities.length === 1 ?
      selectedCities[0].charAt(0).toUpperCase() + selectedCities[0].slice(1) :
      (selectedCities.length > 1 ? `${selectedCities.length} Selected Destinations` : 'All Destinations');

    resultsTitle.textContent = `Showing ${filtered.length} ${filtered.length === 1 ? 'stay' : 'stays'} in ${destinationLabel}`;
    
    const nights = calculateNights(checkInInput.value, checkOutInput.value);
    criteriaHint.textContent = `${formatDate(checkInInput.value)} – ${formatDate(checkOutInput.value)} (${nights} ${nights === 1 ? 'night' : 'nights'}), ${selectedGuests} ${selectedGuests === 1 ? 'guest' : 'guests'}`;

    // Render Grid or Empty State
    if (filtered.length === 0) {
      grid.style.display = 'none';
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
      grid.style.display = 'grid';

      // Build cards with custom detail URL retaining date and guest context
      grid.innerHTML = filtered.map(hotel => {
        const cardHtml = renderHotelCard(hotel);
        // Inject checkin/checkout/guests into the details link
        const detailQuery = `checkin=${encodeURIComponent(checkInInput.value)}&checkout=${encodeURIComponent(checkOutInput.value)}&guests=${selectedGuests}`;
        return cardHtml.replace(/hotel\.html\?id=(\d+)/g, `hotel.html?id=$1&${detailQuery}`);
      }).join('');
    }

    initIcons();
  }

  // Event Listeners for Filters
  document.querySelectorAll('input[name="city-filter"]').forEach(cb => {
    cb.addEventListener('change', () => {
      // Sync top city select
      const checked = Array.from(document.querySelectorAll('input[name="city-filter"]:checked'));
      if (checked.length === 1) {
        citySelect.value = checked[0].value;
      } else {
        citySelect.value = '';
      }
      applyFilters();
    });
  });

  document.querySelectorAll('input[name="rating-filter"]').forEach(rb => {
    rb.addEventListener('change', applyFilters);
  });

  document.querySelectorAll('input[name="amenity-filter"]').forEach(cb => {
    cb.addEventListener('change', applyFilters);
  });

  sortSelect.addEventListener('change', applyFilters);

  // Top Search Form Submission
  topForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = citySelect.value;
    document.querySelectorAll('input[name="city-filter"]').forEach(cb => {
      cb.checked = city ? (cb.value.toLowerCase() === city.toLowerCase()) : false;
    });
    applyFilters();
    showToast('Search criteria updated.', 'info');
  });

  // Reset Filters Handlers
  function resetAllFilters() {
    document.querySelectorAll('input[name="city-filter"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('input[name="amenity-filter"]').forEach(cb => cb.checked = false);
    const defaultRating = document.querySelector('input[name="rating-filter"][value="0"]');
    if (defaultRating) defaultRating.checked = true;
    priceSlider.value = 30000;
    priceDisplay.textContent = '₹30,000';
    sortSelect.value = 'recommended';
    citySelect.value = '';
    applyFilters();
    showToast('Filters have been reset.', 'info');
  }

  if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);
  if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetAllFilters);

  // Initial Filter Application
  applyFilters();
});
