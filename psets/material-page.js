(function () {
  const delimiters = [
    { left: "$$", right: "$$", display: true },
    { left: "\\[", right: "\\]", display: true },
    { left: "\\(", right: "\\)", display: false },
    { left: "$", right: "$", display: false }
  ];

  function renderMath() {
    if (!window.renderMathInElement) return false;
    renderMathInElement(document.body, {
      delimiters,
      throwOnError: false
    });
    document.documentElement.classList.add("math-ready");
    return true;
  }

  function loadScript(src, onload) {
    const script = document.createElement("script");
    script.src = src;
    script.onload = onload;
    script.onerror = function () {
      document.documentElement.classList.add("math-load-failed");
    };
    document.head.appendChild(script);
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (renderMath()) return;
    loadScript("https://unpkg.com/katex@0.16.9/dist/katex.min.js", function () {
      loadScript("https://unpkg.com/katex@0.16.9/dist/contrib/auto-render.min.js", function () {
        if (!renderMath()) {
          document.documentElement.classList.add("math-load-failed");
        }
      });
    });
  });
})();
