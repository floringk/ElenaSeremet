import { getPreviewBannerMessage } from "@/lib/site-status";

export function PreviewBanner() {
  const detail = getPreviewBannerMessage();
  if (!detail) {
    return null;
  }

  return (
    <div className="preview-banner" role="status">
      <div className="container preview-banner-inner">
        <p>
          <strong>Previzualizare site</strong> — {detail}
        </p>
      </div>
    </div>
  );
}
