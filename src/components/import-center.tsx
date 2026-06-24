"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useApplicationStore, useExerciseStore, useFocusStore, useLearningStore, useReadingStore, useTaskStore, ApplicationStatus } from "@/stores/useGrowthStores";

const MODULES = ["Learning", "Tasks", "Applications", "Reading", "Exercise"] as const;

type ModuleName = (typeof MODULES)[number];

type RawRow = Record<string, unknown>;

type PapaParseResult<T> = { data: T[]; errors: unknown[]; meta: unknown };

function normalizeKey(key: string) {
  return key.trim().toLowerCase();
}

function parseNumber(value: unknown): number | undefined {
  if (value == null) return undefined;
  const text = String(value).trim();
  if (!text) return undefined;
  const match = text.match(/-?\d+(?:\.\d+)?/);
  if (!match) return undefined;
  return Number(match[0]);
}

function parseDuration(value: unknown): number {
  if (value == null) return 0;
  const text = String(value).trim();
  if (!text) return 0;
  const normalized = text.toLowerCase();
  const hourMatch = normalized.match(/(\d+(?:\.\d+)?)\s*h(?:ours?)?/);
  const minuteMatch = normalized.match(/(\d+(?:\.\d+)?)\s*m(?:in(?:utes?)?)?/);
  if (hourMatch || minuteMatch) {
    const h = hourMatch ? Number(hourMatch[1]) : 0;
    const m = minuteMatch ? Number(minuteMatch[1]) : 0;
    return h + m / 60;
  }
  const parts = normalized.split(":").map((part) => Number(part.trim()));
  if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
    return parts[0] + parts[1] / 60;
  }
  const asNumber = parseNumber(value);
  if (asNumber !== undefined) {
    return asNumber;
  }
  return 0;
}

function normalizeDate(value: unknown) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString().slice(0, 10) : parsed.toISOString().slice(0, 10);
}

function getValue(row: RawRow, key: string) {
  const normalizedKey = normalizeKey(key);
  const foundKey = Object.keys(row).find((k) => normalizeKey(k) === normalizedKey);
  return foundKey ? row[foundKey] : undefined;
}

export function ImportCenterDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const addTask = useTaskStore((state) => state.addTask);
  const addLearning = useLearningStore((state) => state.addLearning);
  const addApplication = useApplicationStore((state) => state.addApplication);
  const addReading = useReadingStore((state) => state.addReading);
  const addExercise = useExerciseStore((state) => state.addExercise);

  const [module, setModule] = useState<ModuleName>("Learning");
  const [previewRows, setPreviewRows] = useState<RawRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>("");

  const expectedColumns: Record<ModuleName, string[]> = {
    Learning: ["Topic", "Category", "Source", "Learning Time", "Notes", "Confidence", "Date"],
    Tasks: ["Title", "Priority", "Status", "Due Date", "Category", "Notes"],
    Applications: ["Company", "Position", "Country", "Applied Date", "Status", "Notes"],
    Reading: ["Book", "Pages", "Time", "Progress", "Date"],
    Exercise: ["Exercise", "Duration", "Calories", "Date"],
  };

  const handleFile = async (file: File) => {
    try {
      setCurrentFile(file.name);
      const extension = file.name.split(".").pop()?.toLowerCase();
      let records: RawRow[] = [];

      if (extension === "xlsx") {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        records = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as RawRow[];
      } else if (extension === "csv") {
        const result = await new Promise<PapaParseResult<RawRow>>((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (r: PapaParseResult<RawRow>) => resolve(r),
            error: (err: unknown) => reject(err),
          });
        });
        records = result.data ?? [];
      } else if (extension === "json") {
        const text = await file.text();
        const items = JSON.parse(text);
        records = Array.isArray(items) ? (items as RawRow[]) : [];
      } else {
        throw new Error("Unsupported file type");
      }

      setPreviewRows(records);
      setErrors([]);
      setRowCount(records.length);
      setImportedCount(0);
      setSkippedCount(0);
    } catch (error) {
      setErrors([String(error)]);
      setPreviewRows([]);
      setRowCount(0);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleImport = () => {
    let imported = 0;
    let skipped = 0;
    const newErrors: string[] = [];

    previewRows.forEach((row, index) => {
      try {
        switch (module) {
          case "Learning": {
            const topic = String(getValue(row, "Topic") ?? "").trim();
            if (!topic) throw new Error(`Missing topic on row ${index + 1}`);
            addLearning({
              topic,
              category: String(getValue(row, "Category") ?? "").trim() || "General",
              source: String(getValue(row, "Source") ?? "").trim() || "Manual",
              timeHours: parseDuration(getValue(row, "Learning Time") ?? getValue(row, "Time")),
              notes: String(getValue(row, "Notes") ?? "").trim(),
              confidence: Math.min(100, Math.max(0, parseNumber(getValue(row, "Confidence")) ?? 0)),
              date: normalizeDate(getValue(row, "Date")),
            });
            imported += 1;
            break;
          }
          case "Tasks": {
            const title = String(getValue(row, "Title") ?? "").trim();
            if (!title) throw new Error(`Missing title on row ${index + 1}`);
            addTask({
              title,
              priority: (String(getValue(row, "Priority") ?? "Medium") as any) || "Medium",
              status: (String(getValue(row, "Status") ?? "Todo") as any) || "Todo",
              dueDate: normalizeDate(getValue(row, "Due Date")),
              category: String(getValue(row, "Category") ?? "").trim() || "General",
              notes: String(getValue(row, "Notes") ?? "").trim(),
            });
            imported += 1;
            break;
          }
          case "Applications": {
            const company = String(getValue(row, "Company") ?? "").trim();
            if (!company) throw new Error(`Missing company on row ${index + 1}`);
            addApplication({
              company,
              position: String(getValue(row, "Position") ?? "").trim() || "",
              country: String(getValue(row, "Country") ?? "").trim() || "",
              salary: String(getValue(row, "Salary") ?? "").trim() || "",
              appliedDate: normalizeDate(getValue(row, "Applied Date")),
              status: (String(getValue(row, "Status") ?? "Applied").trim() || "Applied") as ApplicationStatus,
              interviewStage: String(getValue(row, "Interview Stage") ?? "").trim() || "",
              portfolioSent: String(getValue(row, "Portfolio Sent") ?? "No").trim().toLowerCase() === "yes",
              notes: String(getValue(row, "Notes") ?? "").trim(),
            });
            imported += 1;
            break;
          }
          case "Reading": {
            const book = String(getValue(row, "Book") ?? "").trim();
            if (!book) throw new Error(`Missing book on row ${index + 1}`);
            addReading({
              book,
              pages: Number(getValue(row, "Pages") ?? 0) || 0,
              timeMinutes: Math.round((parseDuration(getValue(row, "Time")) || 0) * 60),
              progress: Math.min(100, Math.max(0, parseNumber(getValue(row, "Progress")) ?? 0)),
              date: normalizeDate(getValue(row, "Date")),
            });
            imported += 1;
            break;
          }
          case "Exercise": {
            const exercise = String(getValue(row, "Exercise") ?? "").trim();
            if (!exercise) throw new Error(`Missing exercise on row ${index + 1}`);
            addExercise({
              exercise,
              durationMinutes: Math.round((parseDuration(getValue(row, "Duration")) || 0) * 60),
              calories: Number(getValue(row, "Calories") ?? 0) || 0,
              date: normalizeDate(getValue(row, "Date")),
            });
            imported += 1;
            break;
          }
          default:
            skipped += 1;
        }
      } catch (error) {
        skipped += 1;
        newErrors.push(String(error));
      }
    });

    setImportedCount(imported);
    setSkippedCount(skipped);
    setErrors(newErrors);
    toast.success(`Imported ${imported} rows, skipped ${skipped}`);
  };

  const hasPreview = previewRows.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Import Center</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid sm:grid-cols-[220px_1fr] gap-3 items-end">
            <label className="block text-sm font-medium text-foreground">Import target</label>
            <select
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={module}
              onChange={(event) => setModule(event.target.value as ModuleName)}
            >
              {MODULES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div
            className="rounded-3xl border border-dashed border-border/80 bg-muted/70 p-6 text-center transition hover:border-primary hover:bg-muted"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop as any}
          >
            <p className="text-sm text-foreground">Drag and drop a CSV, XLSX, or JSON file here</p>
            <p className="mt-2 text-sm text-foreground/80">or select a file to preview and import your {module.toLowerCase()} records.</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <label className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Choose file
                <Input
                  type="file"
                  accept=".csv,.xlsx,.json"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleFile(file);
                  }}
                />
              </label>
              <Button variant="secondary" onClick={() => {
                const headers = expectedColumns[module].join(",");
                const blob = new Blob([headers], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `${module.toLowerCase()}-template.csv`;
                link.click();
                URL.revokeObjectURL(url);
              }}>
                Download template
              </Button>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-2xl bg-card p-4">Rows found<div className="mt-2 text-2xl font-semibold">{rowCount}</div></div>
            <div className="rounded-2xl bg-card p-4">Imported<div className="mt-2 text-2xl font-semibold">{importedCount}</div></div>
            <div className="rounded-2xl bg-card p-4">Skipped<div className="mt-2 text-2xl font-semibold">{skippedCount}</div></div>
          </div>

          {errors.length > 0 && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              <strong>Validation errors</strong>
              <ul className="mt-2 list-disc pl-5">
                {errors.slice(0, 5).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {hasPreview ? (
            <div className="overflow-x-auto rounded-3xl border border-border bg-card p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-foreground">Preview</div>
                  <div className="text-xs text-foreground/70">Showing the first {Math.min(6, previewRows.length)} rows</div>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs text-foreground/80">{currentFile}</span>
              </div>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.22em] text-foreground/70">
                    {expectedColumns[module].map((key) => (
                      <th key={key} className="py-2 pr-4">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.slice(0, 6).map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-t border-border/60">
                      {expectedColumns[module].map((key) => (
                        <td key={key} className="py-3 pr-4 align-top text-sm text-foreground/80">{String(getValue(row, key) ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-3xl border border-border/60 bg-card p-6 text-center text-sm text-foreground/80">
              No file selected. Add a sheet with the required columns above to see a preview.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} type="button">
            Close
          </Button>
          <Button disabled={!hasPreview} onClick={handleImport} type="button">
            Import {module}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
