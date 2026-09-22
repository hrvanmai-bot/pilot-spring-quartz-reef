import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Camera } from "lucide-react";
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
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [category, setCategory] = useState<JournalCategory>("XAY_DUNG");
  const [content, setContent] = useState("");
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProjectDetail({ data: { id: pid } })
      .then((d) => {
        setName(d.project.name);
        setStatus(d.project.status);
        setAllowed(d.profile.account_type === "STAFF");
      })
      .catch(() => setAllowed(false));
  }, [pid]);

  const disabled = status !== "ACTIVE";

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    setError(null);
    setCompressing(true);
    const next: string[] = [...previews];
    try {
      for (const f of Array.from(files).slice(0, 8 - next.length)) {
        next.push(await compressImage(f, 1200, 0.7));
      }
      setPreviews(next);
    } catch {
      setError("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setCompressing(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Nhập nội dung công việc trong ngày");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await createJournal({
        data: { projectId: pid, category, content: content.trim(), images: previews },
      });
      nav({ to: "/projects/$id", params: { id }, search: { tab: "progress" } as never });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được nhật ký");
    } finally {
      setLoading(false);
    }
  };

  if (allowed === false) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted">Khách hàng không ghi nhật ký công trình.</p>
        <Link to="/projects/$id" params={{ id }} className="mt-4 inline-block text-accent">
          ← Quay lại
        </Link>
      </div>
    );
  }

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
    <div className="mx-auto max-w-lg px-4 py-6 pb-24">
      <Link to="/projects/$id" params={{ id }} className="text-sm text-muted hover:text-accent">
        ← Quay lại công trình
      </Link>
      <h1 className="mt-3 font-display text-3xl uppercase tracking-wide">Nhật ký công trình</h1>
      <p className="mt-1 text-sm text-muted">{name}</p>
      <p className="mt-1 text-xs text-subtle">Dành cho nhân viên. Ảnh tự nén, hiện trên tab Tiến độ thi công.</p>

      <form onSubmit={submit} className="mt-6 space-y-5">
        <div>
          <p className="mb-2 text-sm font-medium">Nhóm việc</p>
          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`h-10 rounded-full px-3 text-sm ${category === c ? "bg-accent font-medium text-accent-fg" : "border border-border text-muted"}`}
              >
                {JOURNAL_CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Hôm nay làm gì? *</span>
          <textarea
            required
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="VD: Tô xong tường tầng 1, mặt tiền. Mai chuyển điện âm phòng ngủ."
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 outline-none focus:border-accent"
          />
        </label>

        <div>
          <span className="mb-1.5 block text-sm font-medium">Ảnh hiện trường</span>
          <p className="mb-2 text-xs text-subtle">Tối đa 8 ảnh · tự giảm dung lượng, vẫn rõ trên tiến độ.</p>
          <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-surface text-sm text-muted hover:border-accent hover:text-accent">
            <Camera className="size-6" />
            {compressing ? "Đang nén ảnh..." : "Chụp / chọn ảnh"}
            <input
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              className="hidden"
              disabled={compressing || previews.length >= 8}
              onChange={(e) => {
                void onFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
          {previews.length > 0 ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square">
                  <img src={src} alt="" className="size-full rounded-md object-cover" />
                  <button
                    type="button"
                    onClick={() => setPreviews((p) => p.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 rounded bg-bg/80 px-1.5 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <button
          type="submit"
          disabled={loading || compressing || allowed !== true}
          className="h-14 w-full rounded-xl bg-accent text-lg font-bold text-accent-fg disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : "Lưu nhật ký"}
        </button>
      </form>
    </div>
  );
}
