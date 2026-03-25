"use client";

import { useState, useCallback, useRef } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Select } from "@base-ui/react/select";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@components/Button";
import { Plus, Minus, Copy, Check, X, ChevronDown } from "lucide-react";
import type { ClassString } from "@/types";

interface QuestionRow {
  question: string;
  answer: string;
}

const CLASS_OPTIONS: { value: ClassString; label: string }[] = [
  { value: "en", label: "English" },
  { value: "de", label: "German" },
  { value: "geo", label: "Geography" },
];

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildTopicJSON(
  title: string,
  classStr: ClassString,
  rows: QuestionRow[]
): string {
  const topic = {
    id: "0",
    title,
    slug: slugify(title),
    class: classStr,
    questions: rows
      .filter((r) => r.question.trim() && r.answer.trim())
      .map((r, i) => ({
        id: i + 1,
        question: r.question.trim(),
        answer: r.answer.trim(),
      })),
  };
  return JSON.stringify(topic, null, 2);
}

async function highlightJSON(code: string): Promise<string> {
  const { createHighlighter } = await import("shiki");
  const highlighter = await createHighlighter({
    themes: ["vitesse-dark"],
    langs: ["json"],
  });
  const html = highlighter.codeToHtml(code, {
    lang: "json",
    theme: "vitesse-dark",
  });
  highlighter.dispose();
  return html;
}

export default function TopicCreatorModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [title, setTitle] = useState("");
  const [classStr, setClassStr] = useState<ClassString>("en");
  const [rows, setRows] = useState<QuestionRow[]>([
    { question: "", answer: "" },
    { question: "", answer: "" },
  ]);
  const [generatedHTML, setGeneratedHTML] = useState<string | null>(null);
  const [generatedJSON, setGeneratedJSON] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const copiedTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  const validRows = rows.filter(
    (r) => r.question.trim() && r.answer.trim()
  );
  const canGenerate = title.trim().length > 0 && validRows.length > 0;

  const addRow = () =>
    setRows((prev) => [...prev, { question: "", answer: "" }]);

  const removeRow = (index: number) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  const updateRow = (
    index: number,
    field: "question" | "answer",
    value: string
  ) =>
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;
    setGenerating(true);
    const json = buildTopicJSON(title, classStr, rows);
    setGeneratedJSON(json);
    const html = await highlightJSON(json);
    setGeneratedHTML(html);
    setGenerating(false);
  }, [canGenerate, title, classStr, rows]);

  const handleCopy = useCallback(async () => {
    if (!generatedJSON) return;
    await navigator.clipboard.writeText(generatedJSON);
    setCopied(true);
    if (copiedTimeout.current) clearTimeout(copiedTimeout.current);
    copiedTimeout.current = setTimeout(() => setCopied(false), 2000);
  }, [generatedJSON]);

  const handleBack = () => {
    setGeneratedHTML(null);
    setGeneratedJSON(null);
  };

  const reset = () => {
    setTitle("");
    setClassStr("en");
    setRows([
      { question: "", answer: "" },
      { question: "", answer: "" },
    ]);
    setGeneratedHTML(null);
    setGeneratedJSON(null);
    setCopied(false);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) reset();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Popup className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-bg-300 rounded-xl border border-bg-600 shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col pointer-events-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-5 pb-0">
              <Dialog.Title className="text-lg font-bold text-text m-0">
                {generatedHTML ? "Your JSON" : "Create Topic"}
              </Dialog.Title>
              <Dialog.Close className="text-text-muted hover:text-text cursor-pointer p-1">
                <X size={20} />
              </Dialog.Close>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {!generatedHTML ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="p-5 flex flex-col gap-4 overflow-y-auto"
                >
                  {/* Title & Category */}
                  <div className="flex gap-3">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label
                        htmlFor="topic-title"
                        className="text-sm font-medium text-text-muted"
                      >
                        Title
                      </label>
                      <input
                        id="topic-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Kitchen Vocabulary"
                        autoComplete="off"
                        className="w-full text-sm bg-bg-400 border-2 border-bg-600 rounded px-3 py-2 text-text font-medium focus-visible:outline-2 focus-visible:outline-accent-blue focus-visible:outline-offset-2"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-text-muted">
                        Category
                      </span>
                      <Select.Root
                        value={classStr}
                        onValueChange={(val) => setClassStr(val as ClassString)}
                      >
                        <Select.Trigger className="flex items-center gap-2 text-sm bg-bg-400 border-2 border-bg-600 rounded px-3 py-2 text-text font-medium cursor-pointer focus-visible:outline-2 focus-visible:outline-accent-blue focus-visible:outline-offset-2">
                          {CLASS_OPTIONS.find((o) => o.value === classStr)?.label ?? "Invalid Option"}
                          <Select.Icon>
                            <ChevronDown size={16} className="text-text-muted" />
                          </Select.Icon>
                        </Select.Trigger>
                        <Select.Positioner sideOffset={4} className="z-[100]">
                          <Select.Popup className="bg-bg-400 border border-bg-600 rounded-lg p-1 shadow-xl">
                            {CLASS_OPTIONS.map((opt) => (
                              <Select.Item
                                key={opt.value}
                                value={opt.value}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-text rounded cursor-pointer hover:bg-bg-500 data-[highlighted]:bg-bg-500"
                              >
                                <Select.ItemText>{opt.label}</Select.ItemText>
                              </Select.Item>
                            ))}
                          </Select.Popup>
                        </Select.Positioner>
                      </Select.Root>
                    </div>
                  </div>

                  {/* Question rows */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-text-muted">
                      Questions ({validRows.length})
                    </span>
                    <div className="flex flex-col gap-3">
                      {rows.map((row, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <div className="flex-1 flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              value={row.question}
                              onChange={(e) =>
                                updateRow(i, "question", e.target.value)
                              }
                              placeholder="Question"
                              autoComplete="off"
                              className="flex-1 text-sm bg-bg-400 border-2 border-bg-600 rounded px-3 py-2 text-text font-medium focus-visible:outline-2 focus-visible:outline-accent-blue focus-visible:outline-offset-2"
                            />
                            <input
                              type="text"
                              value={row.answer}
                              onChange={(e) =>
                                updateRow(i, "answer", e.target.value)
                              }
                              placeholder="Answer"
                              autoComplete="off"
                              className="flex-1 text-sm bg-bg-400 border-2 border-bg-600 rounded px-3 py-2 text-text font-medium focus-visible:outline-2 focus-visible:outline-accent-blue focus-visible:outline-offset-2"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeRow(i)}
                            disabled={rows.length <= 1}
                            className="mt-1.5 p-1.5 text-text-muted hover:text-accent-red disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addRow}
                      className="self-start flex items-center gap-1.5 text-sm text-text-muted hover:text-text cursor-pointer mt-1 transition-colors"
                    >
                      <Plus size={14} />
                      Add question
                    </button>
                  </div>

                  {/* Generate button */}
                  <Button
                    variant="solid"
                    accent="var(--color-accent-blue)"
                    onClick={handleGenerate}
                    disabled={!canGenerate || generating}
                    className="self-end mt-2"
                  >
                    {generating ? "Generating..." : "Generate JSON"}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="output"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="p-5 flex flex-col gap-4 overflow-hidden min-h-0"
                >
                  {/* JSON output */}
                  <div
                    className="rounded-lg overflow-hidden text-sm [&_pre]:!p-4 [&_pre]:!m-0 [&_pre]:!rounded-lg [&_pre]:!overflow-auto [&_pre]:!max-h-[60vh] min-h-0 flex-1"
                    dangerouslySetInnerHTML={{ __html: generatedHTML }}
                  />

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="text-sm text-text-muted hover:text-text cursor-pointer transition-colors"
                    >
                      Back to editor
                    </button>
                    <Button
                      variant={copied ? "solid" : "ghost"}
                      accent={
                        copied
                          ? "var(--color-accent-green)"
                          : "var(--color-accent-blue)"
                      }
                      size="sm"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <>
                          <Check size={14} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy JSON
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
