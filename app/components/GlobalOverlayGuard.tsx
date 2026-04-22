"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SELECTORS = {
  modalWrap: ".ant-modal-wrap",
  modalMask: ".ant-modal-mask",
  modal: ".ant-modal",
  drawerRoot: ".ant-drawer",
  drawerMask: ".ant-drawer-mask",
  drawerContent: ".ant-drawer-content-wrapper",
  dropdown: ".ant-dropdown",
};

const isVisible = (element: Element | null) => {
  if (!element) return false;
  const el = element as HTMLElement;
  const style = window.getComputedStyle(el);
  const hasLayoutBox = el.offsetWidth > 0 || el.offsetHeight > 0;
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0" &&
    hasLayoutBox
  );
};

export default function GlobalOverlayGuard() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const clearStaleOverlays = () => {
      const hasVisibleModal = Array.from(
        document.querySelectorAll(SELECTORS.modalWrap)
      ).some((node) => {
        const wrap = node as HTMLElement;
        const modal = wrap.querySelector(SELECTORS.modal);
        return isVisible(wrap) && isVisible(modal);
      });

      const hasVisibleDrawer = Array.from(
        document.querySelectorAll(SELECTORS.drawerRoot)
      ).some((node) => {
        const root = node as HTMLElement;
        if (!root.classList.contains("ant-drawer-open")) return false;
        const content = root.querySelector(SELECTORS.drawerContent);
        return isVisible(content);
      });

      const hasVisibleDropdown = Array.from(
        document.querySelectorAll(SELECTORS.dropdown)
      ).some((node) => isVisible(node));

      if (hasVisibleModal || hasVisibleDrawer || hasVisibleDropdown) return;

      document
        .querySelectorAll(`${SELECTORS.modalMask}, ${SELECTORS.drawerMask}`)
        .forEach((mask) => {
          const el = mask as HTMLElement;
          el.style.pointerEvents = "none";
          el.style.display = "none";
        });

      document
        .querySelectorAll(`${SELECTORS.modalWrap}, ${SELECTORS.drawerRoot}`)
        .forEach((wrapper) => {
          const el = wrapper as HTMLElement;
          const visibleModal = el.querySelector(SELECTORS.modal);
          const visibleDrawer = el.querySelector(SELECTORS.drawerContent);
          if (!isVisible(visibleModal) && !isVisible(visibleDrawer)) {
            el.style.pointerEvents = "none";
            el.style.display = "none";
          }
        });

      // Reset body lock side effects when no overlay is visible.
      document.body.classList.remove("ant-scrolling-effect");
      document.body.style.overflow = "";
      document.body.style.width = "";
      document.body.style.pointerEvents = "auto";
      document.documentElement.style.pointerEvents = "auto";
    };

    clearStaleOverlays();
    const timeout = window.setTimeout(clearStaleOverlays, 250);
    const interval = window.setInterval(clearStaleOverlays, 1200);
    const observer = new MutationObserver(() => clearStaleOverlays());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}

