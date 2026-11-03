/** Chép chữ vào bộ nhớ tạm; ngữ cảnh không an toàn / bị chặn quyền → dùng textarea tạm. */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    // rơi xuống cách cũ bên dưới
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    // execCommand trả false khi trình duyệt từ chối: báo lỗi để useClipboard không hiện "Đã chép".
    if (!document.execCommand("copy")) throw new Error("copy command was rejected");
  } finally {
    ta.remove();
  }
}
