import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { REPO } from "./constants.js";
import { CliError } from "./errors.js";

type Fetch = typeof fetch;

/**
 * `create --ref <branch|tag>`: tải thư mục templates/ của repo ở ref đó vào một thư mục tạm (cùng cấu trúc với bản
 * đóng gói). Hai lời gọi GitHub API (commit, cây file) rồi tải từng file qua raw.githubusercontent.com theo SHA của
 * commit — tên nhánh có "/" không làm URL mơ hồ. GITHUB_TOKEN (nếu có) nâng giới hạn API.
 */
export async function downloadTemplates(ref: string, fetchImpl: Fetch = fetch): Promise<string> {
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const api = async <T>(url: string): Promise<T> => {
    let res: Response;
    try {
      res = await fetchImpl(url, { headers });
    } catch {
      throw new CliError("Cannot reach GitHub.", "Check your connection, or drop --ref to use the bundled templates.");
    }
    if (res.status === 404 || res.status === 422) throw new CliError(`Branch or tag "${ref}" not found in ${REPO}.`);
    if (res.status === 403 || res.status === 429)
      throw new CliError("GitHub API rate limit reached.", "Set GITHUB_TOKEN and retry, or drop --ref to use the bundled templates.");
    if (!res.ok) throw new CliError(`GitHub request failed: ${res.status} ${res.statusText} (${url}).`);
    return (await res.json()) as T;
  };

  const { sha } = await api<{ sha: string }>(`https://api.github.com/repos/${REPO}/commits/${encodeURIComponent(ref)}`);
  const { tree } = await api<{ tree: { path: string; type: string }[] }>(`https://api.github.com/repos/${REPO}/git/trees/${sha}?recursive=1`);
  const files = tree.filter((e) => e.type === "blob" && e.path.startsWith("templates/")).map((e) => e.path);
  if (!files.includes("templates/templates.json")) throw new CliError(`"${ref}" has no templates/templates.json.`, "Pick a ref made after the CLI was added (cli@0.1.0 or later).");

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "yugen-templates-"));
  // Tải song song theo lô nhỏ để không mở hàng trăm kết nối cùng lúc.
  for (let i = 0; i < files.length; i += 8)
    await Promise.all(
      files.slice(i, i + 8).map(async (file) => {
        const res = await fetchImpl(`https://raw.githubusercontent.com/${REPO}/${sha}/${file}`);
        if (!res.ok) throw new CliError(`Could not download ${file} (${res.status}).`);
        const out = path.join(dir, file.slice("templates/".length));
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
      }),
    );
  return dir;
}
