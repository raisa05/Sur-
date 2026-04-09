/* ============================================================
   SUR+ APP — Main JavaScript
   Navigation, interactions, state management
   ============================================================ */

/* ── Router ─────────────────────────────────────────── */
const PAGES = {
  onboarding:     'page-onboarding',
  browse:         'page-browse',
  product:        'page-product',
  checkout:       'page-checkout',
  impact:         'page-impact',
  retailer:       'page-retailer',
};

let currentPage = 'onboarding';
let selectedRole = null;
let cartQuantity = 1;

function navigate(pageKey, options = {}) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  const target = document.getElementById(PAGES[pageKey]);
  if (!target) return;

  target.classList.add('active');
  currentPage = pageKey;

  // Scroll to top
  target.scrollTop = 0;
  target.querySelectorAll('.scrollable-page').forEach((el) => {
    el.scrollTop = 0;
    el.scrollTo?.({ top: 0, left: 0, behavior: 'auto' });
  });
  window.scrollTo(0, 0);

  // Update bottom nav active state
  updateNavActive(pageKey);

  // Run page-specific init
  if (pageInitFns[pageKey]) pageInitFns[pageKey](options);
}

function updateNavActive(pageKey) {
  document.querySelectorAll('[data-nav-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.navPage === pageKey);
  });
}

/* ── Page Init Functions ────────────────────────────── */
const pageInitFns = {
  impact: () => {
    animateCounters();
    initShimmerCards();
  },
  browse: () => {
    // Already live
  },
  checkout: () => {
    renderCartQty();
  },
  retailer: () => {
    // Scroll animations are now handled by an IntersectionObserver
    setupScrollAnimations();
  },
};

/* ── Onboarding ─────────────────────────────────────── */
function selectRole(el) {
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedRole = el.dataset.role;
  setTimeout(handleRoleConfirm, 100);
}

function handleRoleConfirm() {
  if (!selectedRole) {
    // Pulse unselected cards to prompt selection
    document.querySelectorAll('.role-card').forEach(c => {
      c.style.animation = 'none';
      requestAnimationFrame(() => {
        c.style.animation = 'pulseCard 300ms ease';
      });
    });
    return;
  }
  
  // Sync all persona toggles globally
  document.querySelectorAll('.persona-toggle').forEach(el => {
    el.setAttribute('data-role', selectedRole);
  });

  if (selectedRole === 'retailer') {
    navigate('retailer');
  } else {
    navigate('browse');
  }
}

function togglePersona() {
  selectedRole = selectedRole === 'retailer' ? 'resident' : 'retailer';
  
  document.querySelectorAll('.persona-toggle').forEach(el => {
    el.setAttribute('data-role', selectedRole);
  });
  
  if (selectedRole === 'retailer') {
    navigate('retailer');
  } else {
    navigate('browse');
  }
}

/* ── Cart / Quantity ─────────────────────────────────── */
function changeQty(delta) {
  cartQuantity = Math.max(1, Math.min(10, cartQuantity + delta));
  renderCartQty();
}

function renderCartQty() {
  const qtyEl = document.getElementById('cart-qty');
  const totalEl = document.getElementById('checkout-total');
  const btnTotalEl = document.getElementById('checkout-btn-total');
  const unitPrice = 4.20;
  const total = (unitPrice * cartQuantity).toFixed(2);

  if (qtyEl) qtyEl.textContent = cartQuantity;
  if (totalEl) totalEl.textContent = `AED ${total}`;
  if (btnTotalEl) btnTotalEl.textContent = `AED ${total}`;
}

/* ── Animated Counters (Impact) ─────────────────────── */
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const duration = 1200;
    const start = performance.now();
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = (target * eased).toFixed(decimals);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

/* ── Bar Chart Animation ────────────────────────────── */
function animateBars() {
  const bars = document.querySelectorAll('#retailer-bar-chart .bar-chart-bar');
  bars.forEach((bar, i) => {
    bar.style.height = '0%';
    setTimeout(() => {
      bar.style.transition = 'height 800ms cubic-bezier(0.4, 0, 0.2, 1)';
      bar.style.height = bar.dataset.barH;
    }, i * 80 + 100);
  });
}

function animateEfficiencyCircle() {
  const circle = document.getElementById('efficiency-circle');
  if (circle) {
    // Reveal to 84% (stroke-dashoffset 34.2)
    circle.style.strokeDashoffset = '34.2';
  }
}

/* ── Scroll Observer for Animations ─────────────────── */
function setupScrollAnimations() {
  const options = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target.id === 'retailer-bar-chart') {
          animateBars();
          observer.unobserve(entry.target);
        } else if (entry.target.id === 'efficiency-circle') {
          animateEfficiencyCircle();
          observer.unobserve(entry.target);
        }
      }
    });
  }, options);

  const barChart = document.getElementById('retailer-bar-chart');
  const efficiencyCircle = document.getElementById('efficiency-circle');

  if (barChart) observer.observe(barChart);
  if (efficiencyCircle) observer.observe(efficiencyCircle);
}

/* ── Shimmer on hover (collectible cards) ───────────── */
function initShimmerCards() {
  // CSS handles shimmer via :hover
}

/* ── Mobile Sidebar Drawer ──────────────────────────── */
function openSidebar() {
  document.getElementById('mobile-sidebar')?.classList.add('open');
  document.getElementById('sidebar-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  document.getElementById('mobile-sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Reserve / Confirm actions ──────────────────────── */
function reserve() {
  navigate('checkout');
}

function confirmPurchase() {
  showToast('🎉 Order confirmed! Pick up by 7:30 PM.');
  setTimeout(() => navigate('impact'), 1800);
}

/* ── Toast Notifications ─────────────────────────────── */
function showToast(message, duration = 3000) {
  let toast = document.getElementById('sur-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'sur-toast';
    Object.assign(toast.style, {
      position: 'fixed', bottom: '6rem', left: '50%', transform: 'translateX(-50%) translateY(20px)',
      background: '#0D1B2A', color: 'white', padding: '0.75rem 1.5rem',
      borderRadius: '0.75rem', fontFamily: "'Inter', sans-serif", fontWeight: '600',
      fontSize: '0.875rem', zIndex: '999', opacity: '0',
      transition: 'all 250ms ease', whiteSpace: 'nowrap',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    });
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, duration);
}

/* ── Search (Browse) ─────────────────────────────────── */
function handleSearch(e) {
  if (e.key === 'Enter') {
    showToast(`Searching for "${e.target.value}"…`);
  }
}

/* ── Init ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  navigate('onboarding');

  // Close sidebar on overlay click
  document.getElementById('sidebar-overlay')?.addEventListener('click', closeSidebar);

  // Keyboard: ESC closes sidebar
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSidebar();
  });
});
