import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  Fullscreen,
  Search,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import mammoth from "mammoth";
import { Document, Page, pdfjs } from "react-pdf";
import type { ResourceFileItem } from "@/lib/resource-types";

interface ResourcePreviewProps {
  file: ResourceFileItem;
  onProgressChange?: (updates: {
    currentPage: number;
    progressPercentage: number;
    lastOpenedAt: string;
  }) => void;
}

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

function getPreviewType(file: ResourceFileItem) {
  const name = file.fileName.toLowerCase();
  if (name.endsWith(".pdf") || file.fileType === "application/pdf") return "pdf";
  if (name.endsWith(".docx") || file.fileType.includes("wordprocessingml")) return "docx";
  if (file.fileType.startsWith("image/")) return "image";
  if (name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".markdown")) return "text";
  return "unknown";
}

export function ResourcePreview({ file, onProgressChange }: ResourcePreviewProps) {
  const [docText, setDocText] = useState("");
  const [textContent, setTextContent] = useState("");
  const [zoom, setZoom] = useState(100);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ page: number; text: string }>>([]);
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const type = useMemo(() => getPreviewType(file), [file]);
  const storageKey = useMemo(() => `growthos-preview:${file.id}`, [file.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as { page?: number; zoom?: number; scroll?: number };
      if (typeof parsed.page === "number") setPageNumber(parsed.page);
      if (typeof parsed.zoom === "number") setZoom(parsed.zoom);
      if (typeof parsed.scroll === "number") setScrollTop(parsed.scroll);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ page: pageNumber, zoom, scroll: scrollTop }),
    );
  }, [pageNumber, scrollTop, storageKey, zoom]);

  useEffect(() => {
    if (!onProgressChange) return;
    onProgressChange({
      currentPage: pageNumber,
      progressPercentage: numPages ? Math.round((pageNumber / numPages) * 100) : 0,
      lastOpenedAt: new Date().toISOString(),
    });
  }, [numPages, onProgressChange, pageNumber]);

  useEffect(() => {
    let active = true;
    if (type === "docx") {
      if (!file.fileUrl) {
        setDocText("");
        return;
      }
      fetch(file.fileUrl)
        .then((response) => response.arrayBuffer())
        .then((buffer) => mammoth.extractRawText({ arrayBuffer: buffer }))
        .then((result) => {
          if (active) setDocText(result.value);
        })
        .catch(() => {
          if (active) setDocText("The document could not be rendered in-app.");
        });
    }

    if (type === "text") {
      if (!file.fileUrl) {
        setTextContent("");
        return;
      }
      fetch(file.fileUrl)
        .then((response) => response.text())
        .then((content) => {
          if (active) setTextContent(content);
        })
        .catch(() => {
          if (active) setTextContent("The text preview could not be loaded.");
        });
    }

    return () => {
      active = false;
    };
  }, [file.fileUrl, type]);

  const handleSearchPdf = async (term: string) => {
    if (!file.fileUrl || !term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const pdf = await pdfjs.getDocument(file.fileUrl).promise;
      const matches: Array<{ page: number; text: string }> = [];
      for (let index = 1; index <= pdf.numPages; index += 1) {
        const page = await pdf.getPage(index);
        const textContentChunk = await page.getTextContent();
        const combined = textContentChunk.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");
        if (combined.toLowerCase().includes(term.toLowerCase())) {
          matches.push({ page: index, text: combined.slice(0, 140) });
        }
      }
      setSearchResults(matches);
      if (matches[0]) {
        setPageNumber(matches[0].page);
      }
    } catch {
      setSearchResults([]);
    }
  };

  const handleCopy = async () => {
    const content = type === "docx" ? docText : type === "text" ? textContent : "";
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const renderFullscreenToggle = () => {
    if (typeof document === "undefined") return null;
    return (
      <button
        type="button"
        onClick={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => undefined);
            setFullscreen(true);
          } else {
            document.exitFullscreen().catch(() => undefined);
            setFullscreen(false);
          }
        }}
        className="rounded-full border border-border/70 p-1.5"
      >
        <Fullscreen className="h-4 w-4" />
      </button>
    );
  };

  if (type === "pdf" && file.fileUrl) {
    return (
      <div className="space-y-3 rounded-[18px] border border-border/70 bg-background/80 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Eye className="h-4 w-4 text-primary" /> PDF reader
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-border/70 px-2 py-1">
              <Search className="h-3.5 w-3.5 text-ink-soft" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSearchPdf(searchTerm);
                }}
                placeholder="Search text"
                className="w-28 bg-transparent text-xs outline-none"
              />
              <button
                type="button"
                onClick={() => handleSearchPdf(searchTerm)}
                className="text-[11px] font-medium text-primary"
              >
                Find
              </button>
            </div>
            <button
              type="button"
              onClick={() => setZoom((value) => Math.max(80, value - 10))}
              className="rounded-full border border-border/70 p-1.5"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-xs text-ink-soft">{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom((value) => Math.min(180, value + 10))}
              className="rounded-full border border-border/70 p-1.5"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            {renderFullscreenToggle()}
          </div>
        </div>

        {searchResults.length ? (
          <div className="rounded-[12px] border border-border/70 bg-muted/40 p-2 text-[11px] text-ink-soft">
            {searchResults[0]
              ? `Found ${searchResults.length} match${searchResults.length === 1 ? "" : "es"} across pages ${searchResults.map((result) => result.page).join(", ")}.`
              : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPageNumber((value) => Math.max(1, value - 1))}
              className="rounded-full border border-border/70 p-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-ink-soft">
              Page {pageNumber} {numPages ? `of ${numPages}` : ""}
            </span>
            <button
              type="button"
              onClick={() => setPageNumber((value) => Math.min(numPages ?? value + 1, value + 1))}
              className="rounded-full border border-border/70 p-1.5"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs text-ink-soft">
            Progress is saved automatically as you move through the document.
          </div>
        </div>

        <div
          ref={containerRef}
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
          className="max-h-[70vh] overflow-auto rounded-[14px] border border-border/70 bg-background p-3"
        >
          <Document
            file={file.fileUrl}
            onLoadSuccess={({ numPages: loadedPages }) => setNumPages(loadedPages)}
            loading={<div className="p-4 text-sm text-ink-soft">Loading PDF…</div>}
          >
            <Page pageNumber={pageNumber} scale={zoom / 100} renderTextLayer={false} />
          </Document>
        </div>
      </div>
    );
  }

  if (type === "docx" && file.fileUrl) {
    return (
      <div className="space-y-3 rounded-[18px] border border-border/70 bg-background/80 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Eye className="h-4 w-4 text-primary" /> DOCX reader
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-border/70 px-2 py-1">
              <Search className="h-3.5 w-3.5 text-ink-soft" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search document"
                className="w-32 bg-transparent text-xs outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-full border border-border/70 px-2.5 py-1 text-[11px] font-medium text-ink-soft"
            >
              {copied ? "Copied" : "Copy text"}
            </button>
            {renderFullscreenToggle()}
          </div>
        </div>

        <div
          ref={containerRef}
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
          className="max-h-[70vh] overflow-auto rounded-[14px] border border-border/70 bg-background p-4"
        >
          <pre className="whitespace-pre-wrap text-sm text-ink-soft">
            {searchTerm
              ? docText
                  .split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"))
                  .map((part, index) =>
                    part.toLowerCase() === searchTerm.toLowerCase() ? (
                      <mark
                        key={`${part}-${index}`}
                        className="rounded bg-amber-200/70 px-0.5 text-ink"
                      >
                        {part}
                      </mark>
                    ) : (
                      <span key={`${part}-${index}`}>{part}</span>
                    ),
                  )
              : docText || "Loading document…"}
          </pre>
        </div>
      </div>
    );
  }

  if (type === "image" && file.fileUrl) {
    return (
      <div className="space-y-3 rounded-[18px] border border-border/70 bg-background/80 p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Eye className="h-4 w-4 text-primary" /> Image preview
        </div>
        <img
          src={file.fileUrl}
          alt={file.fileName}
          className="max-h-[420px] w-full rounded-[14px] object-contain"
        />
      </div>
    );
  }

  if (type === "text" && file.fileUrl) {
    return (
      <div className="space-y-3 rounded-[18px] border border-border/70 bg-background/80 p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Eye className="h-4 w-4 text-primary" /> Text preview
        </div>
        <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-[14px] border border-border/70 bg-background p-4 text-sm text-ink-soft">
          {textContent || "Loading preview…"}
        </pre>
      </div>
    );
  }

  return (
    <div className="rounded-[18px] border border-border/70 bg-background/80 p-3 text-sm text-ink-soft">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <Eye className="h-4 w-4 text-primary" /> Preview unavailable
      </div>
      <p className="mt-2">
        Open the file directly or upload a supported document type to preview it here.
      </p>
    </div>
  );
}
