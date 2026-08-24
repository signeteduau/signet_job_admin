import { useRef, useState } from "react";
import { ImageIcon, Upload, Link2, X, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { uploadArticleImage, getStorageErrorMessage } from "../lib/storage";

export default function FeaturedImageField({ value, onChange, disabled = false }) {
  const inputRef = useRef(null);
  const [mode, setMode] = useState("upload");
  const [uploading, setUploading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const handleFile = async (file) => {
    if (!file || disabled) return;

    try {
      setUploading(true);
      setPreviewError(false);
      const url = await uploadArticleImage(file, "featured");
      onChange(url);
      setMode("upload");
      toast.success("Image uploaded");
    } catch (err) {
      console.error("Featured image upload failed:", err);
      toast.error(getStorageErrorMessage(err) || err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const clearImage = () => {
    onChange("");
    setPreviewError(false);
  };

  const hasImage = Boolean(value?.trim());

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium flex items-center gap-2">
        <ImageIcon size={14} /> Feature Image
      </label>

      <div className="inline-flex gap-1 rounded-lg bg-[rgb(var(--card))] p-1 border border-[rgb(var(--card-border))]">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setMode("upload")}
          className={`px-2.5 py-1 rounded-md text-xs transition ${
            mode === "upload"
              ? "bg-[rgb(var(--purple))/12%] text-[rgb(var(--purple))]"
              : "hover:bg-[rgb(var(--foreground))/6%]"
          }`}
        >
          Upload
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setMode("url")}
          className={`px-2.5 py-1 rounded-md text-xs transition ${
            mode === "url"
              ? "bg-[rgb(var(--purple))/12%] text-[rgb(var(--purple))]"
              : "hover:bg-[rgb(var(--foreground))/6%]"
          }`}
        >
          URL
        </button>
      </div>

      {mode === "upload" ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className={`relative rounded-xl border-2 border-dashed border-[rgb(var(--card-border))] bg-[rgb(var(--background))]/60 p-4 transition ${
            disabled ? "opacity-60" : "hover:border-[rgb(var(--purple))/40%]"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={disabled || uploading}
            onChange={onInputChange}
          />

          {hasImage && !previewError ? (
            <div className="relative">
              <img
                src={value}
                alt="Featured preview"
                className="w-full h-40 object-cover rounded-lg border border-[rgb(var(--card-border))]"
                onError={() => setPreviewError(true)}
                onLoad={() => setPreviewError(false)}
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  type="button"
                  disabled={disabled || uploading}
                  onClick={() => inputRef.current?.click()}
                  className="p-1.5 rounded-md bg-black/55 text-white hover:bg-black/70"
                  title="Replace image"
                >
                  <Upload size={14} />
                </button>
                <button
                  type="button"
                  disabled={disabled || uploading}
                  onClick={clearImage}
                  className="p-1.5 rounded-md bg-black/55 text-white hover:bg-black/70"
                  title="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 py-8 text-sm text-[rgb(var(--foreground)/70%)]"
            >
              {uploading ? (
                <>
                  <Loader2 size={22} className="animate-spin text-[rgb(var(--purple))]" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload size={22} className="text-[rgb(var(--purple))]" />
                  <span>Click or drag an image here</span>
                  <span className="text-xs opacity-70">JPG, PNG, WebP, or GIF · max 5 MB</span>
                </>
              )}
            </button>
          )}

          {previewError && hasImage && (
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>Preview failed. The saved URL may be invalid or blocked.</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
            <input
              type="url"
              disabled={disabled}
              className="w-full pl-9 pr-9 py-2 rounded-lg border border-[rgb(var(--card-border))] bg-[rgb(var(--background))] focus:ring-2 focus:ring-[rgb(var(--purple))] outline-none text-[rgb(var(--foreground))] text-sm"
              placeholder="https://example.com/image.jpg"
              value={value}
              onChange={(e) => {
                setPreviewError(false);
                onChange(e.target.value);
              }}
            />
            {hasImage && (
              <button
                type="button"
                disabled={disabled}
                onClick={clearImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-[rgb(var(--foreground))/8%]"
                title="Clear URL"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {hasImage && (
            <div className="rounded-lg overflow-hidden border border-[rgb(var(--card-border))] bg-[rgb(var(--background))]">
              {!previewError ? (
                <img
                  src={value}
                  alt="Featured preview"
                  className="w-full h-40 object-cover"
                  onError={() => setPreviewError(true)}
                  onLoad={() => setPreviewError(false)}
                />
              ) : (
                <div className="flex items-center gap-2 px-3 py-6 text-xs text-amber-700 dark:text-amber-300">
                  <AlertCircle size={14} />
                  Could not load image from this URL.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
