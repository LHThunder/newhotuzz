import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// AES-256-GCM. Khoá lấy từ ENCRYPTION_KEY (base64, 32 bytes).
// Định dạng lưu: <iv_base64>:<authTag_base64>:<ciphertext_base64>

function key(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) throw new Error("Thiếu ENCRYPTION_KEY — không thể mã hoá/giải mã vault.");
  const k = Buffer.from(raw, "base64");
  if (k.length !== 32) throw new Error("ENCRYPTION_KEY phải là 32 bytes (base64).");
  return k;
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

export function decryptSecret(stored: string): string {
  const [ivB64, tagB64, dataB64] = stored.split(":");
  if (!ivB64 || !tagB64 || !dataB64) throw new Error("Dữ liệu mã hoá không hợp lệ.");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
}
