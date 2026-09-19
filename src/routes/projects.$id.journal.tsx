import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { createJournal, getProjectDetail } from "@/lib/hhb/actions";
import { JOURNAL_CATEGORY_LABEL, type JournalCategory } from "@/lib/hhb/types";
import { compressImage } from "@/lib/utils";

export const Route = createFileRoute("/projects/$id/journal")({ component: Page });

const CATS = Object.keys(JOURNAL_CATEGORY_LABEL) as JournalCategory[];

function Page() {
  return (
    <RequireAuth>
      <Form />
    </RequireAuth>
  );
}

function Form() {
  const { id } = Route.useParams();
  const pid = Number(id);
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [category, setCategory] = useState<JournalCategory>("XAY_DUNG");
  const [content, setContent] = useState("");
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProjectDetail({ data: { id: pid } })
      .then((d) => {
        setName(d.project.name);
        setStatus(d.project.status);
      })
      .catch(() => {});
  }, [pid]);

  const disabled = status !== "ACTIVE";

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    const next: string[] = [...previews];
    for (const f of Array.from(files).slice(0, 8 - next.length)) {
      try {
        next.push(await compressImage(f));
      } catch {
        setError("Không thể tải ảnh lên. Vui lòng thử lại.");
      }
    }
    setPreviews(next);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Vui lòng nhập nội dung nhật ký");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await createJournal({
        data: { projectId: pid, category, content: content.trim(), images: previews },
      });
      nav({ to: "/projects/$id", params: { id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được nhật ký");
    } finally {
      setLoading(false);
    }
  };

  if (disabled) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted">Công trình đã hoàn thiện, không thể ghi nhật ký mới.</p>
        <Link to="/projects/$id" params={{ id }} className="mt-4 inline-block text-accent">
          ← Quay lại
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Link to="/projects/$id" params={{ id }} className="text-sm text-muted hover:text-accent">
        ← Quay lại
      </Link>
      <h1 className="mt-3 font-display text-2xl">Ghi nhật ký</h1>
      <p className="text-sm text-muted">{name}</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <p className="mb-2 text-sm text-muted">Nhóm công việc</p>
          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-full px-3 py-1.5 text-sm ${category === c ? "bg-accent font-medium text-accent-fg" : "border border-border text-muted"}`}
              >
                {JOURNAL_CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">Nội dung</span>
          <textarea
            required
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Hôm nay đã hoàn thành tô tường tầng 1..."
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">Hình ảnh</span>
          <input type="file" accept="image/*" multiple onChange={(e) => onFiles(e.target.files)} className="text-sm text-muted" />
          {previews.length > 0 ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {previews.map((src, i) => (
                <img key={i} src={src} alt="" className="aspect-square rounded-md object-cover" />
              ))}
            </div>
          ) : null}
        </label>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <button type="submit" disabled={loading} className="h-14 w-full rounded-xl bg-accent text-lg font-bold text-accent-fg disabled:opacity-50">
          {loading ? "Đang lưu..." : "Lưu nhật ký"}
        </button>
      </form>
    </div>
  );
}
