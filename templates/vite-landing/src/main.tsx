import "./index.css";

const start = () => void import("./start");

if (!document.getElementById("root")!.hasChildNodes()) {
  // Dev: the page starts empty and React renders it.
  start();
} else {
  // Build: index.html already has the first screen (vite.config.ts). Let the browser paint it, then load React and attach
  // it; the links in the first screen work before that.
  let started = false;
  const once = () => {
    if (started) return;
    started = true;
    setTimeout(start);
  };
  if (PerformanceObserver.supportedEntryTypes?.includes("paint")) {
    new PerformanceObserver((list, observer) => {
      if (list.getEntriesByName("first-contentful-paint").length === 0) return;
      observer.disconnect();
      once();
    }).observe({ type: "paint", buffered: true });
    // A tab opened in the background doesn't paint until it is shown: start anyway.
    setTimeout(once, 2000);
  } else {
    requestAnimationFrame(once);
  }
}
