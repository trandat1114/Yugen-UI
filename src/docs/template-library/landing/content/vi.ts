import type { Content } from "./types";

const vi: Content = {
  lang: "vi",
  locale: "vi-VN",
  currency: "VND",
  product: {
    name: "Sakura Notes",
    title: "Sakura Notes · Ghi chú nhóm, cần là tìm thấy",
    description:
      "Biên bản họp, đặc tả và quyết định ở cùng một nơi cả nhóm tìm được. Miễn phí cho nhóm tới 5 người.",
  },
  nav: { label: "Chính", features: "Tính năng", pricing: "Bảng giá", faq: "Hỏi đáp", signUp: "Dùng miễn phí", footer: "Chân trang" },
  appearance: { label: "Giao diện", themes: { light: "Sáng", dark: "Tối", "high-contrast": "Tương phản cao" } },
  hero: {
    badge: "Mới: mẫu ghi chú dùng chung",
    title: "Ghi chú nhóm, cần là tìm thấy",
    lead: "Sakura Notes giữ biên bản họp, đặc tả và các quyết định ở cùng một nơi. Tìm kiếm ra kết quả trong một giây, bình luận nằm ngay cạnh đoạn văn đang bàn.",
    primary: "Dùng miễn phí",
    secondary: "Xem bảng giá",
    note: "Miễn phí cho nhóm tới 5 người. Không cần thẻ.",
    shot: {
      label: "Sakura Notes đang mở một biên bản họp trong không gian Sản phẩm",
      spaces: ["Sản phẩm", "Thiết kế", "Kỹ thuật"],
      notes: ["Họp sản phẩm hằng tuần", "Lộ trình quý 4", "Danh sách nhận việc"],
      title: "Họp sản phẩm hằng tuần",
      meta: "Mai sửa · 2 phút trước",
      body: "Bản 2.4 dời sang thứ Năm để phát hành cùng bản sửa lỗi nhập dữ liệu.",
      tasks: ["Gửi bản beta cho nhóm hỗ trợ", "Cập nhật nhật ký thay đổi"],
      comment: { author: "Leo", text: "Thứ Năm thì nhóm tài liệu kịp." },
    },
  },
  logos: { title: "Các nhóm ở những công ty này đang viết trên Sakura Notes" },
  features: {
    title: "Mọi thứ nhóm viết, ở cùng một nơi",
    lead: "Bớt tab, bớt những câu “mình ghi cái đó ở đâu nhỉ?”.",
    items: [
      { icon: "search", title: "Tìm là thấy", body: "Tiêu đề, nội dung, thẻ và bình luận, trong mọi không gian bạn được mở." },
      { icon: "spaces", title: "Không gian cho từng nhóm", body: "Mỗi nhóm hoặc dự án một không gian, có thành viên và vai trò đơn giản." },
      { icon: "comments", title: "Bình luận và nhắc tên", body: "Bàn ngay tại đoạn văn; nhắc tên để mời người khác vào cuộc." },
      { icon: "templates", title: "Mẫu dùng chung", body: "Biên bản họp, đặc tả và họp nhìn lại luôn bắt đầu từ cùng một trang." },
      { icon: "offline", title: "Dùng được khi mất mạng", body: "Viết trên tàu; thay đổi tự đồng bộ khi có mạng trở lại." },
      { icon: "history", title: "Lịch sử phiên bản", body: "Xem ai đã sửa gì và khôi phục bất kỳ phiên bản cũ nào của ghi chú." },
    ],
  },
  pricing: {
    title: "Giá đơn giản",
    lead: "Bắt đầu miễn phí. Trả theo số người khi nhóm lớn lên.",
    period: { label: "Chu kỳ thanh toán", monthly: "Theo tháng", yearly: "Theo năm", save: "Tiết kiệm 20%" },
    perPerson: "mỗi người / tháng",
    billedMonthly: "Thanh toán hằng tháng",
    billedYearly: (total) => `${total} mỗi người, thanh toán theo năm`,
    freeForever: "Miễn phí, không giới hạn thời gian",
    featured: "Được chọn nhiều nhất",
    plans: [
      {
        id: "free",
        name: "Miễn phí",
        description: "Cho nhóm nhỏ dùng thử.",
        price: { monthly: 0, yearly: 0 },
        features: ["Tối đa 5 người", "3 không gian", "Lịch sử phiên bản 30 ngày"],
        cta: "Dùng miễn phí",
      },
      {
        id: "team",
        name: "Nhóm",
        description: "Cho nhóm viết mỗi ngày.",
        price: { monthly: 159000, yearly: 127000 },
        features: ["Không giới hạn người và không gian", "Mẫu dùng chung", "Toàn bộ lịch sử phiên bản", "Khách được xem"],
        cta: "Dùng thử gói Nhóm 14 ngày",
        featured: true,
      },
      {
        id: "business",
        name: "Doanh nghiệp",
        description: "Cho công ty có nhiều nhóm.",
        price: { monthly: 299000, yearly: 239000 },
        features: ["Mọi thứ của gói Nhóm", "Đăng nhập một lần (SAML)", "Nhật ký kiểm tra", "Hỗ trợ ưu tiên"],
        cta: "Dùng thử gói Doanh nghiệp 14 ngày",
      },
    ],
  },
  testimonials: {
    title: "Các nhóm nói gì",
    items: [
      {
        quote: "Biên bản họp của chúng tôi từng nằm rải rác ở năm ứng dụng. Giờ người mới tìm được quyết định của năm ngoái ngay ngày đầu đi làm.",
        name: "Hana Sato",
        role: "Quản lý kỹ thuật, Kumo",
      },
      {
        quote: "Bộ mẫu giúp đặc tả của chúng tôi tốt lên hơn mọi tài liệu quy trình. Đặc tả nào giờ cũng trả lời cùng những câu hỏi.",
        name: "Daniel Okafor",
        role: "Trưởng nhóm sản phẩm, Riverline",
      },
      {
        quote: "Chúng tôi cho một nhóm dùng thử một tháng. Ba tháng sau cả công ty đều viết ở đây.",
        name: "Nguyễn Thuỳ Linh",
        role: "Trưởng nhóm vận hành, Tidepool",
      },
    ],
  },
  faq: {
    title: "Hỏi đáp",
    lead: "Còn điều gì bạn muốn hỏi?",
    contact: "Viết cho chúng tôi",
    email: "hello@example.com",
    items: [
      {
        question: "Gói Miễn phí có thật sự miễn phí?",
        answer: "Có. Tối đa 5 người và 3 không gian, dùng bao lâu tuỳ bạn. Bạn chỉ trả tiền khi chuyển sang gói Nhóm hoặc Doanh nghiệp.",
      },
      {
        question: "Tôi có nhập được ghi chú cũ không?",
        answer: "File Markdown, bản xuất từ Notion và Google Docs nhập được trong vài cú nhấp. Liên kết giữa các trang được giữ nguyên.",
      },
      {
        question: "Ai xem được ghi chú của tôi?",
        answer: "Chỉ thành viên của không gian đó. Khách chỉ thấy những không gian bạn chia sẻ, và không ai sửa được nếu không có quyền.",
      },
      {
        question: "Tôi có đổi gói sau được không?",
        answer: "Lúc nào cũng được. Nâng gói có hiệu lực ngay; hạ gói bắt đầu từ chu kỳ thanh toán tiếp theo.",
      },
      {
        question: "Có giảm giá cho tổ chức phi lợi nhuận và trường học không?",
        answer: "Có, gói Nhóm giảm một nửa cho tổ chức phi lợi nhuận và trường học đã đăng ký. Hãy gửi cho chúng tôi đường dẫn tới tổ chức của bạn.",
      },
    ],
  },
  signUp: {
    title: "Bắt đầu viết cùng nhau ngay hôm nay",
    lead: "Tạo không gian cho nhóm trong một phút. Mời mọi người khi bạn sẵn sàng.",
    points: ["Miễn phí cho nhóm tới 5 người", "Nhập từ Markdown, Notion hoặc Google Docs", "Huỷ bất cứ lúc nào"],
    form: {
      label: "Đăng ký",
      name: "Họ và tên",
      email: "Email công việc",
      emailHint: "Chúng tôi gửi một email để xác nhận địa chỉ.",
      teamSize: "Quy mô nhóm",
      teamSizePlaceholder: "Chọn quy mô",
      teamSizes: ["Chỉ mình tôi", "2–10 người", "11–50 người", "51–200 người", "Hơn 200 người"],
      consent: "Tôi đồng ý với điều khoản dịch vụ và chính sách quyền riêng tư",
      submit: "Tạo không gian nhóm",
      submitting: "Đang tạo…",
    },
    errors: {
      name: "Nhập họ và tên của bạn.",
      emailRequired: "Nhập email công việc của bạn.",
      email: "Nhập email dạng ten@congty.com.",
      teamSize: "Chọn quy mô nhóm của bạn.",
      consent: "Đồng ý với điều khoản để tiếp tục.",
    },
    success: { title: "Kiểm tra hộp thư của bạn", body: (email) => `Chúng tôi đã gửi đường dẫn xác nhận tới ${email}.` },
  },
  footer: {
    tagline: "Ghi chú nhóm, cần là tìm thấy.",
    madeWith: "Làm bằng Yugen UI",
    sample: "Sản phẩm mẫu. Tên người và lời nhận xét đều là hư cấu.",
  },
};

export default vi;
