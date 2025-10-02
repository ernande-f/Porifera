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
let magazineNavigationHandler = null;
let magazineHotkeysHandler = null;

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
    link.addEventListener('click', (event) => {
      const target = link.getAttribute('href');
      if (magazineNavigationHandler && target && target.startsWith('#') && target.length > 1) {
        const handled = magazineNavigationHandler(target.slice(1), { focus: true });
        if (handled) {
          event.preventDefault();
        }
      }
      closeMenu();
    });
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

const magazineElement = document.querySelector('.magazine');
const fullscreenToggle = document.querySelector('.magazine__fullscreen-toggle');

const isMagazineFullscreen = () =>
  document.fullscreenElement === magazineElement || document.body.classList.contains('is-magazine-immersive');

const syncFullscreenUi = (active, { forceBodyState = false } = {}) => {
  if (!magazineElement) {
    return;
  }
  magazineElement.classList.toggle('magazine--immersive', active);
  if (forceBodyState || !document.fullscreenElement) {
    document.body.classList.toggle('is-magazine-immersive', active);
  } else if (!active) {
    document.body.classList.remove('is-magazine-immersive');
  }
  if (fullscreenToggle) {
    fullscreenToggle.setAttribute('aria-pressed', String(active));
    const label = fullscreenToggle.querySelector('.magazine__fullscreen-label');
    if (label) {
      label.textContent = active ? 'Sair da tela cheia' : 'Tela cheia';
    }
  }
};

const enterMagazineFullscreen = async () => {
  if (!magazineElement) {
    return;
  }
  if (document.fullscreenEnabled && magazineElement.requestFullscreen) {
    try {
      await magazineElement.requestFullscreen({ navigationUI: 'hide' });
    } catch (error) {
      console.warn('Não foi possível ativar a tela cheia nativa.', error);
      syncFullscreenUi(true, { forceBodyState: true });
    }
  } else {
    syncFullscreenUi(true, { forceBodyState: true });
  }
  window.dispatchEvent(new Event('resize'));
};

const exitMagazineFullscreen = async () => {
  if (document.fullscreenElement === magazineElement) {
    await document.exitFullscreen();
  } else {
    syncFullscreenUi(false, { forceBodyState: true });
  }
  window.dispatchEvent(new Event('resize'));
};

fullscreenToggle?.addEventListener('click', () => {
  if (isMagazineFullscreen()) {
    exitMagazineFullscreen();
  } else {
    enterMagazineFullscreen();
  }
});

document.addEventListener('fullscreenchange', () => {
  const active = document.fullscreenElement === magazineElement;
  syncFullscreenUi(active);
  if (!active) {
    document.body.classList.remove('is-magazine-immersive');
  }
  window.dispatchEvent(new Event('resize'));
});

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

    if (!document.fullscreenElement && document.body.classList.contains('is-magazine-immersive')) {
      event.preventDefault();
      exitMagazineFullscreen();
      return;
    }
    return;
  }

  if (magazineHotkeysHandler && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
    magazineHotkeysHandler(event);
  }
});




const initializeMagazine = () => {
  const magazine = magazineElement;
  if (!magazine) {
    return;
  }

  const enhancementMedia = window.matchMedia('(min-width: 960px)');
  if (!enhancementMedia.matches) {
    const reinitializeOnMatch = (event) => {
      if (event.matches) {
        enhancementMedia.removeEventListener('change', reinitializeOnMatch);
        initializeMagazine();
      }
    };
    enhancementMedia.addEventListener('change', reinitializeOnMatch);
    return;
  }

  const header = document.querySelector('.site-header');
  let headerOffset = 0;

  const updatePageMetrics = () => {
    const immersiveActive =
      magazine.classList.contains('magazine--immersive') || document.body.classList.contains('is-magazine-immersive');
    const headerHeight = immersiveActive ? 0 : header?.offsetHeight ?? 0;
    headerOffset = headerHeight;
    const availableHeight = window.innerHeight - headerHeight;
    const pageHeight = availableHeight > 0 ? availableHeight : Math.max(window.innerHeight, 320);
    magazine.style.setProperty('--magazine-header-offset', `${headerHeight}px`);
    magazine.style.setProperty('--magazine-page-height', `${pageHeight}px`);
  };

  updatePageMetrics();

  window.addEventListener('resize', updatePageMetrics);

  if (header && 'ResizeObserver' in window) {
    const headerObserver = new ResizeObserver(() => {
      updatePageMetrics();
    });
    headerObserver.observe(header);
  }

  const viewport = magazine.querySelector('.magazine__viewport');
  if (!viewport) {
    return;
  }

  const sections = Array.from(viewport.children).filter(
    (element) => element instanceof HTMLElement && element.tagName === 'SECTION'
  );

  if (!sections.length) {
    return;
  }

  const navigationButtons = Array.from(
    magazine.querySelectorAll('button[data-direction]')
  );
  const prevButtons = navigationButtons.filter((button) => button.dataset.direction === 'prev');
  const nextButtons = navigationButtons.filter((button) => button.dataset.direction === 'next');
  const currentLabel = magazine.querySelector('.magazine__current');
  const totalLabel = magazine.querySelector('.magazine__total');
  const statusLabel = magazine.querySelector('.magazine__status');

  const totalPages = sections.length;
  let currentPage = 0;

  const compactMedia = window.matchMedia('(max-width: 900px)');
  const shouldUsePaging = () => !compactMedia.matches;

  if (totalLabel) {
    totalLabel.textContent = String(totalPages);
  }

  magazine.dataset.totalPages = String(totalPages);
  magazine.dataset.currentPage = String(currentPage);

  const sectionIndexMap = new Map();

  const titleOverrides = {
    inicio: 'Início',
    diagnostica: 'Característica diagnóstica',
    gerais: 'Características gerais',
    anatomia: 'Anatomia',
    tipos: 'Tipos corporais',
    classes: 'Classes de Porifera',
    dormencia: 'Dormência e gemulação',
    reproducao: 'Reprodução',
    evolucao: 'Evolução',
    importancia: 'Importância',
    referencias: 'Referências',
  };
  const getSectionTitle = (section) => {
    const heading = section.querySelector('.section__heading h2, h1');
    return heading?.textContent?.trim() || null;
  };

  const formatPageNumber = (index) => String(index).padStart(2, '0');

  sections.forEach((section, index) => {
    section.dataset.pageIndex = String(index);
    if (section.id) {
      sectionIndexMap.set(section.id, index);
    }
    const title = getSectionTitle(section);
    if (title) {
      section.setAttribute('aria-label', title);
    }
  });

  const applyAccessibilityState = () => {
    if (shouldUsePaging()) {
      sections.forEach((section, index) => {
        section.setAttribute('tabindex', '-1');
        section.setAttribute('aria-hidden', index === currentPage ? 'false' : 'true');
      });
    } else {
      sections.forEach((section) => {
        section.removeAttribute('tabindex');
        section.removeAttribute('aria-hidden');
      });
    }
  };

  const ensurePageBanners = () => {
    sections.forEach((section, index) => {
      const overrideTitle = section.id ? titleOverrides[section.id] : null;
      const resolvedTitle = overrideTitle || getSectionTitle(section) || `Página ${formatPageNumber(index)}`;
      const currentBanner = section.querySelector('.page-banner');
      if (currentBanner) {
        const indexNode = currentBanner.querySelector('.page-banner__index');
        const titleNode = currentBanner.querySelector('.page-banner__title');
        if (indexNode) {
          indexNode.textContent = formatPageNumber(index);
        }
        if (titleNode) {
          titleNode.textContent = resolvedTitle;
        }
        return;
      }
      const banner = document.createElement('div');
      banner.className = 'page-banner';
      banner.setAttribute('aria-hidden', 'true');
      banner.innerHTML = `<span class="page-banner__index">${formatPageNumber(index)}</span><span class="page-banner__title">${resolvedTitle}</span>`;
      section.prepend(banner);
    });
  };

  ensurePageBanners();

  const focusSection = (section) => {
    const focusable = section.querySelector(
      'h1, h2, h3, .hero__cta, button, a, [tabindex]:not([tabindex="-1"])'
    );
    const target = focusable instanceof HTMLElement ? focusable : section;
    if (target instanceof HTMLElement) {
      requestAnimationFrame(() => {
        target.focus({ preventScroll: true });
      });
    }
  };

  const updateUi = () => {
    if (shouldUsePaging()) {
      magazine.style.setProperty('--magazine-page', String(currentPage));
      const progress = ((currentPage + 1) / totalPages) * 100;
      magazine.style.setProperty('--magazine-progress', `${progress}%`);
    } else {
      magazine.style.removeProperty('--magazine-page');
      magazine.style.removeProperty('--magazine-progress');
    }

    if (currentLabel) {
      currentLabel.textContent = String(currentPage + 1);
    }
    magazine.dataset.currentPage = String(currentPage);

    const statusValue = `Página ${currentPage + 1} de ${totalPages}`;
    if (statusLabel) {
      statusLabel.textContent = statusValue;
      statusLabel.setAttribute('data-page', `${currentPage + 1}/${totalPages}`);
    }

    const disablePrev = currentPage === 0 || !shouldUsePaging();
    const disableNext = currentPage === totalPages - 1 || !shouldUsePaging();

    prevButtons.forEach((button) => {
      button.disabled = disablePrev;
    });
    nextButtons.forEach((button) => {
      button.disabled = disableNext;
    });

    applyAccessibilityState();
  };

  const goToPage = (index, options = {}) => {
    const { focus = false, scroll = true, updateHash = true } = options;
    if (!shouldUsePaging()) {
      return false;
    }
    if (index < 0 || index >= totalPages) {
      return false;
    }
    const hasChanged = currentPage !== index;
    currentPage = index;
    updateUi();
    if (scroll) {
      const behavior = hasChanged ? 'smooth' : 'auto';
      const targetTop = magazine.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(targetTop, 0),
        behavior,
      });
    }
    const activeSection = sections[currentPage];
    if (focus) {
      focusSection(activeSection);
    }
    if (updateHash && activeSection?.id) {
      history.replaceState(null, '', `#${activeSection.id}`);
    }
    return true;
  };

  compactMedia.addEventListener('change', () => {
    applyAccessibilityState();
    updateUi();
  });

  const goToSection = (id, options = {}) => {
    const cleanId = id.replace(/^#/, '');
    if (!cleanId) {
      return false;
    }
    let targetIndex = sectionIndexMap.get(cleanId);
    if (targetIndex === undefined) {
      const targetElement = document.getElementById(cleanId);
      if (!targetElement) {
        return false;
      }
      const hostSection = targetElement.closest('section[id]');
      if (!hostSection) {
        return false;
      }
      targetIndex = sectionIndexMap.get(hostSection.id);
      if (targetIndex === undefined) {
        return false;
      }
    }
    return goToPage(targetIndex, options);
  };

  prevButtons.forEach((button) => {
    button.addEventListener('click', () => {
      goToPage(currentPage - 1, { focus: true });
    });
  });

  nextButtons.forEach((button) => {
    button.addEventListener('click', () => {
      goToPage(currentPage + 1, { focus: true });
    });
  });

  magazineNavigationHandler = (targetId, options = {}) => goToSection(targetId, options);

  magazineHotkeysHandler = (event) => {
    if (event.key === 'ArrowRight') {
      const moved = goToPage(currentPage + 1, { focus: true });
      if (moved) {
        event.preventDefault();
      }
    } else if (event.key === 'ArrowLeft') {
      const moved = goToPage(currentPage - 1, { focus: true });
      if (moved) {
        event.preventDefault();
      }
    }
  };

  const bindInternalAnchors = () => {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      if (link.closest('.main-nav')) {
        return;
      }
      if (link.dataset.magazineBound === 'true') {
        return;
      }
      link.dataset.magazineBound = 'true';
      link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') {
          return;
        }
        const targetId = href.slice(1);
        if (!targetId) {
          return;
        }
        const handled = goToSection(targetId, { focus: true });
        if (handled) {
          event.preventDefault();
        }
      });
    });
  };

  bindInternalAnchors();

  magazine.classList.add('is-enhanced');
  updateUi();

  if (window.location.hash) {
    const initialId = window.location.hash.slice(1);
    if (initialId) {
      goToSection(initialId, { focus: false, scroll: false, updateHash: false });
    }
  }

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (!hash) {
      return;
    }
    goToSection(hash, { focus: false, scroll: true, updateHash: false });
  });
};
syncFullscreenUi(isMagazineFullscreen());

initializeMagazine();
