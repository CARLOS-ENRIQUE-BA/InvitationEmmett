const wrapper = document.getElementById("wrapper");
const scroll = document.getElementById("scroll");

wrapper.addEventListener("click", () => {
  wrapper.classList.toggle("active");
  scroll.classList.toggle("open");
  scroll.classList.toggle("closed");
  // Reposicionar overlay por si cambia el layout
  positionTapOverlay();
});

document.querySelectorAll(".confirm-button").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
  });
});
document.querySelectorAll(".copy-account").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    let account = btn.getAttribute("data-account");
    if (!account) {
      const valEl = btn.querySelector(".account-value");
      if (valEl) {
        account = (valEl.textContent || "").replace(/\s+/g, "");
      }
    }
    const hint = btn.querySelector(".copy-hint");
    if (!account) return;
    const copy = async () => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(account);
        } else {
          const ta = document.createElement("textarea");
          ta.value = account;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        if (hint) {
          const prev = hint.textContent;
          hint.textContent = "¡Copiado!";
          setTimeout(() => (hint.textContent = prev || "Toca para copiar"), 1200);
        }
      } catch {}
    };
    copy();
  });
});

function initAutoCarousel() {
  const tracks = document.querySelectorAll(".carousel-track");
  tracks.forEach((track) => {
    const baseItems = Array.from(track.querySelectorAll(".carousel-item"));
    if (!baseItems.length) return;
    if (!track.dataset.cloned) {
      baseItems.forEach((it) => track.appendChild(it.cloneNode(true)));
      track.dataset.cloned = "true";
    }
    const style = getComputedStyle(track);
    const gap = parseFloat(style.gap) || 0;
    const itemWidth = baseItems[0].offsetWidth;
    const step = itemWidth + gap;
    const maxScroll = baseItems.length * step;
    let timer = null;
    const start = () => {
      if (timer) return;
      timer = setInterval(() => {
        track.scrollBy({ left: step, behavior: "smooth" });
        if (track.scrollLeft >= maxScroll) {
          track.scrollLeft = 0;
        }
      }, 2000);
    };
    const stop = () => {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    };
    track.addEventListener("mouseenter", stop);
    track.addEventListener("mouseleave", start);
    track.addEventListener("touchstart", stop, { passive: true });
    track.addEventListener(
      "touchend",
      () => {
        setTimeout(start, 3000);
      },
      { passive: true }
    );
    if (wrapper.classList.contains("active")) start();
    wrapper.addEventListener("click", () => {
      if (wrapper.classList.contains("active")) start();
      else stop();
    });
  });
}

document.addEventListener("DOMContentLoaded", initAutoCarousel);

const audio = document.getElementById("bg-audio");
const muteToggle = document.getElementById("muteToggle");
if (muteToggle) {
  muteToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!audio) return;
    audio.muted = !audio.muted;
    muteToggle.textContent = audio.muted ? "🔇" : "🔊";
  });
}

wrapper.addEventListener("click", () => {
  if (wrapper.classList.contains("active") && audio) {
    audio.play().catch(() => {});
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (!audio) return;
  audio.loop = true;
  const ensurePlay = () =>
    audio.play().catch(() => {
      audio.muted = true;
      if (muteToggle) muteToggle.textContent = "🔇";
      return audio.play().catch(() => {});
    });
  ensurePlay();
  const intro = document.getElementById("introOverlay");
  if (intro) {
    setTimeout(() => {
      intro.classList.add("hide");
      setTimeout(() => intro.remove(), 800);
    }, 2000);
  }
  positionTapOverlay();
});

function positionTapOverlay() {
  const tap = document.getElementById("tapOverlay");
  const capTop = document.querySelector(".cap.top");
  const capBottom = document.querySelector(".cap.bottom");
  if (!tap || !capTop || !capBottom || !wrapper) return;
  const topBottomY = capTop.offsetTop + capTop.offsetHeight;
  const bottomTopY = capBottom.offsetTop; // inicio del extremo inferior
  const midY = (topBottomY + bottomTopY) / 2;
  // Centrar el indicador alrededor del punto medio
  const tapHeight = tap.offsetHeight || 40;
  tap.style.top = Math.max(0, midY - tapHeight / 2) + "px";
}

window.addEventListener("resize", () => {
  positionTapOverlay();
});
