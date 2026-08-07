// Client-safe AI constants (no SDK import — usable in client components).

export type ChatMessage = { role: "user" | "assistant"; content: string };

export const SYSTEM_PROMPT = `Bạn là trợ lý AI của LIFE OS — một hệ điều hành quản lý cuộc sống.
Vai trò: coach về năng suất, sức khoẻ, tài chính, học tập và phát triển bản thân.
Phong cách: ấm áp, súc tích, thực tế. Ưu tiên hành động cụ thể hơn lý thuyết dài dòng.
Khi được hỏi lập kế hoạch, hãy đưa ra danh sách rõ ràng, có thứ tự ưu tiên và ước lượng thời gian.
Trả lời bằng tiếng Việt (trừ khi người dùng dùng ngôn ngữ khác). Dùng markdown ngắn gọn.`;

export const quickActions = [
  { key: "summary", label: "Tóm tắt ngày", emoji: "📊", prompt: "Hãy tóm tắt ngày hôm nay của tôi dựa trên các task và thói quen, và gợi ý điều nên cải thiện." },
  { key: "plan-day", label: "Lập kế hoạch hôm nay", emoji: "🗓️", prompt: "Giúp tôi lập kế hoạch cho hôm nay với các việc ưu tiên và khung giờ." },
  { key: "plan-week", label: "Kế hoạch tuần", emoji: "📅", prompt: "Giúp tôi lập kế hoạch cho tuần này, cân bằng công việc, học tập và sức khoẻ." },
  { key: "review", label: "Review tuần", emoji: "🔍", prompt: "Hãy giúp tôi review lại tuần vừa qua: điều gì tốt, điều gì cần cải thiện." },
  { key: "habit", label: "Gợi ý thói quen", emoji: "🔁", prompt: "Gợi ý cho tôi 3 thói quen mới phù hợp để phát triển bản thân." },
  { key: "budget", label: "Tư vấn ngân sách", emoji: "💰", prompt: "Cho tôi lời khuyên để tối ưu chi tiêu và tăng tỷ lệ tiết kiệm." },
];
