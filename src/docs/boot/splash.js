// Màn chờ của docs (#236), script thường (không phải module) nên chạy ngay, trước mọi file của app.
// - Dev: plugin yugenBootSplash (vite.plugins.ts) chèn nguyên văn vào <head>, sau script áp theme / ngôn ngữ của index.html;
//   markup và CSS có sẵn trong HTML.
// - Bản build: chỉ nạp khi trang không có HTML prerender để hiện (404.html, hoặc data-pending: prerender bị ẩn vì khác
//   ngôn ngữ / RTL). Plugin bọc script trong hàm nhận YB_CSS, YB_MARKUP và script tự gắn chúng vào trang.
//
// Tiến độ là thật: đếm file cùng origin (module JS, CSS) đã tải xong, so với số file của lần tải trước (localStorage). Thanh
// dừng ở 95% tới khi App render xong (html[data-docs-ready], đặt trong App.tsx) rồi mới chạy nốt tới 100. Lần đầu chưa có số
// đo thì lấy FIRST_GUESS. Tiến độ vẽ ra hai chỗ: nét cọ ở giữa và logo enso ở góc (hoa nở khi đủ 100); số Hán viết dọc ở mép.
// Giảm chuyển động: mực đậm dần tại chỗ thay vì chạy theo nét bút, không mờ dần khi đóng.
(function () {
  var root = document.documentElement;
  if (!window.PerformanceObserver || !window.requestAnimationFrame) return;
  var BUILD = typeof YB_MARKUP === "string";
  if (BUILD) {
    var style = document.createElement("style");
    style.textContent = YB_CSS;
    document.head.appendChild(style);
    var holder = document.createElement("div");
    holder.innerHTML = YB_MARKUP;
    (document.body || root).appendChild(holder.firstElementChild);
  }
  root.setAttribute("data-boot", "");

  var KEY = BUILD ? "yugen-docs-boot-build" : "yugen-docs-boot";
  // Số file trang chủ tải trước lần render đầu (10/2026): dev phục vụ từng module, bản build gộp thành chunk.
  var FIRST_GUESS = BUILD ? 64 : 280;
  var expected = FIRST_GUESS;
  try {
    expected = Number(localStorage.getItem(KEY)) || FIRST_GUESS;
  } catch (e) {}
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var en = root.getAttribute("lang") === "en";
  var prerendered = root.hasAttribute("data-prerendered");
  var start = performance.now();
  var count = 0;
  var lastLoad = start;
  var ignore = /\.(png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf)(\?|$)/;
  try {
    performance.setResourceTimingBufferSize(5000);
  } catch (e) {}
  var observer = new PerformanceObserver(function (list) {
    list.getEntries().forEach(function (entry) {
      if (entry.name.indexOf(location.origin) !== 0 || ignore.test(entry.name)) return;
      count++;
      lastLoad = performance.now();
    });
  });
  try {
    observer.observe({ type: "resource", buffered: true });
  } catch (e) {
    observer.observe({ entryTypes: ["resource"] });
  }

  /** Tiến độ đo được, 0–0.95. Lần này nhiều file hơn lần trước thì nới mẫu số, thanh chỉ chậm lại chứ không lùi. */
  function measured() {
    return Math.min(0.95, count / Math.max(expected, count / 0.95));
  }
  function clamp(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }
  var DIGITS = "〇一二三四五六七八九";
  /** 0–100 bằng số Hán: 〇, 七, 十二, 四十, 九十九, 百 (cùng quy tắc với src/docs/boot/kanji.ts). */
  function kanji(n) {
    if (n >= 100) return "百";
    var tens = Math.floor(n / 10);
    var ones = n % 10;
    if (!tens) return DIGITS[ones];
    return (tens > 1 ? DIGITS[tens] : "") + "十" + (ones ? DIGITS[ones] : "");
  }

  var el = null;
  var shown = 0;
  var last = start;
  var doneAt = 0;
  var from = 0;
  var finish = 0;
  var number = -1;
  var failed = false;

  /** Chỉ lấy phần tử khi markup đã đọc xong (#yb-n ở cuối): HTML về chậm thì frame đầu có thể chạy khi mới có một nửa. */
  function find() {
    var box = document.getElementById("yugen-boot");
    if (!box || !box.querySelector("#yb-n")) return null;
    var parts = {
      box: box,
      n: box.querySelector("#yb-n"),
      brush: box.querySelector("#yb-brush"),
      ink: box.querySelector("#yb-ink"),
      stroke: box.querySelector("#yb-stroke"),
      revealA: box.querySelector("#yb-reveal-a"),
      revealB: box.querySelector("#yb-reveal-b"),
      petals: box.querySelectorAll(".yb-petal"),
      heart: box.querySelector(".yb-heart"),
      label: box.querySelector("#yb-label"),
      error: box.querySelector("#yb-error"),
    };
    box.setAttribute("aria-label", en ? "Loading Yugen UI" : "Đang mở Yugen UI");
    if (en) parts.label.textContent = "Loading";
    if (reduce) {
      parts.brush.setAttribute("stroke-dashoffset", "0");
      parts.revealA.setAttribute("offset", "1");
      parts.revealB.setAttribute("offset", "1");
    }
    return parts;
  }

  function paint(p) {
    var ink = clamp(p / 0.9);
    if (reduce) {
      el.ink.style.opacity = String(0.15 + 0.85 * ink);
      el.stroke.style.opacity = String(0.15 + 0.85 * p);
    } else {
      el.brush.setAttribute("stroke-dashoffset", String(100 - 100 * ink));
      // Đầu mực ở p, mép mềm ngay sau (cùng SOFT với src/docs/boot/ink.tsx).
      el.revealA.setAttribute("offset", String(Math.max(0, p - 0.024)));
      el.revealB.setAttribute("offset", String(p));
    }
    // Mực chạy tới đuôi thì hoa anh đào nở từng cánh; nhị hiện khi đủ 100.
    for (var i = 0; i < el.petals.length; i++) el.petals[i].style.opacity = String(clamp((p - 0.9 - i * 0.018) / 0.018));
    el.heart.style.opacity = p >= 1 ? "1" : "0";
    var n = p >= 1 ? 100 : Math.min(99, Math.floor(p * 100));
    if (n !== number) {
      number = n;
      el.n.textContent = kanji(n);
      el.box.setAttribute("aria-valuenow", String(n));
    }
  }

  function remove() {
    var box = document.getElementById("yugen-boot");
    if (box) box.remove();
    root.removeAttribute("data-boot");
  }

  function fail() {
    failed = true;
    var link = document.createElement("a");
    link.href = location.href;
    link.textContent = en ? "Reload" : "Tải lại";
    el.error.textContent = en ? "The page didn't load. " : "Không tải được trang. ";
    el.error.appendChild(link);
    root.setAttribute("data-boot", "error");
  }

  function frame(now) {
    if (!el) el = find();
    // Lỗi biên dịch: nhường chỗ cho overlay lỗi của Vite.
    if (document.querySelector("vite-error-overlay")) return remove();

    // Trang prerender hiện lại khi hết data-pending: App đã render, hoặc hẹn giờ trong index.html bỏ ẩn vì JS lỗi.
    var ready = root.hasAttribute("data-docs-ready") || (prerendered && !root.hasAttribute("data-pending"));
    if (!doneAt && ready) {
      doneAt = now;
      from = shown;
      observer.disconnect();
      if (count > 0 && root.hasAttribute("data-docs-ready")) {
        try {
          localStorage.setItem(KEY, String(count));
        } catch (e) {}
      }
      // Xong trước khi logo kịp hiện (200 ms, xem splash.css) thì bỏ qua đoạn chạy nốt.
      finish = reduce || now - start < 200 ? 0 : 400;
    }

    var dt = now - last;
    last = now;
    if (doneAt) shown = finish ? from + (1 - from) * clamp((now - doneAt) / finish) : 1;
    else shown = Math.max(shown, shown + (measured() - shown) * (1 - Math.exp(-dt / 220)));

    if (el) {
      paint(shown);
      if (!doneAt && !failed && now - lastLoad > 15000) fail();
    }
    if (shown < 1) {
      requestAnimationFrame(frame);
      return;
    }
    root.setAttribute("data-boot", "done");
    if (el) el.box.setAttribute("aria-hidden", "true");
    setTimeout(remove, finish ? 420 : 0);
  }

  requestAnimationFrame(frame);
})();
