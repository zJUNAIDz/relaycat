/**
 * Pins the document to the *visual* viewport for full-height, non-scrolling views.
 *
 * When the soft keyboard opens, mobile browsers shrink the visual viewport but leave the
 * layout viewport (and therefore 100vh/100dvh on iOS) at its full height. The document stays
 * taller than the visible area, so the user can pan the page and drag the composer out of
 * view. Mirroring the visual viewport height into `--app-height` keeps the shell exactly as
 * tall as what is actually visible, leaving the message list the only scrollable region.
 *
 * Returns a cleanup function that restores the default height.
 */
export function pinToVisualViewport(): () => void {
  const viewport = window.visualViewport;
  if (!viewport) return () => { };

  const root = document.documentElement;

  const apply = () => {
    root.style.setProperty("--app-height", `${viewport.height}px`);
    // Undo the pan the browser performs to reveal the focused input: the shell already
    // fits the visible area, so any document offset is what scrolls the composer away.
    window.scrollTo(0, 0);
  };

  apply();
  viewport.addEventListener("resize", apply);
  viewport.addEventListener("scroll", apply);

  return () => {
    viewport.removeEventListener("resize", apply);
    viewport.removeEventListener("scroll", apply);
    root.style.removeProperty("--app-height");
  };
}
