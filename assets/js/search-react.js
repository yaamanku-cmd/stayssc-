/**
 * STAYSCAPE — React 18 Search & Discovery Application
 * Components:
 * - SearchApp (Root Container)
 * - TopSearchBar (Destination, Dates, Guests)
 * - FiltersSidebar (City counts, Price Slider & Presets, Star Ratings, Amenities)
 * - ActiveFilterChips (Removable tags for active filters)
 * - ResultsControlsBar (Counts, Grid/List switcher, Sort dropdown)
 * - HotelCardGrid & HotelCardList (Two responsive layout modes)
 * - QuickViewModal (Image gallery, details, pricing calculator, direct reserve)
 * - ComparisonDock & ComparisonModal (Side-by-side comparison of up to 3 stays)
 * - EmptyState (Guidance & reset button)
 */

(function () {
  'use strict';

  const { useState, useEffect, useMemo, useCallback } = React;
  const h = React.createElement;

  // Curated list of destination cities and key amenities
  const POPULAR_CITIES = ['Goa', 'Jaipur', 'Manali', 'Mumbai', 'Bengaluru', 'Udaipur', 'Noida', 'Delhi'];
  const POPULAR_AMENITIES = [
    'Free High-Speed WiFi',
    'Infinity Pool',
    'Ayurvedic Spa',
    'Ocean View',
    'Complimentary Gourmet Breakfast',
    'Valet Parking',
    'Pet Friendly'
  ];

  /**
   * Calculate Stay Pricing breakdown (Base, GST taxes, Service fee, Total)
   */
  function calculateStayPricing(pricePerNight, nights, rooms = 1) {
    const safeNights = Math.max(1, Number(nights) || 1);
    const safeRooms = Math.max(1, Number(rooms) || 1);
    const basePrice = (Number(pricePerNight) || 0) * safeNights * safeRooms;
    const taxes = Math.round(basePrice * 0.12);
    const serviceFee = 750;
    const total = basePrice + taxes + serviceFee;
    return {
      nights: safeNights,
      rooms: safeRooms,
      basePrice,
      taxes,
      serviceFee,
      total
    };
  }
  window.calculateStayPricing = calculateStayPricing;

  /* --------------------------------------------------------------------------
     1. Inline Vector Icon Helper (Synchronous, crisp, zero-flicker SVGs)
     -------------------------------------------------------------------------- */

  function Icon({ name, size = 16, className = '', color = 'currentColor', style = {} }) {
    const iconProps = {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: color,
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      className: `react-icon ${className}`,
      style: { display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }
    };

    switch (name) {
      case 'map-pin':
        return h('svg', iconProps,
          h('path', { d: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' }),
          h('circle', { cx: '12', cy: '10', r: '3' })
        );
      case 'calendar':
        return h('svg', iconProps,
          h('rect', { width: '18', height: '18', x: '3', y: '4', rx: '2', ry: '2' }),
          h('line', { x1: '16', x2: '16', y1: '2', y2: '6' }),
          h('line', { x1: '8', x2: '8', y1: '2', y2: '6' }),
          h('line', { x1: '3', x2: '21', y1: '10', y2: '10' })
        );
      case 'calendar-check':
        return h('svg', iconProps,
          h('rect', { width: '18', height: '18', x: '3', y: '4', rx: '2', ry: '2' }),
          h('line', { x1: '16', x2: '16', y1: '2', y2: '6' }),
          h('line', { x1: '8', x2: '8', y1: '2', y2: '6' }),
          h('line', { x1: '3', x2: '21', y1: '10', y2: '10' }),
          h('path', { d: 'm9 16 2 2 4-4' })
        );
      case 'users':
        return h('svg', iconProps,
          h('path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }),
          h('circle', { cx: '9', cy: '7', r: '4' }),
          h('path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87' }),
          h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
        );
      case 'star':
        return h('svg', { ...iconProps, fill: color, stroke: color },
          h('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' })
        );
      case 'heart':
        return h('svg', iconProps,
          h('path', { d: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z' })
        );
      case 'heart-filled':
        return h('svg', { ...iconProps, fill: '#E74C3C', stroke: '#E74C3C' },
          h('path', { d: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z' })
        );
      case 'sliders-horizontal':
        return h('svg', iconProps,
          h('line', { x1: '21', x2: '14', y1: '4', y2: '4' }),
          h('line', { x1: '10', x2: '3', y1: '4', y2: '4' }),
          h('line', { x1: '21', x2: '12', y1: '12', y2: '12' }),
          h('line', { x1: '8', x2: '3', y1: '12', y2: '12' }),
          h('line', { x1: '21', x2: '16', y1: '20', y2: '20' }),
          h('line', { x1: '12', x2: '3', y1: '20', y2: '20' }),
          h('line', { x1: '14', x2: '14', y1: '2', y2: '6' }),
          h('line', { x1: '8', x2: '8', y1: '10', y2: '14' }),
          h('line', { x1: '16', x2: '16', y1: '18', y2: '22' })
        );
      case 'grid':
        return h('svg', iconProps,
          h('rect', { width: '7', height: '7', x: '3', y: '3', rx: '1' }),
          h('rect', { width: '7', height: '7', x: '14', y: '3', rx: '1' }),
          h('rect', { width: '7', height: '7', x: '14', y: '14', rx: '1' }),
          h('rect', { width: '7', height: '7', x: '3', y: '14', rx: '1' })
        );
      case 'list':
        return h('svg', iconProps,
          h('line', { x1: '8', x2: '21', y1: '6', y2: '6' }),
          h('line', { x1: '8', x2: '21', y1: '12', y2: '12' }),
          h('line', { x1: '8', x2: '21', y1: '18', y2: '18' }),
          h('line', { x1: '3', x2: '3.01', y1: '6', y2: '6' }),
          h('line', { x1: '3', x2: '3.01', y1: '12', y2: '12' }),
          h('line', { x1: '3', x2: '3.01', y1: '18', y2: '18' })
        );
      case 'scale':
        return h('svg', iconProps,
          h('path', { d: 'm16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z' }),
          h('path', { d: 'm2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z' }),
          h('path', { d: 'M7 21h10' }),
          h('path', { d: 'M12 3v18' }),
          h('path', { d: 'M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2' })
        );
      case 'eye':
        return h('svg', iconProps,
          h('path', { d: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' }),
          h('circle', { cx: '12', cy: '12', r: '3' })
        );
      case 'arrow-right':
        return h('svg', iconProps,
          h('path', { d: 'M5 12h14' }),
          h('path', { d: 'm12 5 7 7-7 7' })
        );
      case 'check':
        return h('svg', iconProps,
          h('path', { d: 'M20 6 9 17l-5-5' })
        );
      case 'x':
        return h('svg', iconProps,
          h('path', { d: 'M18 6 6 18' }),
          h('path', { d: 'm6 6 12 12' })
        );
      case 'refresh-cw':
        return h('svg', iconProps,
          h('path', { d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' }),
          h('path', { d: 'M21 3v5h-5' }),
          h('path', { d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' }),
          h('path', { d: 'M8 16H3v5' })
        );
      case 'wifi':
        return h('svg', iconProps,
          h('path', { d: 'M12 20h.01' }),
          h('path', { d: 'M2 8.82a15 15 0 0 1 20 0' }),
          h('path', { d: 'M5 12.859a10 10 0 0 1 14 0' }),
          h('path', { d: 'M8.5 16.429a5 5 0 0 1 7 0' })
        );
      default:
        return h('span', { className: 'icon-fallback' }, '•');
    }
  }

  /* --------------------------------------------------------------------------
     2. Top Search Bar Component
     -------------------------------------------------------------------------- */
  function TopSearchBar({ searchParams, onSearchSubmit }) {
    const [city, setCity] = useState(searchParams.city || '');
    const [checkIn, setCheckIn] = useState(searchParams.checkIn);
    const [checkOut, setCheckOut] = useState(searchParams.checkOut);
    const [guests, setGuests] = useState(searchParams.guests || 2);

    // Keep state aligned if external searchParams change
    useEffect(() => {
      setCity(searchParams.city || '');
      setCheckIn(searchParams.checkIn);
      setCheckOut(searchParams.checkOut);
      setGuests(searchParams.guests || 2);
    }, [searchParams]);

    const handleCheckInChange = (e) => {
      const newIn = e.target.value;
      setCheckIn(newIn);
      if (newIn) {
        const parts = newIn.split('-').map(Number);
        const nextDay = new Date(parts[0], parts[1] - 1, parts[2] + 1);
        const nextDayStr = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
        if (checkOut <= newIn) {
          setCheckOut(nextDayStr);
        }
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSearchSubmit({ city, checkIn, checkOut, guests: Number(guests) });
    };

    return h('section', { className: 'search-top-bar', 'aria-label': 'Modify search criteria' },
      h('div', { className: 'container' },
        h('form', { className: 'top-search-form', onSubmit: handleSubmit },
          // Destination
          h('div', { className: 'search-field-box' },
            h('label', { className: 'search-field-label', htmlFor: 'react-search-city' },
              h(Icon, { name: 'map-pin', size: 13, color: 'var(--copper)' }),
              h('span', null, 'Destination')
            ),
            h('select', {
              id: 'react-search-city',
              className: 'search-field-select',
              value: city,
              onChange: (e) => setCity(e.target.value)
            },
              h('option', { value: '' }, 'All Destinations (India)'),
              POPULAR_CITIES.map(c => h('option', { key: c, value: c }, c))
            )
          ),

          // Check-In
          h('div', { className: 'search-field-box' },
            h('label', { className: 'search-field-label', htmlFor: 'react-search-checkin' },
              h(Icon, { name: 'calendar', size: 13, color: 'var(--copper)' }),
              h('span', null, 'Check-In')
            ),
            h('input', {
              type: 'date',
              id: 'react-search-checkin',
              className: 'search-field-input',
              min: getTodayDateString(),
              value: checkIn,
              onChange: handleCheckInChange,
              required: true
            })
          ),

          // Check-Out
          h('div', { className: 'search-field-box' },
            h('label', { className: 'search-field-label', htmlFor: 'react-search-checkout' },
              h(Icon, { name: 'calendar-check', size: 13, color: 'var(--copper)' }),
              h('span', null, 'Check-Out')
            ),
            h('input', {
              type: 'date',
              id: 'react-search-checkout',
              className: 'search-field-input',
              min: checkIn || getTodayDateString(1),
              value: checkOut,
              onChange: (e) => setCheckOut(e.target.value),
              required: true
            })
          ),

          // Guests
          h('div', { className: 'search-field-box' },
            h('label', { className: 'search-field-label', htmlFor: 'react-search-guests' },
              h(Icon, { name: 'users', size: 13, color: 'var(--copper)' }),
              h('span', null, 'Guests')
            ),
            h('select', {
              id: 'react-search-guests',
              className: 'search-field-select',
              value: guests,
              onChange: (e) => setGuests(Number(e.target.value))
            },
              h('option', { value: 1 }, '1 Guest'),
              h('option', { value: 2 }, '2 Guests'),
              h('option', { value: 3 }, '3 Guests'),
              h('option', { value: 4 }, '4 Guests')
            )
          ),

          // Submit CTA
          h('div', { className: 'btn-search-col' },
            h('button', { type: 'submit', className: 'btn btn-primary', style: { height: '100%', width: '100%' } },
              h(Icon, { name: 'refresh-cw', size: 16 }),
              h('span', null, 'Update Stays')
            )
          )
        )
      )
    );
  }

  /* --------------------------------------------------------------------------
     3. Active Filter Chips Component
     -------------------------------------------------------------------------- */
  function ActiveFilterChips({ filters, onRemoveCity, onClearPrice, onClearRating, onRemoveAmenity, onClearAll }) {
    const hasActiveFilters =
      filters.cities.length > 0 ||
      filters.maxPrice < 30000 ||
      filters.minRating > 0 ||
      filters.amenities.length > 0;

    if (!hasActiveFilters) return null;

    return h('div', { className: 'active-chips-bar' },
      h('span', { className: 'active-chips-label' }, 'Active Filters:'),

      // City chips
      filters.cities.map(city =>
        h('span', { key: `city-${city}`, className: 'active-chip' },
          h(Icon, { name: 'map-pin', size: 12, color: 'var(--copper)' }),
          h('span', null, city.charAt(0).toUpperCase() + city.slice(1)),
          h('button', {
            type: 'button',
            className: 'active-chip-remove',
            onClick: () => onRemoveCity(city),
            'aria-label': `Remove ${city} filter`
          }, '×')
        )
      ),

      // Price chip
      filters.maxPrice < 30000 && h('span', { className: 'active-chip' },
        h('span', null, `Up to ${formatCurrency(filters.maxPrice)}`),
        h('button', {
          type: 'button',
          className: 'active-chip-remove',
          onClick: onClearPrice,
          'aria-label': 'Clear price filter'
        }, '×')
      ),

      // Rating chip
      filters.minRating > 0 && h('span', { className: 'active-chip' },
        h(Icon, { name: 'star', size: 12, color: 'var(--copper)' }),
        h('span', null, `${filters.minRating}★ & above`),
        h('button', {
          type: 'button',
          className: 'active-chip-remove',
          onClick: onClearRating,
          'aria-label': 'Clear rating filter'
        }, '×')
      ),

      // Amenity chips
      filters.amenities.map(amenity =>
        h('span', { key: `amenity-${amenity}`, className: 'active-chip' },
          h('span', null, amenity),
          h('button', {
            type: 'button',
            className: 'active-chip-remove',
            onClick: () => onRemoveAmenity(amenity),
            'aria-label': `Remove ${amenity} filter`
          }, '×')
        )
      ),

      // Clear all text button
      h('button', {
        type: 'button',
        className: 'active-chips-clear-all',
        onClick: onClearAll
      }, 'Reset all')
    );
  }

  /* --------------------------------------------------------------------------
     4. Filters Sidebar Component
     -------------------------------------------------------------------------- */
  function FiltersSidebar({
    cities,
    cityCounts,
    selectedCities,
    onToggleCity,
    maxPrice,
    onPriceChange,
    rating,
    onRatingChange,
    amenities,
    selectedAmenities,
    onToggleAmenity,
    onResetAll
  }) {
    // Quick price preset buttons
    const presets = [
      { label: 'All', value: 30000 },
      { label: '< ₹12k', value: 12000 },
      { label: '₹12k - ₹20k', value: 20000 },
      { label: 'Luxury (₹25k+)', value: 30000 }
    ];

    return h('aside', { className: 'filters-sidebar', 'aria-label': 'Discovery Filters' },
      // Header
      h('div', { className: 'filters-header' },
        h('h2', { className: 'filters-title' },
          h(Icon, { name: 'sliders-horizontal', size: 18, color: 'var(--copper)' }),
          h('span', null, 'Filters')
        ),
        h('button', {
          type: 'button',
          className: 'btn btn-sm btn-outline',
          style: { padding: '4px 10px', fontSize: '0.78rem' },
          onClick: onResetAll
        }, 'Reset All')
      ),

      // Destinations Filter
      h('div', { className: 'filter-group' },
        h('div', { className: 'filter-label' }, 'Destination'),
        h('div', { className: 'filter-checkbox-list' },
          cities.map(cityName => {
            const count = cityCounts[cityName] || 0;
            const isChecked = selectedCities.includes(cityName.toLowerCase());
            return h('label', { key: cityName, className: 'form-checkbox-label' },
              h('input', {
                type: 'checkbox',
                value: cityName,
                checked: isChecked,
                onChange: () => onToggleCity(cityName)
              }),
              h('span', null, cityName),
              h('span', { style: { fontSize: '0.75rem', color: 'var(--charcoal)', marginLeft: 'auto' } }, `(${count})`)
            );
          })
        )
      ),

      // Max Price Slider with Presets
      h('div', { className: 'filter-group' },
        h('div', { className: 'filter-label' },
          h('span', null, 'Max Price / Night'),
          h('span', { style: { color: 'var(--copper)', fontWeight: 700 } }, formatCurrency(maxPrice))
        ),
        h('input', {
          type: 'range',
          min: 6000,
          max: 30000,
          step: 1000,
          value: maxPrice,
          onChange: (e) => onPriceChange(Number(e.target.value)),
          style: { width: '100%', accentColor: 'var(--copper)', cursor: 'pointer' },
          'aria-label': 'Filter by maximum price per night'
        }),
        h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--charcoal)', marginTop: '4px' } },
          h('span', null, '₹6,000'),
          h('span', null, '₹30,000')
        ),
        // Preset Buttons
        h('div', { className: 'price-presets-list' },
          presets.map(p =>
            h('button', {
              key: p.label,
              type: 'button',
              className: `price-preset-btn ${maxPrice === p.value ? 'is-active' : ''}`,
              onClick: () => onPriceChange(p.value)
            }, p.label)
          )
        )
      ),

      // Star Rating Filter
      h('div', { className: 'filter-group' },
        h('div', { className: 'filter-label' }, 'Minimum Guest Rating'),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
          [
            { value: 0, label: 'Any Rating' },
            { value: 4.5, label: '4.5 ★ & above' },
            { value: 4.8, label: '4.8 ★ & above (Exceptional)' }
          ].map(opt =>
            h('label', { key: opt.value, className: 'form-radio-label' },
              h('input', {
                type: 'radio',
                name: 'react-rating-filter',
                value: opt.value,
                checked: rating === opt.value,
                onChange: () => onRatingChange(opt.value)
              }),
              h('span', null, opt.label)
            )
          )
        )
      ),

      // Curated Amenities
      h('div', { className: 'filter-group' },
        h('div', { className: 'filter-label' }, 'Signature Amenities'),
        h('div', { className: 'filter-checkbox-list' },
          amenities.map(amenity => {
            const isChecked = selectedAmenities.includes(amenity);
            return h('label', { key: amenity, className: 'form-checkbox-label' },
              h('input', {
                type: 'checkbox',
                value: amenity,
                checked: isChecked,
                onChange: () => onToggleAmenity(amenity)
              }),
              h('span', null, amenity)
            );
          })
        )
      )
    );
  }

  /* --------------------------------------------------------------------------
     5. Results Controls Bar Component
     -------------------------------------------------------------------------- */
  function ResultsControlsBar({
    filteredCount,
    destinationLabel,
    searchParams,
    viewMode,
    onChangeViewMode,
    sortMode,
    onChangeSortMode
  }) {
    const nights = calculateNights(searchParams.checkIn, searchParams.checkOut);

    return h('div', { className: 'search-results-bar' },
      h('div', null,
        h('h1', { className: 'search-results-count' },
          `Showing ${filteredCount} ${filteredCount === 1 ? 'stay' : 'stays'} in ${destinationLabel}`
        ),
        h('p', { style: { fontSize: '0.82rem', color: 'var(--charcoal)', marginTop: '2px' } },
          `${formatDate(searchParams.checkIn)} – ${formatDate(searchParams.checkOut)} (${nights} ${nights === 1 ? 'night' : 'nights'}), ${searchParams.guests} ${searchParams.guests === 1 ? 'guest' : 'guests'}`
        )
      ),

      h('div', { style: { display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' } },
        // Grid vs List Toggle Switcher
        h('div', { className: 'view-toggle-group', role: 'group', 'aria-label': 'Layout view switcher' },
          h('button', {
            type: 'button',
            className: `view-toggle-btn ${viewMode === 'grid' ? 'is-active' : ''}`,
            onClick: () => onChangeViewMode('grid'),
            'aria-pressed': viewMode === 'grid',
            title: 'Grid View'
          },
            h(Icon, { name: 'grid', size: 14 }),
            h('span', null, 'Grid')
          ),
          h('button', {
            type: 'button',
            className: `view-toggle-btn ${viewMode === 'list' ? 'is-active' : ''}`,
            onClick: () => onChangeViewMode('list'),
            'aria-pressed': viewMode === 'list',
            title: 'List View'
          },
            h(Icon, { name: 'list', size: 14 }),
            h('span', null, 'List')
          )
        ),

        // Sort Selector
        h('div', { className: 'search-sort-wrapper' },
          h('label', { htmlFor: 'react-sort-select', className: 'search-sort-label' }, 'Sort by:'),
          h('select', {
            id: 'react-sort-select',
            className: 'form-select',
            style: { width: 'auto', padding: '6px 12px', fontSize: '0.88rem' },
            value: sortMode,
            onChange: (e) => onChangeSortMode(e.target.value)
          },
            h('option', { value: 'recommended' }, 'Recommended'),
            h('option', { value: 'price-asc' }, 'Price: Low to High'),
            h('option', { value: 'price-desc' }, 'Price: High to Low'),
            h('option', { value: 'rating-desc' }, 'Guest Rating')
          )
        )
      )
    );
  }

  /* --------------------------------------------------------------------------
     6. Hotel Card (Grid View Mode)
     -------------------------------------------------------------------------- */
  function HotelCardGrid({
    hotel,
    searchParams,
    isFav,
    onToggleFav,
    isCompared,
    onToggleCompare,
    onQuickView
  }) {
    const nights = calculateNights(searchParams.checkIn, searchParams.checkOut);
    const pricing = calculateStayPricing(hotel.pricePerNight, nights, 1);
    const detailUrl = `hotel.html?id=${hotel.id}&checkin=${encodeURIComponent(searchParams.checkIn)}&checkout=${encodeURIComponent(searchParams.checkOut)}&guests=${searchParams.guests}`;

    return h('article', { className: 'hotel-card', 'data-id': hotel.id },
      // Photo Container
      h('div', { className: 'hotel-card-image-box' },
        h('img', {
          src: hotel.image,
          alt: hotel.name,
          className: 'hotel-card-image',
          loading: 'lazy'
        }),
        h('span', { className: 'hotel-card-city-tag' }, hotel.city),

        // Favorite Toggle
        h('button', {
          type: 'button',
          className: `hotel-card-fav-btn ${isFav ? 'is-favourited' : ''}`,
          onClick: () => onToggleFav(hotel.id),
          'aria-label': isFav ? `Remove ${hotel.name} from saved` : `Save ${hotel.name}`
        },
          h(Icon, { name: isFav ? 'heart-filled' : 'heart', size: 18 })
        ),

        // Quick View Hover Trigger Button
        h('button', {
          type: 'button',
          className: 'hotel-card-quick-view-btn',
          onClick: () => onQuickView(hotel)
        },
          h(Icon, { name: 'eye', size: 14 }),
          h('span', null, 'Quick View')
        )
      ),

      // Card Content Body
      h('div', { className: 'hotel-card-body' },
        // Top Meta Row
        h('div', { className: 'hotel-card-meta' },
          h('span', { className: 'rating-badge' },
            h(Icon, { name: 'star', size: 12 }),
            h('span', null, `${hotel.rating.toFixed(1)}`),
            h('span', { style: { fontWeight: 400, opacity: 0.8 } }, `(${hotel.reviewsCount})`)
          ),
          // Compare Checkbox
          h('label', { className: 'hotel-card-compare-label' },
            h('input', {
              type: 'checkbox',
              checked: isCompared,
              onChange: () => onToggleCompare(hotel.id)
            }),
            h('span', null, 'Compare')
          )
        ),

        // Title
        h('h3', { className: 'hotel-card-title' },
          h('a', { href: detailUrl }, hotel.name)
        ),

        // Location & Capacity
        h('p', { className: 'hotel-card-location' },
          h(Icon, { name: 'map-pin', size: 13 }),
          h('span', null, `${hotel.location || hotel.address}, ${hotel.city}`)
        ),

        // Amenities Preview Pills
        h('div', { className: 'hotel-card-amenities' },
          (hotel.amenities || []).slice(0, 3).map(a =>
            h('span', { key: a, className: 'amenity-badge' }, a)
          )
        ),

        // Card Footer
        h('div', { className: 'hotel-card-footer' },
          h('div', { className: 'hotel-card-price' },
            h('span', { className: 'price-amount' }, formatCurrency(hotel.pricePerNight)),
            h('span', { className: 'price-period' }, '/ night'),
            h('div', { style: { fontSize: '0.74rem', color: 'var(--copper)', fontWeight: 600 } },
              `${formatCurrency(pricing.total)} total · ${nights} ${nights === 1 ? 'night' : 'nights'}`
            )
          ),
          h('a', { href: detailUrl, className: 'btn btn-primary btn-sm' }, 'Book Stay')
        )
      )
    );
  }

  /* --------------------------------------------------------------------------
     7. Hotel Card (Horizontal List View Mode)
     -------------------------------------------------------------------------- */
  function HotelCardList({
    hotel,
    searchParams,
    isFav,
    onToggleFav,
    isCompared,
    onToggleCompare,
    onQuickView
  }) {
    const nights = calculateNights(searchParams.checkIn, searchParams.checkOut);
    const pricing = calculateStayPricing(hotel.pricePerNight, nights, 1);
    const detailUrl = `hotel.html?id=${hotel.id}&checkin=${encodeURIComponent(searchParams.checkIn)}&checkout=${encodeURIComponent(searchParams.checkOut)}&guests=${searchParams.guests}`;

    return h('article', { className: 'hotel-card-list-view', 'data-id': hotel.id },
      // Left: Image Box
      h('div', { className: 'list-img-box' },
        h('img', {
          src: hotel.image,
          alt: hotel.name,
          className: 'list-img',
          loading: 'lazy'
        }),
        h('span', { className: 'hotel-card-city-tag' }, hotel.city),

        // Favorite Button
        h('button', {
          type: 'button',
          className: `hotel-card-fav-btn ${isFav ? 'is-favourited' : ''}`,
          onClick: () => onToggleFav(hotel.id),
          'aria-label': isFav ? `Remove ${hotel.name} from saved` : `Save ${hotel.name}`
        },
          h(Icon, { name: isFav ? 'heart-filled' : 'heart', size: 18 })
        ),

        // Quick View Button
        h('button', {
          type: 'button',
          className: 'hotel-card-quick-view-btn',
          onClick: () => onQuickView(hotel)
        },
          h(Icon, { name: 'eye', size: 14 }),
          h('span', null, 'Quick View')
        )
      ),

      // Center: Info Body
      h('div', { className: 'list-body' },
        h('div', null,
          h('div', { className: 'list-title-row' },
            h('h3', { className: 'list-hotel-title' },
              h('a', { href: detailUrl }, hotel.name)
            ),
            h('span', { className: 'rating-badge' },
              h(Icon, { name: 'star', size: 12 }),
              h('span', null, `${hotel.rating.toFixed(1)}`),
              h('span', { style: { fontWeight: 400, opacity: 0.8 } }, `(${hotel.reviewsCount})`)
            )
          ),

          h('p', { className: 'hotel-card-location', style: { marginBottom: '8px' } },
            h(Icon, { name: 'map-pin', size: 13 }),
            h('span', null, `${hotel.location || hotel.address}, ${hotel.city}`)
          ),

          h('p', { className: 'list-desc' },
            hotel.description || 'Experience an unmatched sanctuary crafted for modern travelers with timeless heritage charm.'
          )
        ),

        // Amenities & Specs
        h('div', { className: 'list-amenities-row' },
          h('span', { className: 'list-amenity-tag', style: { backgroundColor: 'var(--sage-light)', color: 'var(--sage-dark)', fontWeight: 600 } },
            h(Icon, { name: 'users', size: 12 }),
            h('span', null, `Up to ${hotel.capacity || 2} Guests`)
          ),
          (hotel.amenities || []).slice(0, 4).map(a =>
            h('span', { key: a, className: 'list-amenity-tag' }, a)
          )
        )
      ),

      // Right: Pricing & CTAs
      h('div', { className: 'list-pricing-col' },
        h('div', { style: { width: '100%' } },
          h('div', { className: 'list-price-amount' }, formatCurrency(hotel.pricePerNight)),
          h('span', { style: { fontSize: '0.8rem', color: 'var(--charcoal)' } }, 'per night + taxes'),
          h('div', { className: 'list-total-stay' },
            `${formatCurrency(pricing.total)} for ${nights} ${nights === 1 ? 'night' : 'nights'}`
          )
        ),

        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '14px' } },
          h('label', { className: 'hotel-card-compare-label', style: { justifyContent: 'center' } },
            h('input', {
              type: 'checkbox',
              checked: isCompared,
              onChange: () => onToggleCompare(hotel.id)
            }),
            h('span', null, 'Add to Compare')
          ),
          h('a', { href: detailUrl, className: 'btn btn-primary btn-sm', style: { textAlign: 'center' } }, 'Book Stay')
        )
      )
    );
  }

  /* --------------------------------------------------------------------------
     8. Quick View Modal Component
     -------------------------------------------------------------------------- */
  function QuickViewModal({ hotel, searchParams, onClose, onBookNow }) {
    if (!hotel) return null;

    const [selectedImg, setSelectedImg] = useState(hotel.image);
    const nights = calculateNights(searchParams.checkIn, searchParams.checkOut);
    const pricing = calculateStayPricing(hotel.pricePerNight, nights, 1);
    const detailUrl = `hotel.html?id=${hotel.id}&checkin=${encodeURIComponent(searchParams.checkIn)}&checkout=${encodeURIComponent(searchParams.checkOut)}&guests=${searchParams.guests}`;

    // Close on Escape key
    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const gallery = [hotel.image, ...(hotel.gallery || [])].filter(Boolean);

    return h('div', { className: 'modal-overlay', onClick: onClose },
      h('div', { className: 'quick-view-box', onClick: (e) => e.stopPropagation() },
        // Close Button
        h('button', {
          type: 'button',
          className: 'quick-view-close',
          onClick: onClose,
          'aria-label': 'Close modal'
        }, '×'),

        h('div', { className: 'quick-view-grid' },
          // Left: Gallery
          h('div', { className: 'quick-view-gallery-col' },
            h('div', { className: 'quick-view-main-img-box' },
              h('img', { src: selectedImg, alt: hotel.name, className: 'quick-view-main-img' })
            ),
            h('div', { className: 'quick-view-thumbs-row' },
              gallery.map((imgUrl, idx) =>
                h('div', {
                  key: idx,
                  className: `quick-view-thumb ${selectedImg === imgUrl ? 'is-active' : ''}`,
                  onClick: () => setSelectedImg(imgUrl)
                },
                  h('img', { src: imgUrl, alt: `${hotel.name} thumb ${idx + 1}` })
                )
              )
            )
          ),

          // Right: Content Details
          h('div', { className: 'quick-view-details-col' },
            h('div', null,
              h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
                h('span', { className: 'rating-badge' },
                  h(Icon, { name: 'star', size: 12 }),
                  h('span', null, `${hotel.rating.toFixed(1)}`),
                  h('span', { style: { opacity: 0.8, fontWeight: 400 } }, `(${hotel.reviewsCount} reviews)`)
                ),
                h('span', { style: { fontSize: '0.8rem', color: 'var(--copper)', fontWeight: 600, textTransform: 'uppercase' } },
                  hotel.city
                )
              ),

              h('h2', { style: { fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--navy)', lineHeight: 1.25, marginBottom: '8px' } },
                hotel.name
              ),

              h('p', { className: 'hotel-card-location', style: { marginBottom: '14px' } },
                h(Icon, { name: 'map-pin', size: 14 }),
                h('span', null, `${hotel.location || hotel.address}, ${hotel.city}`)
              ),

              h('p', { style: { fontSize: '0.92rem', color: 'var(--charcoal)', lineHeight: 1.6, marginBottom: '16px' } },
                hotel.description
              ),

              h('div', { style: { marginBottom: '14px' } },
                h('div', { style: { fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px' } },
                  'Included Signature Amenities'
                ),
                h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px' } },
                  (hotel.amenities || []).map(a =>
                    h('span', { key: a, className: 'list-amenity-tag' },
                      h(Icon, { name: 'check', size: 12, color: 'var(--sage-dark)' }),
                      h('span', null, a)
                    )
                  )
                )
              )
            ),

            // Live Stay Estimate Banner
            h('div', null,
              h('div', { className: 'quick-view-pricing-banner' },
                h('div', null,
                  h('div', { style: { fontSize: '0.78rem', color: 'var(--charcoal)' } },
                    `${nights} nights (${formatDate(searchParams.checkIn)} – ${formatDate(searchParams.checkOut)})`
                  ),
                  h('div', { style: { fontSize: '1.35rem', fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-heading)' } },
                    formatCurrency(pricing.total)
                  ),
                  h('div', { style: { fontSize: '0.74rem', color: 'var(--charcoal-light)' } },
                    `Includes taxes & ${formatCurrency(pricing.serviceFee)} service fee`
                  )
                ),
                h('div', { style: { textAlign: 'right' } },
                  h('div', { style: { fontSize: '1.1rem', fontWeight: 700, color: 'var(--copper)' } },
                    formatCurrency(hotel.pricePerNight)
                  ),
                  h('div', { style: { fontSize: '0.75rem', color: 'var(--charcoal)' } }, 'per night')
                )
              ),

              // Action Buttons
              h('div', { style: { display: 'flex', gap: '10px', marginTop: '16px' } },
                h('a', {
                  href: detailUrl,
                  className: 'btn btn-secondary',
                  style: { flex: 1, textAlign: 'center' }
                }, 'Full Details'),
                h('button', {
                  type: 'button',
                  className: 'btn btn-primary',
                  style: { flex: 1 },
                  onClick: () => onBookNow(hotel)
                }, 'Reserve Stay')
              )
            )
          )
        )
      )
    );
  }

  /* --------------------------------------------------------------------------
     9. Comparison Dock Component (Floating Bottom Pill)
     -------------------------------------------------------------------------- */
  function ComparisonDock({ comparedHotels, onRemove, onClear, onOpenModal }) {
    if (comparedHotels.length === 0) return null;

    return h('div', { className: 'compare-dock', role: 'region', 'aria-label': 'Selected hotels comparison dock' },
      h('div', { className: 'compare-dock-label' },
        h(Icon, { name: 'scale', size: 18, color: 'var(--copper)' }),
        h('span', null, 'Compare Stays'),
        h('span', { className: 'compare-dock-badge' }, `${comparedHotels.length}/3`)
      ),

      // Thumbnails
      h('div', { className: 'compare-dock-thumbs' },
        comparedHotels.map(hItem =>
          h('div', { key: hItem.id, className: 'compare-dock-thumb-wrapper', title: hItem.name },
            h('img', { src: hItem.image, alt: hItem.name, className: 'compare-dock-thumb-img' }),
            h('button', {
              type: 'button',
              className: 'compare-dock-thumb-remove',
              onClick: () => onRemove(hItem.id),
              'aria-label': `Remove ${hItem.name}`
            }, '×')
          )
        )
      ),

      // Actions
      h('div', { className: 'compare-dock-actions' },
        h('button', {
          type: 'button',
          className: 'compare-dock-btn-open',
          onClick: onOpenModal
        },
          h('span', null, 'Compare Now'),
          h(Icon, { name: 'arrow-right', size: 14 })
        ),
        h('button', {
          type: 'button',
          className: 'compare-dock-btn-clear',
          onClick: onClear
        }, 'Clear')
      )
    );
  }

  /* --------------------------------------------------------------------------
     10. Comparison Matrix Modal Component
     -------------------------------------------------------------------------- */
  function ComparisonModal({ hotels, searchParams, onClose }) {
    if (!hotels || hotels.length === 0) return null;

    const nights = calculateNights(searchParams.checkIn, searchParams.checkOut);

    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const featureKeys = [
      { key: 'price', label: 'Price / Night' },
      { key: 'total', label: `Stay Total (${nights}N)` },
      { key: 'rating', label: 'Guest Rating' },
      { key: 'city', label: 'Destination' },
      { key: 'capacity', label: 'Max Guests' },
      { key: 'wifi', label: 'Free High-Speed WiFi', check: true, amenity: 'Free High-Speed WiFi' },
      { key: 'pool', label: 'Infinity Pool', check: true, amenity: 'Infinity Pool' },
      { key: 'spa', label: 'Ayurvedic Spa', check: true, amenity: 'Ayurvedic Spa' },
      { key: 'breakfast', label: 'Gourmet Breakfast', check: true, amenity: 'Complimentary Gourmet Breakfast' },
      { key: 'dining', label: 'Fine Dining', check: true, amenity: 'Fine Dining Restaurant' },
      { key: 'pets', label: 'Pet Friendly', check: true, amenity: 'Pet Friendly' }
    ];

    return h('div', { className: 'modal-overlay', onClick: onClose },
      h('div', { className: 'compare-modal-box', onClick: (e) => e.stopPropagation() },
        // Header
        h('div', { className: 'compare-modal-header' },
          h('h2', { className: 'compare-modal-title' },
            h(Icon, { name: 'scale', size: 22, color: 'var(--copper)', style: { marginRight: '8px' } }),
            `Side-by-Side Stay Comparison (${hotels.length} Stays)`
          ),
          h('button', {
            type: 'button',
            className: 'compare-modal-close',
            onClick: onClose,
            'aria-label': 'Close comparison modal'
          }, '×')
        ),

        // Body Table
        h('div', { className: 'compare-modal-body' },
          h('table', { className: 'compare-matrix-table' },
            h('thead', null,
              h('tr', null,
                h('th', { className: 'feature-col' }, 'Hotel Profile'),
                hotels.map(hItem =>
                  h('th', { key: hItem.id, className: 'hotel-col', style: { width: `${80 / hotels.length}%` } },
                    h('div', { style: { width: '100%', height: '110px', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' } },
                      h('img', { src: hItem.image, alt: hItem.name, style: { width: '100%', height: '100%', objectFit: 'cover' } })
                    ),
                    h('div', { style: { fontFamily: 'var(--font-heading)', fontSize: '1.05rem', color: 'var(--navy)', fontWeight: 700 } },
                      hItem.name
                    ),
                    h('div', { style: { fontSize: '0.78rem', color: 'var(--charcoal)', marginTop: '2px' } },
                      hItem.city
                    )
                  )
                )
              )
            ),
            h('tbody', null,
              featureKeys.map(feat =>
                h('tr', { key: feat.key },
                  h('th', { className: 'feature-col' }, feat.label),
                  hotels.map(hItem => {
                    let content = null;
                    if (feat.key === 'price') {
                      content = h('span', { style: { fontWeight: 700, color: 'var(--copper)', fontSize: '1.1rem' } },
                        formatCurrency(hItem.pricePerNight)
                      );
                    } else if (feat.key === 'total') {
                      const pricing = calculateStayPricing(hItem.pricePerNight, nights, 1);
                      content = h('span', { style: { fontWeight: 700, color: 'var(--navy)' } },
                        formatCurrency(pricing.total)
                      );
                    } else if (feat.key === 'rating') {
                      content = h('span', { className: 'rating-badge' },
                        h(Icon, { name: 'star', size: 12 }),
                        h('span', null, `${hItem.rating.toFixed(1)}`),
                        h('span', { style: { opacity: 0.8, fontWeight: 400 } }, `(${hItem.reviewsCount})`)
                      );
                    } else if (feat.key === 'city') {
                      content = hItem.city;
                    } else if (feat.key === 'capacity') {
                      content = `Up to ${hItem.capacity || 2} Guests`;
                    } else if (feat.check) {
                      const hasAmenity = (hItem.amenities || []).includes(feat.amenity);
                      content = hasAmenity ?
                        h('span', { style: { color: 'var(--sage-dark)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' } },
                          h(Icon, { name: 'check', size: 16 }),
                          'Yes'
                        ) :
                        h('span', { style: { color: 'var(--charcoal-light)' } }, '—');
                    }

                    return h('td', { key: `${hItem.id}-${feat.key}`, className: 'hotel-col' }, content);
                  })
                )
              ),

              // Action Row
              h('tr', null,
                h('th', { className: 'feature-col' }, 'Reserve'),
                hotels.map(hItem => {
                  const detailUrl = `hotel.html?id=${hItem.id}&checkin=${encodeURIComponent(searchParams.checkIn)}&checkout=${encodeURIComponent(searchParams.checkOut)}&guests=${searchParams.guests}`;
                  return h('td', { key: `cta-${hItem.id}`, className: 'hotel-col' },
                    h('a', {
                      href: detailUrl,
                      className: 'btn btn-primary btn-sm',
                      style: { width: '100%', textAlign: 'center' }
                    }, 'Select This Stay')
                  );
                })
              )
            )
          )
        )
      )
    );
  }

  /* --------------------------------------------------------------------------
     11. Empty State Component
     -------------------------------------------------------------------------- */
  function EmptyState({ onReset }) {
    return h('div', { className: 'empty-state' },
      h('div', { className: 'empty-state-icon' },
        h(Icon, { name: 'sliders-horizontal', size: 36, color: 'var(--copper)' })
      ),
      h('h3', null, 'No luxury stays match your exact criteria'),
      h('p', null, 'Try widening your price range, choosing all destinations, or clearing selected amenities to reveal available suites.'),
      h('button', {
        type: 'button',
        className: 'btn btn-primary btn-sm',
        onClick: onReset
      }, 'Reset All Filters')
    );
  }

  /* --------------------------------------------------------------------------
     12. Root SearchApp Component
     -------------------------------------------------------------------------- */
  function SearchApp() {
    // 1. Initial URL Query Parameters
    const urlParams = new URLSearchParams(window.location.search);
    const initialCity = urlParams.get('city') || '';
    const initialCheckIn = urlParams.get('checkin') || getTodayDateString(2);
    const initialCheckOut = urlParams.get('checkout') || getTodayDateString(5);
    const initialGuests = parseInt(urlParams.get('guests'), 10) || 2;
    const initialSort = urlParams.get('sort') || 'recommended';

    // 2. Primary State
    const [allHotels, setAllHotels] = useState(() => getStoredHotels());

    useEffect(() => {
      if (window.StayscapeAPI) {
        window.StayscapeAPI.getHotels({ limit: 100 }).then(res => {
          if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
            setAllHotels(res.data);
            safeSetStorage(STORAGE_KEYS.HOTELS, res.data);
          }
        }).catch(err => console.warn('[SearchApp] Backend hotels sync failed:', err));
      }
    }, []);

    const [searchParams, setSearchParams] = useState({
      city: initialCity,
      checkIn: initialCheckIn,
      checkOut: initialCheckOut,
      guests: initialGuests
    });

    const [filters, setFilters] = useState({
      cities: initialCity ? [initialCity.toLowerCase()] : [],
      maxPrice: 30000,
      minRating: 0,
      amenities: []
    });

    const [sortMode, setSortMode] = useState(initialSort);
    const [viewMode, setViewMode] = useState(() => {
      try {
        return localStorage.getItem('stayscape:viewMode') || 'grid';
      } catch (e) {
        return 'grid';
      }
    });

    const [favourites, setFavourites] = useState(() => getFavourites());
    const [comparedIds, setComparedIds] = useState([]);
    const [quickViewHotel, setQuickViewHotel] = useState(null);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

    // City stay counts
    const cityCounts = useMemo(() => {
      const counts = {};
      allHotels.forEach(hItem => {
        counts[hItem.city] = (counts[hItem.city] || 0) + 1;
      });
      return counts;
    }, [allHotels]);

    // Synchronize ViewMode to localStorage
    const handleViewModeChange = (mode) => {
      setViewMode(mode);
      try {
        localStorage.setItem('stayscape:viewMode', mode);
      } catch (err) {}
    };

    // Synchronize URL parameters
    useEffect(() => {
      const p = new URLSearchParams();
      if (searchParams.city) p.set('city', searchParams.city);
      if (searchParams.checkIn) p.set('checkin', searchParams.checkIn);
      if (searchParams.checkOut) p.set('checkout', searchParams.checkOut);
      if (searchParams.guests) p.set('guests', searchParams.guests);
      if (sortMode !== 'recommended') p.set('sort', sortMode);

      const newQuery = p.toString() ? `?${p.toString()}` : window.location.pathname;
      window.history.replaceState({}, '', newQuery);

      // Save Last Search
      saveLastSearch({
        city: searchParams.city,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        guests: searchParams.guests
      });
    }, [searchParams, sortMode]);

    // Toggle Favourite Handler
    const handleToggleFav = useCallback((hotelId) => {
      const isFav = toggleFavourite(hotelId);
      setFavourites(getFavourites());
      const hotel = allHotels.find(h => String(h.id) === String(hotelId));
      if (hotel) {
        showToast(isFav ? `Added "${hotel.name}" to saved stays.` : `Removed "${hotel.name}" from saved stays.`, 'info');
      }
    }, [allHotels]);

    // Compare Toggle Handler (Up to 3 stays)
    const handleToggleCompare = useCallback((hotelId) => {
      setComparedIds(prev => {
        if (prev.includes(hotelId)) {
          return prev.filter(id => id !== hotelId);
        }
        if (prev.length >= 3) {
          showToast('You can compare a maximum of 3 stays at once.', 'warning');
          return prev;
        }
        showToast('Stay added to comparison dock.', 'info');
        return [...prev, hotelId];
      });
    }, []);

    // Quick Book Now Handler from Modal
    const handleBookNow = useCallback((hotel) => {
      const targetUrl = `checkout.html?hotelId=${hotel.id}&checkin=${encodeURIComponent(searchParams.checkIn)}&checkout=${encodeURIComponent(searchParams.checkOut)}&guests=${searchParams.guests}`;
      window.location.href = targetUrl;
    }, [searchParams]);

    // Top Search Form Submission Handler
    const handleTopSearchSubmit = useCallback((newParams) => {
      setSearchParams(newParams);
      if (newParams.city) {
        setFilters(f => ({ ...f, cities: [newParams.city.toLowerCase()] }));
      } else {
        setFilters(f => ({ ...f, cities: [] }));
      }
      showToast('Search criteria updated.', 'info');
    }, []);

    // Filter Toggles
    const handleToggleCity = useCallback((cityName) => {
      const lower = cityName.toLowerCase();
      setFilters(prev => {
        const nextCities = prev.cities.includes(lower)
          ? prev.cities.filter(c => c !== lower)
          : [...prev.cities, lower];
        // If single city, reflect in searchParams
        setSearchParams(sp => ({
          ...sp,
          city: nextCities.length === 1 ? cityName : ''
        }));
        return { ...prev, cities: nextCities };
      });
    }, []);

    const handleRemoveCityChip = useCallback((cityName) => {
      handleToggleCity(cityName);
    }, [handleToggleCity]);

    const handlePriceChange = useCallback((newMax) => {
      setFilters(prev => ({ ...prev, maxPrice: newMax }));
    }, []);

    const handleRatingChange = useCallback((newMin) => {
      setFilters(prev => ({ ...prev, minRating: newMin }));
    }, []);

    const handleToggleAmenity = useCallback((amenityName) => {
      setFilters(prev => {
        const next = prev.amenities.includes(amenityName)
          ? prev.amenities.filter(a => a !== amenityName)
          : [...prev.amenities, amenityName];
        return { ...prev, amenities: next };
      });
    }, []);

    const handleResetAllFilters = useCallback(() => {
      setFilters({
        cities: [],
        maxPrice: 30000,
        minRating: 0,
        amenities: []
      });
      setSearchParams(prev => ({ ...prev, city: '' }));
      setSortMode('recommended');
      showToast('All filters have been reset.', 'info');
    }, []);

    // Filter and Sort Processing
    const filteredHotels = useMemo(() => {
      const { cities, maxPrice, minRating, amenities } = filters;
      const guests = searchParams.guests;

      let result = allHotels.filter(hotel => {
        // City match
        if (cities.length > 0) {
          if (!cities.includes(hotel.city.toLowerCase())) return false;
        }
        // Price match
        if (hotel.pricePerNight > maxPrice) return false;
        // Rating match
        if (hotel.rating < minRating) return false;
        // Capacity match
        if ((hotel.capacity || 2) < guests) return false;
        // Amenities match (all selected amenities must be present)
        if (amenities.length > 0) {
          const hasAll = amenities.every(a => (hotel.amenities || []).includes(a));
          if (!hasAll) return false;
        }
        return true;
      });

      // Sorting
      result.sort((a, b) => {
        if (sortMode === 'price-asc') return a.pricePerNight - b.pricePerNight;
        if (sortMode === 'price-desc') return b.pricePerNight - a.pricePerNight;
        if (sortMode === 'rating-desc') return b.rating - a.rating;
        // Recommended: featured first, then rating
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.rating - a.rating;
      });

      return result;
    }, [allHotels, filters, searchParams.guests, sortMode]);

    // Destination Label for Title
    const destinationLabel = useMemo(() => {
      if (filters.cities.length === 1) {
        const c = filters.cities[0];
        return c.charAt(0).toUpperCase() + c.slice(1);
      }
      if (filters.cities.length > 1) {
        return `${filters.cities.length} Selected Destinations`;
      }
      return 'All Destinations';
    }, [filters.cities]);

    // Compared hotel objects
    const comparedHotels = useMemo(() => {
      return comparedIds
        .map(id => allHotels.find(h => String(h.id) === String(id)))
        .filter(Boolean);
    }, [comparedIds, allHotels]);

    return h('div', { className: 'search-react-root-inner' },
      // Top Criteria Bar
      h(TopSearchBar, {
        searchParams: searchParams,
        onSearchSubmit: handleTopSearchSubmit
      }),

      // Main Container
      h('main', { className: 'main-content container', id: 'main-content' },
        // Breadcrumb
        h('nav', { className: 'breadcrumb-nav', 'aria-label': 'Breadcrumb' },
          h('ul', { className: 'breadcrumb-list' },
            h('li', null, h('a', { href: 'index.html' }, 'Home')),
            h('li', { className: 'breadcrumb-separator' }, '/'),
            h('li', { 'aria-current': 'page', style: { color: 'var(--navy)', fontWeight: 600 } }, 'Explore Stays')
          )
        ),

        // Two-Column Discovery Layout
        h('div', { className: 'search-layout' },
          // Left: Filters Sidebar
          h(FiltersSidebar, {
            cities: POPULAR_CITIES,
            cityCounts: cityCounts,
            selectedCities: filters.cities,
            onToggleCity: handleToggleCity,
            maxPrice: filters.maxPrice,
            onPriceChange: handlePriceChange,
            rating: filters.minRating,
            onRatingChange: handleRatingChange,
            amenities: POPULAR_AMENITIES,
            selectedAmenities: filters.amenities,
            onToggleAmenity: handleToggleAmenity,
            onResetAll: handleResetAllFilters
          }),

          // Right: Results Column
          h('section', { 'aria-labelledby': 'results-title' },
            // Results Top Bar
            h(ResultsControlsBar, {
              filteredCount: filteredHotels.length,
              destinationLabel: destinationLabel,
              searchParams: searchParams,
              viewMode: viewMode,
              onChangeViewMode: handleViewModeChange,
              sortMode: sortMode,
              onChangeSortMode: setSortMode
            }),

            // Active Filter Chips Bar
            h(ActiveFilterChips, {
              filters: filters,
              onRemoveCity: handleRemoveCityChip,
              onClearPrice: () => handlePriceChange(30000),
              onClearRating: () => handleRatingChange(0),
              onRemoveAmenity: (a) => handleToggleAmenity(a),
              onClearAll: handleResetAllFilters
            }),

            // Results List / Grid or Empty State
            filteredHotels.length === 0 ?
              h(EmptyState, { onReset: handleResetAllFilters }) :
              viewMode === 'grid' ?
                h('div', {
                  className: 'hotels-grid',
                  style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-xl)' }
                },
                  filteredHotels.map(hotel =>
                    h(HotelCardGrid, {
                      key: hotel.id,
                      hotel: hotel,
                      searchParams: searchParams,
                      isFav: isFavourite(hotel.id),
                      onToggleFav: handleToggleFav,
                      isCompared: comparedIds.includes(hotel.id),
                      onToggleCompare: handleToggleCompare,
                      onQuickView: setQuickViewHotel
                    })
                  )
                ) :
                h('div', { className: 'hotels-list-wrapper' },
                  filteredHotels.map(hotel =>
                    h(HotelCardList, {
                      key: hotel.id,
                      hotel: hotel,
                      searchParams: searchParams,
                      isFav: isFavourite(hotel.id),
                      onToggleFav: handleToggleFav,
                      isCompared: comparedIds.includes(hotel.id),
                      onToggleCompare: handleToggleCompare,
                      onQuickView: setQuickViewHotel
                    })
                  )
                )
          )
        )
      ),

      // Floating Compare Bottom Dock
      h(ComparisonDock, {
        comparedHotels: comparedHotels,
        onRemove: (id) => handleToggleCompare(id),
        onClear: () => setComparedIds([]),
        onOpenModal: () => setIsCompareModalOpen(true)
      }),

      // Comparison Matrix Modal
      isCompareModalOpen && h(ComparisonModal, {
        hotels: comparedHotels,
        searchParams: searchParams,
        onClose: () => setIsCompareModalOpen(false)
      }),

      // Quick View Modal
      quickViewHotel && h(QuickViewModal, {
        hotel: quickViewHotel,
        searchParams: searchParams,
        onClose: () => setQuickViewHotel(null),
        onBookNow: handleBookNow
      })
    );
  }

  /* --------------------------------------------------------------------------
     13. Mount Root Application
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    // Render static site header & footer
    renderHeader('search');
    renderFooter();

    const rootElement = document.getElementById('react-search-root');
    if (rootElement && window.ReactDOM) {
      if (window.ReactDOM.createRoot) {
        const root = window.ReactDOM.createRoot(rootElement);
        root.render(h(SearchApp));
      } else if (window.ReactDOM.render) {
        window.ReactDOM.render(h(SearchApp), rootElement);
      }
    }
  });

})();
