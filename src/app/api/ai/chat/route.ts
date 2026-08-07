import { NextRequest } from "next/server";
import {
  anthropic,
  hasAnthropicKey,
  AI_MODEL,
  SYSTEM_PROMPT,
  type ChatMessage,
} from "@/lib/ai/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { messages } = (await req.json()) as { messages: ChatMessage[] };

  // No API key → stream a friendly canned reply so the UI works in demo mode.
  if (!hasAnthropicKey) {
    return streamMock(messages.at(-1)?.content ?? "");
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const run = anthropic().messages.stream({
          model: AI_MODEL,
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        run.on("text", (delta) => controller.enqueue(encoder.encode(delta)));
        await run.finalMessage();
        controller.close();
      } catch (err) {
        controller.enqueue(
          encoder.encode(`\n\n⚠️ Lỗi khi gọi AI: ${(err as Error).message}`),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}

function streamMock(userMessage: string) {
  const reply = `Đây là **chế độ demo** (chưa cấu hình \`ANTHROPIC_API_KEY\`).

Với câu hỏi *"${userMessage.slice(0, 80)}"*, một trợ lý thật sẽ:

1. **Phân tích** dữ liệu của bạn — tasks, habits, tài chính, sức khoẻ.
2. **Đề xuất kế hoạch** cụ thể theo thứ tự ưu tiên và khung giờ.
3. **Nhắc nhở & động viên** để bạn giữ kỷ luật mỗi ngày.

Thêm \`ANTHROPIC_API_KEY\` vào file \`.env\` để bật AI thật (model \`${AI_MODEL}\`). 🚀`;

  const encoder = new TextEncoder();
  const tokens = reply.match(/\S+\s*/g) ?? [reply];
  const stream = new ReadableStream({
    async start(controller) {
      for (const t of tokens) {
        controller.enqueue(encoder.encode(t));
        await new Promise((r) => setTimeout(r, 18));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
