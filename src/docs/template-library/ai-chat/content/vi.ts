import type { Content } from "./types";

const vi: Content = {
  lang: "vi",
  locale: "vi-VN",
  appName: "Sakura Chat",
  assistantName: "Sakura",
  you: "Bạn",
  nav: {
    open: "Mở danh sách hội thoại",
    label: "Hội thoại",
    newChat: "Trò chuyện mới",
    settings: "Cài đặt",
    empty: "Chưa có hội thoại nào.",
    groups: { today: "Hôm nay", week: "7 ngày qua", older: "Cũ hơn" },
    options: (title) => `Tuỳ chọn cho ${title}`,
    replying: "Đang trả lời",
  },
  appearance: {
    label: "Giao diện",
    mode: "Chế độ",
    brand: "Thương hiệu",
    themes: { light: "Sáng", dark: "Tối", "high-contrast": "Tương phản cao" },
  },
  chat: {
    newTitle: "Trò chuyện mới",
    log: "Tin nhắn",
    greeting: "Mình có thể giúp gì cho bạn?",
    intro: "Câu trả lời đến từ backend mẫu chạy tại chỗ cho tới khi bạn nối backend của mình trong src/api.ts.",
    suggestionsLabel: "Gợi ý",
    suggestions: [
      { title: "Lên kế hoạch du lịch", prompt: "Lên lịch trình 3 ngày ở Kyoto" },
      { title: "Giải thích code", prompt: "Giải thích AbortController kèm ví dụ" },
      { title: "Viết email", prompt: "Viết email lịch sự nhắc khách thanh toán hoá đơn" },
      { title: "So sánh lựa chọn", prompt: "So sánh localStorage và IndexedDB" },
    ],
    placeholder: "Hỏi bất cứ điều gì…",
    escToStop: "để dừng",
    disclaimer: "AI có thể nhầm. Hãy kiểm tra thông tin quan trọng.",
    stopped: "Đã dừng",
    errorTitle: "Không tải được câu trả lời",
    retry: "Thử lại",
    copy: "Sao chép",
    copied: "Đã sao chép",
    copyFailed: "Không sao chép được vào bộ nhớ tạm",
    regenerate: "Tạo lại",
    actions: "Thao tác với tin nhắn",
    working: "Đang thực hiện…",
    ranSteps: (count) => `Đã chạy ${count} bước`,
    steps: "Các bước",
    attachments: "Tệp đính kèm",
    options: "Tuỳ chọn hội thoại",
    rename: "Đổi tên",
    delete: "Xoá",
  },
  rename: { title: "Đổi tên hội thoại", label: "Tên", save: "Lưu", cancel: "Huỷ" },
  remove: {
    title: "Xoá hội thoại?",
    body: (title) => `“${title}” sẽ bị xoá khỏi trình duyệt này và không khôi phục được.`,
    confirm: "Xoá",
    cancel: "Huỷ",
    done: "Đã xoá hội thoại",
  },
  notFound: {
    title: "Không tìm thấy trang",
    body: "Địa chỉ có thể sai hoặc trang đã được chuyển đi.",
    chatTitle: "Không tìm thấy hội thoại",
    chatBody: "Hội thoại có thể đã bị xoá, hoặc được lưu trên một trình duyệt khác.",
    action: "Bắt đầu trò chuyện mới",
  },
  settings: {
    title: "Cài đặt",
    description: "Lưu trên trình duyệt này.",
    appearance: { title: "Giao diện", description: "Chế độ sáng tối và màu thương hiệu." },
    data: {
      title: "Hội thoại",
      description: (count) =>
        `Có ${count} hội thoại được lưu trong localStorage của trình duyệt này. Tệp đính kèm không được lưu, chỉ giữ tên tệp.`,
      export: "Xuất ra JSON",
      clear: "Xoá tất cả",
      clearTitle: "Xoá mọi hội thoại?",
      clearBody: "Mọi hội thoại sẽ bị xoá khỏi trình duyệt này và không khôi phục được.",
      clearConfirm: "Xoá tất cả",
      cancel: "Huỷ",
      cleared: "Đã xoá mọi hội thoại",
    },
    backend: {
      title: "Backend",
      description: "Câu trả lời đến từ backend mẫu trong src/api.ts. Thay hàm sendMessage ở đó để dùng endpoint của bạn.",
      fail: "Giả lập lỗi khi trả lời",
      failHint: "Chỉ áp dụng cho backend mẫu, dùng để xem trạng thái lỗi.",
    },
  },
  mock: {
    replies: [
      {
        match: ["kyoto"],
        reasoning:
          "Người dùng cần lịch trình 3 ngày ở Kyoto. Gom điểm tham quan theo khu để mỗi ngày ít phải đi lại: phía đông (Higashiyama), tây bắc (Arashiyama, Kinkaku-ji) và phía nam (Fushimi Inari). Nơi đông khách nên tới từ sáng sớm.",
        steps: ["Tìm cẩm nang du lịch Kyoto", "Gom điểm tham quan theo khu", "Kiểm tra giờ mở cửa"],
        answer: `Đây là lịch trình 3 ngày, gom điểm đến theo khu để đỡ phải đi lại.

### Ngày 1: Higashiyama
- **Sáng:** chùa Kiyomizu-dera, rồi đi bộ xuống dốc Sannenzaka và Ninenzaka.
- **Chiều:** đền Yasaka và công viên Maruyama.
- **Tối:** ăn tối ở Gion. Các con hẻm quanh Hanamikoji vắng hơn sau 8 giờ tối.

### Ngày 2: Arashiyama và Kinkaku-ji
- Tới **rừng tre** trước 8 giờ sáng để tránh đông[1].
- Dạo vườn chùa Tenryu-ji, rồi đi tàu một đoạn ngắn tới Kinkaku-ji.

### Ngày 3: Fushimi Inari
- Đi bộ qua các cổng torii lên điểm ngắm cảnh Yotsutsuji, khoảng 90 phút cả đi lẫn về[2].
- Buổi chiều dạo chợ Nishiki.

Nên đặt bàn trước cho bữa tối ở Gion vì nhiều quán kín chỗ từ sớm.`,
        sources: [
          { title: "Kyoto City Official Travel Guide", url: "https://kyoto.travel/en/", snippet: "Điểm tham quan, mùa đẹp và cách đi lại ở Kyoto." },
          { title: "Fushimi Inari Taisha", url: "https://inari.jp/en/", snippet: "Đền chính của thần Inari, nổi tiếng với hàng nghìn cổng torii." },
        ],
      },
      {
        match: ["abortcontroller", "abort signal"],
        reasoning:
          "Giải thích AbortController dùng để làm gì, rồi minh hoạ ba bước bằng code: tạo controller, truyền signal, gọi abort(). Nói thêm rằng fetch bị huỷ sẽ reject với AbortError.",
        steps: ["Tra AbortController trên MDN", "Viết ví dụ"],
        answer: `\`AbortController\` huỷ một việc đang chạy, ví dụ một request \`fetch\`[1].

1. Tạo controller và truyền \`signal\` của nó vào request.
2. Gọi \`abort()\` khi không cần kết quả nữa.
3. Request sẽ reject với \`AbortError\`, có thể bỏ qua lỗi này.

\`\`\`ts
const controller = new AbortController();

fetch("/api/chat", { method: "POST", body, signal: controller.signal })
  .then((res) => res.json())
  .catch((error) => {
    if (error.name !== "AbortError") throw error;
  });

// Sau đó, ví dụ khi người dùng nhấn Esc:
controller.abort();
\`\`\`

\`AbortSignal.timeout(5000)\` cho một signal tự huỷ sau 5 giây[2]. Ứng dụng chat này dùng chính signal đó để dừng câu trả lời.`,
        sources: [
          {
            title: "AbortController",
            url: "https://developer.mozilla.org/en-US/docs/Web/API/AbortController",
            snippet: "Đối tượng cho phép huỷ một hoặc nhiều request web khi cần.",
          },
          {
            title: "AbortSignal: timeout() static method",
            url: "https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static",
            snippet: "Trả về một AbortSignal tự huỷ sau khoảng thời gian cho trước.",
          },
        ],
      },
      {
        match: ["hoá đơn", "hóa đơn"],
        reasoning:
          "Email nhắc thanh toán nên ngắn và thân thiện: có số hoá đơn, số tiền, hạn thanh toán, tính tới khả năng khách đã chuyển khoản, và dễ trả lời lại.",
        steps: ["Soạn email", "Kiểm tra giọng văn"],
        answer: `**Tiêu đề:** Nhắc thanh toán hoá đơn #1042 (hạn 30/5)

Chào chị Mai,

Em gửi chị lời nhắc nhỏ: hoá đơn #1042 với số tiền 12.500.000 ₫ đã đến hạn thanh toán vào ngày 30/5. Nếu chị đã chuyển khoản thì em cảm ơn chị, chị bỏ qua email này giúp em nhé.

Thông tin chuyển khoản có trong hoá đơn. Nếu có gì chưa rõ, chị cứ trả lời email này.

Trân trọng,
Lan`,
      },
      {
        match: ["localstorage", "indexeddb"],
        reasoning:
          "So sánh hai cách theo kiểu API, loại dữ liệu, dung lượng và trường hợp nên dùng. Dạng bảng là hợp nhất. Liên hệ với cách template này lưu hội thoại.",
        steps: ["Đọc tài liệu về lưu trữ", "Lập bảng so sánh"],
        answer: `| | localStorage | IndexedDB |
| --- | --- | --- |
| API | Đồng bộ | Bất đồng bộ |
| Lưu được | Chỉ chuỗi | Object, tệp và blob |
| Dung lượng | Khoảng 5 MB mỗi origin | Lớn hơn nhiều, tuỳ dung lượng ổ đĩa còn trống[1] |
| Hợp với | Cài đặt, bản nháp nhỏ | Dữ liệu offline, danh sách lớn[2] |

Template này lưu hội thoại trong \`localStorage\`. Khi dữ liệu vượt quá vài MB, hãy chuyển sang IndexedDB hoặc lưu trên server.`,
        sources: [
          {
            title: "Storage quotas and eviction criteria",
            url: "https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria",
            snippet: "Trình duyệt cho mỗi trang lưu bao nhiêu dữ liệu, và khi nào thì xoá.",
          },
          {
            title: "IndexedDB API",
            url: "https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API",
            snippet: "API cấp thấp để lưu lượng lớn dữ liệu có cấu trúc ở phía trình duyệt.",
          },
        ],
      },
    ],
    fallback: {
      reasoning: "Không có câu trả lời soạn sẵn cho câu hỏi này, nên giải thích câu trả lời thật sẽ đến từ đâu.",
      steps: ["Đọc câu hỏi", "Viết câu trả lời"],
      answer: (quote) => `Câu trả lời này đến từ backend mẫu trong \`src/api.ts\`. Bạn đã hỏi:

${quote}

Muốn có câu trả lời thật, hãy thay \`sendMessage\` bằng lời gọi tới endpoint của bạn. README hướng dẫn cách làm mà không cần đưa API key lên trình duyệt.

Thử một gợi ý ở trang Trò chuyện mới để xem suy luận, các bước, nguồn và code.`,
    },
    readFile: (name) => `Đọc ${name}`,
    attachmentNote: (names) =>
      `\n\nBackend mẫu không mở ${names}. Trong ứng dụng thật, hãy tải tệp lên server của bạn rồi gửi kèm mã tham chiếu trong tin nhắn.`,
    error: "Server không phản hồi (giả lập). Tắt “Giả lập lỗi khi trả lời” trong Cài đặt để nhận câu trả lời trở lại.",
  },
  seed: [
    { title: "3 ngày ở Kyoto", prompt: "Lên lịch trình 3 ngày ở Kyoto", reply: 0, hoursAgo: 2 },
    { title: "Ví dụ AbortController", prompt: "Giải thích AbortController kèm ví dụ", reply: 1, hoursAgo: 52 },
    { title: "localStorage hay IndexedDB", prompt: "So sánh localStorage và IndexedDB", reply: 3, hoursAgo: 24 * 12 },
  ],
};

export default vi;
