const hotspots = document.querySelectorAll('.hotspot');
const diagramTitle = document.getElementById('diagram-title');
const diagramDescription = document.getElementById('diagram-description');

hotspots.forEach((hotspot) => {
  hotspot.addEventListener('click', () => {
    hotspots.forEach((btn) => btn.setAttribute('aria-pressed', 'false'));
    hotspot.setAttribute('aria-pressed', 'true');
    const { title, description } = hotspot.dataset;
    if (title) {
      diagramTitle.textContent = title;
    }
    if (description) {
      diagramDescription.textContent = description;
    }
  });

  hotspot.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      hotspot.click();
    }
  });
});

const menuToggle = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu-links');

const closeMenu = () => {
  if (!menuToggle || !menu) {
    return;
  }
  menuToggle.setAttribute('aria-expanded', 'false');
  menu.dataset.open = 'false';
};

if (menuToggle && menu) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    menu.dataset.open = (!expanded).toString();
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  menu.addEventListener('keyup', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      menuToggle.focus();
    }
  });
}

const galleryItems = document.querySelectorAll('.gallery__item');

galleryItems.forEach((item) => {
  item.addEventListener('click', () => {
    const isActive = item.classList.contains('is-active');
    galleryItems.forEach((figure) => figure.classList.remove('is-active'));
    if (!isActive) {
      item.classList.add('is-active');
    }
  });
});

window.addEventListener('click', (event) => {
  if (!event.target.closest('.gallery__item')) {
    galleryItems.forEach((figure) => figure.classList.remove('is-active'));
  }

  if (
    menu &&
    menu.dataset.open === 'true' &&
    !event.target.closest('.main-nav') &&
    !event.target.closest('.menu-toggle')
  ) {
    closeMenu();
  }
});

const legendButtons = document.querySelectorAll('.legend-popup-trigger');
const legendPopup = document.querySelector('.legend-popup');
const legendPopupTitle = document.getElementById('legend-popup-title');
const legendPopupDescription = document.getElementById('legend-popup-description');
const legendPopupClose = document.querySelector('.legend-popup__close');
const legendPopupMedia = document.querySelector('.legend-popup__media');
const legendPopupImage = document.getElementById('legend-popup-image');
const legendPopupCredit = document.getElementById('legend-popup-credit');
let lastLegendTrigger = null;

const setLegendActive = (term) => {
  legendButtons.forEach((btn) => {
    const isActive = btn.dataset.term === term;
    btn.setAttribute('aria-pressed', String(isActive));
  });
};

const showLegendMedia = (button) => {
  if (!legendPopupMedia || !legendPopupImage || !legendPopupCredit) {
    return;
  }
  const imageSrc = button.dataset.image;
  if (imageSrc) {
    legendPopupImage.src = imageSrc;
    const fallbackAlt = button.dataset.term
      ? `Registro fotográfico de ${button.dataset.term.toLowerCase()}`
      : 'Registro fotográfico da estrutura da esponja';
    legendPopupImage.alt = button.dataset.imageAlt || fallbackAlt;
    legendPopupCredit.textContent = button.dataset.credit || '';
    legendPopupMedia.hidden = false;
  } else {
    legendPopupImage.removeAttribute('src');
    legendPopupImage.alt = '';
    legendPopupCredit.textContent = '';
    legendPopupMedia.hidden = true;
  }
};

const openLegendPopup = (button) => {
  if (!legendPopup || !legendPopupTitle || !legendPopupDescription) {
    return;
  }
  lastLegendTrigger = button;
  const term = button.dataset.term ?? '';
  legendPopupTitle.textContent = term;
  legendPopupDescription.textContent = button.dataset.description ?? '';
  setLegendActive(term);
  showLegendMedia(button);
  legendPopup.hidden = false;
  requestAnimationFrame(() => {
    legendPopup.classList.add('is-open');
    legendPopupClose?.focus();
  });
};

const closeLegendPopup = () => {
  if (!legendPopup || legendPopup.hidden) {
    return;
  }
  legendPopup.classList.remove('is-open');
  legendPopup.hidden = true;
  if (legendPopupImage) {
    legendPopupImage.removeAttribute('src');
    legendPopupImage.alt = '';
  }
  if (legendPopupMedia) {
    legendPopupMedia.hidden = true;
  }
  if (legendPopupCredit) {
    legendPopupCredit.textContent = '';
  }
  legendButtons.forEach((btn) => btn.setAttribute('aria-pressed', 'false'));
  if (lastLegendTrigger) {
    lastLegendTrigger.focus();
  }
};

legendButtons.forEach((button) => {
  button.addEventListener('click', () => {
    openLegendPopup(button);
  });

  button.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      button.click();
    }
  });
});

legendPopupClose?.addEventListener('click', closeLegendPopup);

legendPopup?.addEventListener('click', (event) => {
  if (event.target === legendPopup) {
    closeLegendPopup();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (legendPopup && !legendPopup.hidden) {
      event.preventDefault();
      closeLegendPopup();
    } else if (menu && menu.dataset.open === 'true') {
      closeMenu();
      menuToggle?.focus();
    }
  }
});
