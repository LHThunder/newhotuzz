// Public profile content for the Home & About pages.
// Edit these values freely — this is the only place your public info lives.
// Nothing private (finance, health, tasks…) should ever go here.

export const profile = {
  name: "Tùng",
  role: "Full-stack Developer · Product Builder", // dòng vai trò cho nhà tuyển dụng
  tagline: "Người xây dựng · Học mỗi ngày · Sống có kỷ luật",
  statement:
    "Mình xây sản phẩm, học không ngừng và vận hành cuộc sống như một hệ điều hành.",
  photo: "/avatar.svg", // đặt ảnh của bạn vào /public và đổi đường dẫn này
  location: "Lyon, Pháp",
  email: "tungtt903@gmail.com",
  openToWork: true, // hiện huy hiệu "Sẵn sàng cho cơ hội mới" trên trang chủ

  // Kỹ năng — chỉnh sửa tự do. Đây là stack thực tế bạn đang dùng để xây LIFE OS.
  skills: [
    { group: "Ngôn ngữ", items: ["TypeScript", "JavaScript", "SQL", "HTML/CSS"] },
    { group: "Framework", items: ["Next.js", "React", "Node.js", "Tailwind CSS"] },
    { group: "Dữ liệu & Hạ tầng", items: ["Prisma", "PostgreSQL", "Supabase", "Vercel"] },
    { group: "Khác", items: ["AI / LLM", "System Design", "Zod", "Git"] },
  ],

  about:
    "Xin chào! Mình là một người đam mê công nghệ, sản phẩm và phát triển bản thân. Trang này là 'mặt tiền' công khai của mình; bên trong là Personal OS — nơi mình quản lý mục tiêu, dự án, thói quen, tài chính và tri thức.",

  currently: [
    { label: "Đang học", value: "AI Engineering & System Design" },
    { label: "Đang xây", value: "LIFE OS — hệ điều hành cuộc sống" },
    { label: "Đang đọc", value: "Deep Work — Cal Newport" },
    { label: "Quan tâm", value: "Productivity · Startup · Health" },
  ],

  projects: [
    { name: "LIFE OS", description: "Personal operating system quản lý toàn bộ cuộc sống.", tag: "Product" },
    { name: "AI Coach", description: "Trợ lý AI lập kế hoạch & review cá nhân.", tag: "AI" },
    { name: "Blog", description: "Ghi lại hành trình học & xây dựng.", tag: "Writing" },
  ],

  socials: [
    { label: "Email", href: "mailto:tungtt903@gmail.com" },
    { label: "GitHub", href: "https://github.com/LHThunder" },
    // Thêm link khác nếu muốn: { label: "X", href: "https://x.com/..." },
  ],

  // About Me — chi tiết
  bio: {
    occupation: "Builder / Developer",
    hometown: "Việt Nam",
    education: "—",
    values: ["Kỷ luật", "Học hỏi liên tục", "Tối giản", "Sức khoẻ"],
    interests: ["AI", "Sản phẩm", "Đọc sách", "Thể thao", "Board games"],
    quote: "Kỷ luật là cây cầu giữa mục tiêu và thành tựu.",
  },

  timeline: [
    { year: "2020", title: "Bắt đầu học lập trình", desc: "Những dòng code đầu tiên." },
    { year: "2023", title: "Sự nghiệp", desc: "Làm về sản phẩm & công nghệ." },
    { year: "2026", title: "Hiện tại — Lyon", desc: "Xây LIFE OS, học AI, sống có hệ thống." },
  ],
};

export type Profile = typeof profile;
