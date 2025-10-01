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
const galleryLightbox = document.querySelector('.gallery-lightbox');
const galleryLightboxClose = document.querySelector('.gallery-lightbox__close');
const galleryLightboxImage = document.getElementById('gallery-lightbox-image');
const galleryLightboxTitle = document.getElementById('gallery-lightbox-title');
const galleryLightboxCaption = document.getElementById('gallery-lightbox-caption');
let lastGalleryTrigger = null;

const setGalleryActive = (item) => {
  galleryItems.forEach((figure) => {
    if (figure === item) {
      figure.classList.add('is-active');
    } else {
      figure.classList.remove('is-active');
    }
  });
};

const populateGalleryLightbox = (item) => {
  if (!galleryLightboxImage || !galleryLightboxTitle || !galleryLightboxCaption) {
    return;
  }
  const figureImage = item.querySelector('img');
  const source = item.dataset.full || figureImage?.currentSrc || figureImage?.src;
  if (source) {
    galleryLightboxImage.src = source;
  }
  const imageAlt = figureImage?.alt || 'Fotografia ampliada da galeria';
  galleryLightboxImage.alt = imageAlt;
  const title = item.dataset.title || imageAlt;
  galleryLightboxTitle.textContent = title;
  const caption = item.dataset.caption || figureImage?.getAttribute('data-caption') || '';
  galleryLightboxCaption.textContent = caption.trim();
};

const openGalleryLightbox = (item) => {
  if (!galleryLightbox) {
    return;
  }
  lastGalleryTrigger = item;
  setGalleryActive(item);
  populateGalleryLightbox(item);
  galleryLightbox.hidden = false;
  requestAnimationFrame(() => {
    galleryLightbox.classList.add('is-open');
    galleryLightboxClose?.focus();
  });
};

const closeGalleryLightbox = () => {
  if (!galleryLightbox || galleryLightbox.hidden) {
    return;
  }

  const finishClose = () => {
    galleryLightbox.hidden = true;
    galleryLightboxImage?.removeAttribute('src');
    galleryLightboxImage?.setAttribute('alt', '');
    if (galleryLightboxTitle) {
      galleryLightboxTitle.textContent = '';
    }
    if (galleryLightboxCaption) {
      galleryLightboxCaption.textContent = '';
    }
    galleryItems.forEach((item) => item.classList.remove('is-active'));
    if (lastGalleryTrigger) {
      lastGalleryTrigger.focus();
    }
  };

  galleryLightbox.classList.remove('is-open');

  const handleTransitionEnd = () => {
    finishClose();
    galleryLightbox.removeEventListener('transitionend', handleTransitionEnd);
  };

  galleryLightbox.addEventListener('transitionend', handleTransitionEnd);
  setTimeout(() => {
    if (!galleryLightbox.hidden) {
      finishClose();
      galleryLightbox.removeEventListener('transitionend', handleTransitionEnd);
    }
  }, 320);
};

galleryItems.forEach((item) => {
  item.addEventListener('click', () => {
    openGalleryLightbox(item);
  });

  item.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openGalleryLightbox(item);
    }
  });
});

galleryLightboxClose?.addEventListener('click', () => {
  closeGalleryLightbox();
});

galleryLightbox?.addEventListener('click', (event) => {
  if (event.target === galleryLightbox) {
    closeGalleryLightbox();
  }
});

window.addEventListener('click', (event) => {
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
      return;
    }

    if (galleryLightbox && !galleryLightbox.hidden) {
      event.preventDefault();
      closeGalleryLightbox();
      return;
    }

    if (menu && menu.dataset.open === 'true') {
      closeMenu();
      menuToggle?.focus();
    }
  }
});
