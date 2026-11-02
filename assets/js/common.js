/**
 * STAYSCAPE — Shared Utility Library & UI Components
 * Plain Vanilla ES6+, no dependencies required.
 */

// Global State
let previousActiveElement = null;

/* ==========================================================================
   1. Storage & Data Persistence Helpers
   ========================================================================== */

function safeGetStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn(`[STAYSCAPE] Could not access localStorage for key "${key}":`, err);
    return fallback;
  }
}

function safeSetStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[STAYSCAPE] Could not save to localStorage for key "${key}":`, err);
    showToast('Storage quota exceeded or private mode enabled. Changes may not persist.', 'warning');
    return false;
  }
}

// Hotels dataset
function getStoredHotels() {
  const stored = safeGetStorage(STORAGE_KEYS.HOTELS);
  if (Array.isArray(stored) && stored.length > 0) {
    return stored;
  }
  // Initialize with SAMPLE_HOTELS if not already present
  safeSetStorage(STORAGE_KEYS.HOTELS, SAMPLE_HOTELS);
  return SAMPLE_HOTELS;
}

function saveStoredHotels(hotels) {
  return safeSetStorage(STORAGE_KEYS.HOTELS, hotels);
}

function getHotelById(id) {
  const hotels = getStoredHotels();
  return hotels.find(h => String(h.id) === String(id)) || null;
}

// Bookings
function getStoredBookings() {
  const stored = safeGetStorage(STORAGE_KEYS.BOOKINGS);
  if (Array.isArray(stored)) {
    return stored;
  }
  // Seed with initial demo bookings on first visit
  safeSetStorage(STORAGE_KEYS.BOOKINGS, INITIAL_DEMO_BOOKINGS);
  return INITIAL_DEMO_BOOKINGS;
}

function saveStoredBookings(bookings) {
  return safeSetStorage(STORAGE_KEYS.BOOKINGS, bookings);
}

function addBooking(bookingData) {
  const bookings = getStoredBookings();
  bookings.unshift(bookingData);
  saveStoredBookings(bookings);

  // Synchronize with backend API if available
  if (window.StayscapeAPI) {
    window.StayscapeAPI.createBooking(bookingData).then(res => {
      if (res && res.success && res.data) {
        console.log('[STAYSCAPE] Booking synced with backend database:', res.data.bookingId);
      }
    }).catch(err => {
      console.warn('[STAYSCAPE] Backend sync warning:', err);
    });
  }

  return bookingData;
}

function updateBookingStatus(bookingId, newStatus, reason = '') {
  const bookings = getStoredBookings();
  const index = bookings.findIndex(b => b.bookingId === bookingId);
  if (index !== -1) {
    bookings[index].status = newStatus;
    if (newStatus === 'cancelled') {
      bookings[index].cancelledAt = new Date().toISOString();
      if (reason) bookings[index].cancellationReason = reason;
    }
    saveStoredBookings(bookings);
  }

  // Synchronize cancellation with backend API
  if (window.StayscapeAPI && newStatus === 'cancelled') {
    window.StayscapeAPI.cancelBooking(bookingId, reason).then(res => {
      if (res && res.success) {
        console.log('[STAYSCAPE] Cancellation recorded in backend database:', bookingId);
      }
    }).catch(err => {
      console.warn('[STAYSCAPE] Backend cancellation sync warning:', err);
    });
  }

  return index !== -1 ? bookings[index] : null;
}

/**
 * Synchronize local sample caches with backend database
 */
async function syncDataFromBackend() {
  if (!window.StayscapeAPI) return;
  try {
    const [hotelsRes, bookingsRes] = await Promise.all([
      window.StayscapeAPI.getHotels({ limit: 100 }),
      window.StayscapeAPI.getBookings()
    ]);
    if (hotelsRes && hotelsRes.success && Array.isArray(hotelsRes.data)) {
      safeSetStorage(STORAGE_KEYS.HOTELS, hotelsRes.data);
    }
    if (bookingsRes && bookingsRes.success && Array.isArray(bookingsRes.data)) {
      safeSetStorage(STORAGE_KEYS.BOOKINGS, bookingsRes.data);
    }
  } catch (err) {
    console.warn('[STAYSCAPE] Background sync failed:', err);
  }
}

// Auto-sync when API detects connectivity
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    if (window.StayscapeAPI) {
      window.StayscapeAPI.onStatusChange((isOnline) => {
        if (isOnline) {
          syncDataFromBackend();
        }
      });
    }
  });
}

// Favourites
function getFavourites() {
  const favs = safeGetStorage(STORAGE_KEYS.FAVOURITES, []);
  return Array.isArray(favs) ? favs : [];
}

function isFavourite(hotelId) {
  const favs = getFavourites();
  return favs.includes(Number(hotelId)) || favs.includes(String(hotelId));
}

function toggleFavourite(hotelId) {
  const numId = Number(hotelId);
  let favs = getFavourites();
  const exists = favs.some(id => Number(id) === numId);
  const hotel = getHotelById(hotelId);
  const hotelName = hotel ? hotel.name : 'Hotel';

  if (exists) {
    favs = favs.filter(id => Number(id) !== numId);
    showToast(`Removed "${hotelName}" from favourites.`, 'info');
  } else {
    favs.push(numId);
    showToast(`Saved "${hotelName}" to favourites!`, 'success');
  }

  safeSetStorage(STORAGE_KEYS.FAVOURITES, favs);
  updateFavouritesCount();
  updateFavouriteButtonsUI();
  return !exists;
}

function updateFavouritesCount() {
  const count = getFavourites().length;
  document.querySelectorAll('.fav-count-badge').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'inline-flex' : 'none';
  });
}

function updateFavouriteButtonsUI() {
  const favs = getFavourites();
  document.querySelectorAll('[data-fav-hotel-id]').forEach(btn => {
    const hotelId = Number(btn.getAttribute('data-fav-hotel-id'));
    const isFav = favs.some(id => Number(id) === hotelId);
    btn.classList.toggle('is-favourited', isFav);
    btn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
    btn.setAttribute('title', isFav ? 'Remove from favourites' : 'Save to favourites');
    const icon = btn.querySelector('i');
    if (icon) {
      if (isFav) {
        icon.setAttribute('data-lucide', 'heart-crack');
      } else {
        icon.setAttribute('data-lucide', 'heart');
      }
    }
  });
  initIcons();
}

// Last Search
function saveLastSearch(params) {
  safeSetStorage(STORAGE_KEYS.LAST_SEARCH, params);
}

function getLastSearch() {
  return safeGetStorage(STORAGE_KEYS.LAST_SEARCH, null);
}

// Saved Guest Profile for Auto-filling
function getSavedProfile() {
  return safeGetStorage(STORAGE_KEYS.PROFILE, null);
}

function saveProfile(profile) {
  return safeSetStorage(STORAGE_KEYS.PROFILE, profile);
}

/* ==========================================================================
   2. Date, Currency & String Formatters
   ========================================================================== */

/**
 * Format currency in Indian Rupees (INR)
 */
function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

/**
 * Format YYYY-MM-DD into readable date in local time
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Calculate whole nights between check-in and check-out dates (local time)
 */
function calculateNights(checkInStr, checkOutStr) {
  if (!checkInStr || !checkOutStr) return 0;
  const p1 = checkInStr.split('-').map(Number);
  const p2 = checkOutStr.split('-').map(Number);
  if (p1.length !== 3 || p2.length !== 3) return 0;
  
  const d1 = new Date(p1[0], p1[1] - 1, p1[2]);
  const d2 = new Date(p2[0], p2[1] - 1, p2[2]);
  const diffTime = d2.getTime() - d1.getTime();
  const nights = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 0;
}

/**
 * Helper to get date string YYYY-MM-DD with optional day offset
 */
function getTodayDateString(offsetDays = 0) {
  const d = new Date();
  if (offsetDays) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Sanitize user input to prevent XSS injection
 */
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generate human-readable unique Demo Booking ID: SS-YYYYMMDD-XXXXXX
 */
function generateBookingId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SS-${year}${month}${day}-${rand}`;
}

/* ==========================================================================
   3. Shared Header & Footer Injection
   ========================================================================== */

function renderHeader(activePage = 'home') {
  const headerContainer = document.getElementById('site-header-container');
  if (!headerContainer) return;

  const favCount = getFavourites().length;

  headerContainer.innerHTML = `
    <!-- Top Bar Notice -->
    <div class="demo-top-bar" role="region" aria-label="Announcement">
      <span>✨ <strong>STAYSCAPE Luxury Escapes</strong> — Handpicked boutique hotels, heritage havelis &amp; private villas across India.</span>
      <a href="search.html">Explore Collection &rarr;</a>
    </div>

    <!-- Main Navigation Bar -->
    <header class="site-header" id="main-site-header">
      <div class="container">
        <div class="nav-wrapper">
          <!-- Brand Logo -->
          <a href="index.html" class="brand-logo" aria-label="STAYSCAPE Homepage">
            <div class="brand-icon-box">
              <i data-lucide="compass" style="width: 22px; height: 22px;"></i>
            </div>
            <div>
              <span class="brand-text">STAYSCAPE</span>
              <span class="brand-badge">Demo</span>
            </div>
          </a>

          <!-- Navigation Links -->
          <nav aria-label="Main Navigation">
            <ul class="nav-links">
              <li><a href="index.html" class="nav-link ${activePage === 'home' ? 'active' : ''}">Home</a></li>
              <li><a href="search.html" class="nav-link ${activePage === 'search' ? 'active' : ''}">Explore Stays</a></li>
              <li><a href="bookings.html" class="nav-link ${activePage === 'bookings' ? 'active' : ''}">My Bookings</a></li>
            </ul>
          </nav>

          <!-- Nav Actions -->
          <div class="nav-actions">
            <!-- Favourites Button -->
            <button type="button" class="fav-trigger-btn" id="fav-trigger-btn" aria-label="Open saved favourites">
              <i data-lucide="heart" style="width: 17px; height: 17px;"></i>
              <span>Favourites</span>
              <span class="fav-count-badge" style="${favCount > 0 ? 'display: inline-flex;' : 'display: none;'}">${favCount}</span>
            </button>

            <!-- Admin Demo Link -->
            <a href="admin.html" class="admin-nav-link ${activePage === 'admin' ? 'active' : ''}" title="Simulated Admin Dashboard">
              <i data-lucide="shield" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></i>Admin Demo
            </a>

            <!-- Mobile Hamburger Button -->
            <button type="button" class="mobile-menu-btn" id="mobile-menu-toggle-btn" aria-label="Toggle navigation menu" aria-expanded="false">
              <i data-lucide="menu" style="width: 24px; height: 24px;"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      <div class="mobile-nav-drawer" id="mobile-nav-drawer" aria-hidden="true">
        <ul class="mobile-nav-links">
          <li><a href="index.html" class="${activePage === 'home' ? 'active' : ''}">Home</a></li>
          <li><a href="search.html" class="${activePage === 'search' ? 'active' : ''}">Explore Stays</a></li>
          <li><a href="bookings.html" class="${activePage === 'bookings' ? 'active' : ''}">My Bookings</a></li>
          <li><a href="admin.html" class="${activePage === 'admin' ? 'active' : ''}">Admin Demo Dashboard</a></li>
        </ul>
      </div>
    </header>
  `;

  initMobileNav();
  initFavouritesDrawer();
  initHeaderScroll();
  initIcons();

  if (window.StayscapeAPI) {
    window.StayscapeAPI.updateStatusBadge(window.StayscapeAPI.isOnline);
  }
}

function initHeaderScroll() {
  const header = document.getElementById('main-site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-menu-toggle-btn');
  const drawer = document.getElementById('mobile-nav-drawer');
  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('is-open');
    if (isOpen) {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      toggleBtn.setAttribute('aria-expanded', 'false');
    } else {
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      toggleBtn.setAttribute('aria-expanded', 'true');
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!drawer.contains(e.target) && !toggleBtn.contains(e.target) && drawer.classList.contains('is-open')) {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

function renderFooter() {
  const footerContainer = document.getElementById('site-footer-container');
  if (!footerContainer) return;

  footerContainer.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-top">
          <!-- Brand & Tagline -->
          <div class="footer-brand">
            <h3>STAYSCAPE</h3>
            <p>Find your stay. Make it memorable. A curated hotel booking simulation built with modern web craftsmanship.</p>
            <div class="demo-disclaimer-pill">
              <i data-lucide="info" style="width: 14px; height: 14px;"></i>
              <span>Simulated Demo &bull; No Real Bookings</span>
            </div>
          </div>

          <!-- Quick Navigation -->
          <div class="footer-col">
            <h4>Explore</h4>
            <ul class="footer-links">
              <li><a href="index.html">Home</a></li>
              <li><a href="search.html">Explore All Stays</a></li>
              <li><a href="search.html?city=Goa">Luxury Goa Retreats</a></li>
              <li><a href="search.html?city=Jaipur">Royal Jaipur Havelis</a></li>
              <li><a href="search.html?city=Manali">Manali Alpine Lodges</a></li>
            </ul>
          </div>

          <!-- Quick Links -->
          <div class="footer-col">
            <h4>Guest Services</h4>
            <ul class="footer-links">
              <li><a href="bookings.html">My Bookings History</a></li>
              <li><a href="admin.html">Hotel Management Console</a></li>
              <li><a href="search.html">Curated Destinations</a></li>
              <li><a href="index.html#destinations">Explore Regions</a></li>
            </ul>
          </div>

          <!-- Quality Guarantee Note -->
          <div class="footer-col">
            <h4>STAYSCAPE Guarantee</h4>
            <div class="footer-highlight-card">
              <strong>Curated Quality &amp; Transparency</strong>
              <p>Handpicked heritage retreats, luxury beachfront villas, and alpine chalets with transparent itemised tariffs and instant booking confirmation.</p>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; 2026 STAYSCAPE Luxury Hospitality. All rights reserved.</p>
          <p>Powered by Amazon S3 &bull; Plain Vanilla Web Technologies</p>
        </div>
      </div>
    </footer>
  `;
  initIcons();
}

/* ==========================================================================
   4. Toast Notifications System
   ========================================================================== */

function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('stayscape-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'stayscape-toast-container';
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }

  const iconName = type === 'success' ? 'check-circle' :
                   type === 'error' ? 'alert-triangle' :
                   type === 'warning' ? 'alert-circle' : 'info';

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `
    <i data-lucide="${iconName}" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
    <span>${escapeHTML(message)}</span>
    <button type="button" class="toast-close-btn" aria-label="Close notification">
      <i data-lucide="x" style="width: 16px; height: 16px;"></i>
    </button>
  `;

  container.appendChild(toast);
  initIcons();

  const closeBtn = toast.querySelector('.toast-close-btn');
  const dismiss = () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 200);
  };

  closeBtn.addEventListener('click', dismiss);
  setTimeout(dismiss, duration);
}

/* ==========================================================================
   5. Accessible Custom Modal Dialog
   ========================================================================== */

function openModal({
  title = 'Confirmation',
  content = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm = null,
  onCancel = null,
  isDanger = false
}) {
  previousActiveElement = document.activeElement;

  let backdrop = document.getElementById('stayscape-modal-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'stayscape-modal-backdrop';
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-labelledby', 'modal-dialog-title');
    document.body.appendChild(backdrop);
  }

  backdrop.innerHTML = `
    <div class="modal-dialog" id="stayscape-modal-dialog">
      <div class="modal-header">
        <h3 class="modal-title" id="modal-dialog-title">${escapeHTML(title)}</h3>
        <button type="button" class="modal-close-btn" id="modal-cancel-x-btn" aria-label="Close dialog">
          <i data-lucide="x" style="width: 20px; height: 20px;"></i>
        </button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary btn-sm" id="modal-cancel-btn">${escapeHTML(cancelText)}</button>
        <button type="button" class="btn ${isDanger ? 'btn-danger' : 'btn-primary'} btn-sm" id="modal-confirm-btn">${escapeHTML(confirmText)}</button>
      </div>
    </div>
  `;

  initIcons();

  // Show modal
  backdrop.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  const confirmBtn = document.getElementById('modal-confirm-btn');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const cancelXBtn = document.getElementById('modal-cancel-x-btn');

  const close = () => {
    backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus();
    }
  };

  confirmBtn.addEventListener('click', () => {
    close();
    if (typeof onConfirm === 'function') onConfirm();
  });

  cancelBtn.addEventListener('click', () => {
    close();
    if (typeof onCancel === 'function') onCancel();
  });

  cancelXBtn.addEventListener('click', () => {
    close();
    if (typeof onCancel === 'function') onCancel();
  });

  // Close on backdrop click outside dialog
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      close();
      if (typeof onCancel === 'function') onCancel();
    }
  });

  // Trap focus & Escape key handling
  backdrop.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      close();
      if (typeof onCancel === 'function') onCancel();
      return;
    }

    if (e.key === 'Tab') {
      const focusable = backdrop.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  });

  confirmBtn.focus();
}

/* ==========================================================================
   6. Favourites Side Drawer
   ========================================================================== */

function initFavouritesDrawer() {
  const triggerBtn = document.getElementById('fav-trigger-btn');
  if (!triggerBtn) return;

  let drawerBackdrop = document.getElementById('stayscape-fav-drawer-backdrop');
  if (!drawerBackdrop) {
    drawerBackdrop = document.createElement('div');
    drawerBackdrop.id = 'stayscape-fav-drawer-backdrop';
    drawerBackdrop.className = 'drawer-backdrop';
    drawerBackdrop.innerHTML = `
      <div class="favourites-drawer" id="favourites-drawer" role="dialog" aria-modal="true" aria-labelledby="fav-drawer-title">
        <div class="drawer-header">
          <h3 id="fav-drawer-title" style="display: flex; align-items: center; gap: 8px;">
            <i data-lucide="heart" style="width: 20px; height: 20px; color: var(--copper);"></i>
            Saved Stays
          </h3>
          <button type="button" class="modal-close-btn" id="close-fav-drawer-btn" aria-label="Close favourites">
            <i data-lucide="x" style="width: 20px; height: 20px;"></i>
          </button>
        </div>
        <div class="drawer-body" id="fav-drawer-body">
          <!-- Populated dynamically -->
        </div>
      </div>
    `;
    document.body.appendChild(drawerBackdrop);
  }

  const drawer = document.getElementById('favourites-drawer');
  const closeBtn = document.getElementById('close-fav-drawer-btn');

  const openDrawer = () => {
    renderFavouritesList();
    drawerBackdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    initIcons();
  };

  const closeDrawer = () => {
    drawerBackdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  triggerBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);

  drawerBackdrop.addEventListener('click', (e) => {
    if (e.target === drawerBackdrop) {
      closeDrawer();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawerBackdrop.classList.contains('is-open')) {
      closeDrawer();
    }
  });
}

function renderFavouritesList() {
  const body = document.getElementById('fav-drawer-body');
  if (!body) return;

  const favIds = getFavourites();
  const allHotels = getStoredHotels();
  const favHotels = allHotels.filter(h => favIds.some(id => Number(id) === Number(h.id)));

  if (favHotels.length === 0) {
    body.innerHTML = `
      <div class="empty-state" style="border: none; padding: var(--space-2xl) 0;">
        <div class="empty-state-icon">
          <i data-lucide="heart" style="width: 32px; height: 32px; color: var(--charcoal-light);"></i>
        </div>
        <h4>No saved favourites yet</h4>
        <p style="font-size: 0.85rem; color: var(--charcoal);">Click the heart icon on any hotel card or details page to curate your personal wishlist.</p>
        <a href="search.html" class="btn btn-primary btn-sm">Explore Stays</a>
      </div>
    `;
    return;
  }

  body.innerHTML = favHotels.map(hotel => `
    <div class="fav-item-card">
      <img src="${escapeHTML(hotel.image)}" alt="${escapeHTML(hotel.name)}" class="fav-item-thumb" onerror="this.src=FALLBACK_IMAGE">
      <div class="fav-item-info">
        <a href="hotel.html?id=${hotel.id}" class="fav-item-title">${escapeHTML(hotel.name)}</a>
        <div style="font-size: 0.78rem; color: var(--charcoal);">${escapeHTML(hotel.city)} &bull; ${hotel.rating} ★</div>
        <div class="fav-item-price">${formatCurrency(hotel.pricePerNight)}<span style="font-size: 0.75rem; font-weight: normal; color: var(--charcoal);"> / night</span></div>
      </div>
      <button type="button" class="fav-item-remove-btn" onclick="toggleFavourite(${hotel.id}); renderFavouritesList();" aria-label="Remove from favourites" title="Remove">
        <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
      </button>
    </div>
  `).join('');
}

/* ==========================================================================
   7. Standard Hotel Card Component Generator
   ========================================================================== */

function renderHotelCard(hotel) {
  const isFav = isFavourite(hotel.id);
  const amenitiesList = (hotel.amenities || []).slice(0, 3);

  return `
    <article class="hotel-card" id="hotel-card-${hotel.id}">
      <div class="hotel-card-image-box">
        <img 
          src="${escapeHTML(hotel.image)}" 
          alt="Exterior and ambience of ${escapeHTML(hotel.name)} in ${escapeHTML(hotel.city)}" 
          class="hotel-card-image" 
          loading="lazy"
          onerror="this.src=FALLBACK_IMAGE"
        >
        <button 
          type="button" 
          class="hotel-card-fav-btn ${isFav ? 'is-favourited' : ''}" 
          data-fav-hotel-id="${hotel.id}"
          onclick="toggleFavourite(${hotel.id})"
          aria-label="${isFav ? 'Remove ' + escapeHTML(hotel.name) + ' from favourites' : 'Save ' + escapeHTML(hotel.name) + ' to favourites'}"
          aria-pressed="${isFav ? 'true' : 'false'}"
        >
          <i data-lucide="${isFav ? 'heart-crack' : 'heart'}" style="width: 18px; height: 18px;"></i>
        </button>
        <span class="hotel-card-city-tag">${escapeHTML(hotel.city)}</span>
      </div>

      <div class="hotel-card-body">
        <div class="hotel-card-meta">
          <div class="rating-badge">
            <i data-lucide="star" style="width: 13px; height: 13px; fill: var(--sage-dark);"></i>
            <span>${hotel.rating}</span>
            <span class="review-count-text">(${hotel.reviewCount})</span>
          </div>
          <div class="star-rating" aria-label="${hotel.stars} star hotel">
            ${'★'.repeat(hotel.stars || 5)}
          </div>
        </div>

        <h3 class="hotel-card-title">
          <a href="hotel.html?id=${hotel.id}">${escapeHTML(hotel.name)}</a>
        </h3>

        <div class="hotel-card-location">
          <i data-lucide="map-pin" style="width: 14px; height: 14px; flex-shrink: 0; color: var(--copper);"></i>
          <span>${escapeHTML(hotel.location)}</span>
        </div>

        <div class="hotel-card-amenities">
          ${amenitiesList.map(a => `<span class="amenity-pill">${escapeHTML(a)}</span>`).join('')}
          ${(hotel.amenities && hotel.amenities.length > 3) ? `<span class="amenity-pill">+${hotel.amenities.length - 3} more</span>` : ''}
        </div>

        <div class="hotel-card-footer">
          <div class="price-display">
            <span class="price-sub">Starting from</span>
            <div>
              <span class="price-amount">${formatCurrency(hotel.pricePerNight)}</span>
              <span class="price-night"> / night</span>
            </div>
          </div>
          <a href="hotel.html?id=${hotel.id}" class="btn btn-primary btn-sm">
            View Details
          </a>
        </div>
      </div>
    </article>
  `;
}

/* ==========================================================================
   8. Safe Lucide Icon Initializer
   ========================================================================== */

function initIcons() {
  if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
    try {
      lucide.createIcons();
    } catch (err) {
      console.warn('[STAYSCAPE] Lucide createIcons failed:', err);
    }
  }
}
