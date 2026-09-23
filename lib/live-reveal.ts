/** Hiện từng chữ số + khung spinner (text Fanpage / board) */

const SPIN_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"] as const;

export function spinFrame(nowMs = Date.now()): string {
  return SPIN_FRAMES[Math.floor(nowMs / 120) % SPIN_FRAMES.length];
}

/**
 * Hiện dần từng chữ số của một giải đã có từ API.
 * msPerDigit: thời gian mỗi chữ số (vd 778 → ~1s hiện đủ).
 * epochMs: mốc bắt đầu hiện (thường là lúc lần đầu thấy số đủ).
 */
export function revealDigits(
  full: string,
  epochMs: number,
  nowMs = Date.now(),
  msPerDigit = 400
): string {
  const target = String(full || "").trim();
  if (!target) {
    return spinFrame(nowMs);
  }
  const elapsed = Math.max(0, nowMs - epochMs);
  const shown = Math.min(target.length, Math.floor(elapsed / msPerDigit) + 1);
  const head = target.slice(0, shown);
  const rest = target.length - shown;
  if (rest <= 0) return target;
  const spin = spinFrame(nowMs);
  return head + spin.repeat(rest);
}

export function revealMulti(
  values: string[],
  epochs: number[],
  nowMs = Date.now(),
  msPerDigit = 400
): string {
  if (!values.length) return spinFrame(nowMs);
  return values
    .map((v, i) => revealDigits(v, epochs[i] ?? nowMs, nowMs, msPerDigit))
    .join("·");
}
