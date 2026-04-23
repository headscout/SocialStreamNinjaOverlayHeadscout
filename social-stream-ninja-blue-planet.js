/*
  Social Stream Ninja - Blue Planet helper script
  Paste into: Custom JavaScript

  Public animation repository used:
  - tsParticles: https://github.com/tsparticles/tsparticles

  This script:
  1) injects a subtle animated starfield background
  2) soft-animates incoming chat messages
*/

(async () => {
  const STAR_LAYER_ID = "bp-stars-layer";
  const TS_PARTICLES_SCRIPT_ID = "tsparticles-cdn";

  function ensureStarLayer() {
    if (document.getElementById(STAR_LAYER_ID)) return;

    const layer = document.createElement("div");
    layer.id = STAR_LAYER_ID;
    layer.style.position = "fixed";
    layer.style.inset = "0";
    layer.style.zIndex = "0";
    layer.style.pointerEvents = "none";
    layer.style.opacity = "0.6";

    document.body.prepend(layer);
    document.body.style.position = document.body.style.position || "relative";
  }

  function loadTsParticles() {
    return new Promise((resolve, reject) => {
      if (window.tsParticles) return resolve(window.tsParticles);

      let script = document.getElementById(TS_PARTICLES_SCRIPT_ID);
      if (!script) {
        script = document.createElement("script");
        script.id = TS_PARTICLES_SCRIPT_ID;
        script.src = "https://cdn.jsdelivr.net/npm/tsparticles@3/tsparticles.bundle.min.js";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      script.onload = () => resolve(window.tsParticles);
      script.onerror = reject;
    });
  }

  function animateMessages() {
    const selectors = [".chatmessage", ".message", ".chat-item", "#chat > div", "#output > div"];
    const seen = new WeakSet();

    const markAndAnimate = (node) => {
      if (!(node instanceof HTMLElement) || seen.has(node)) return;
      seen.add(node);
      node.style.animation = "bpPopIn 460ms cubic-bezier(.2,.9,.2,1) both";
    };

    const scan = () => {
      selectors.forEach((sel) => document.querySelectorAll(sel).forEach(markAndAnimate));
    };

    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          const matched = selectors.some((sel) => node.matches?.(sel));
          if (matched) markAndAnimate(node);

          selectors.forEach((sel) => node.querySelectorAll?.(sel).forEach(markAndAnimate));
        });
      }
    });

    obs.observe(document.body, { childList: true, subtree: true });

    const style = document.createElement("style");
    style.textContent = `
      @keyframes bpPopIn {
        0% { transform: translateY(8px) scale(.98); opacity: 0; filter: blur(2px); }
        100% { transform: translateY(0) scale(1); opacity: 1; filter: blur(0); }
      }
    `;
    document.head.appendChild(style);

    scan();
  }

  try {
    ensureStarLayer();
    await loadTsParticles();

    await window.tsParticles.load({
      id: STAR_LAYER_ID,
      options: {
        fullScreen: { enable: false },
        background: { color: "transparent" },
        detectRetina: true,
        fpsLimit: 60,
        particles: {
          number: { value: 55, density: { enable: true, area: 1000 } },
          color: { value: ["#76c9ff", "#b4e5ff", "#4aa9ff"] },
          opacity: { value: { min: 0.15, max: 0.7 } },
          size: { value: { min: 1, max: 3 } },
          move: {
            enable: true,
            speed: { min: 0.1, max: 0.45 },
            direction: "none",
            outModes: { default: "out" }
          },
          links: {
            enable: true,
            distance: 120,
            color: "#6ec2ff",
            opacity: 0.14,
            width: 1
          }
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: "grab" },
            resize: { enable: true }
          },
          modes: {
            grab: {
              distance: 150,
              links: { opacity: 0.25 }
            }
          }
        }
      }
    });

    animateMessages();
  } catch (err) {
    console.warn("Blue Planet theme JS failed:", err);
  }
})();