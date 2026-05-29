import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TextArea from "../form/input/TextArea";
import Button from "../ui/button/Button";
import AppIcon from "../icons/AppIcon";
import ConfirmModal from "../common/ConfirmModal";
import {
  ADMIN_AI_TOOL_LABELS,
  resolveAdminAiError,
  useAdminAiChatMutation,
  useAdminAiConfirmMutation,
  type AdminAIChatMessage,
  type AdminAIActionResult,
  type AdminAIPendingAction,
} from "../../features/adminAi/adminAiApi";
import { useToast } from "../../context/ToastContext";
import { useAdminVoiceInput } from "../../hooks/useAdminVoiceInput";

interface ChatEntry {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: AdminAIActionResult[];
}

const SUGGESTIONS = [
  "905551234567 telefonlu kullanıcıyı ara",
  "Son şikayetleri bul",
  "X dükkanını askıya al",
];

const panelSpring = { type: "spring" as const, damping: 28, stiffness: 340, mass: 0.85 };
const fabSpring = { type: "spring" as const, damping: 22, stiffness: 400 };

export default function AdminAiChatPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [pendingActions, setPendingActions] = useState<AdminAIPendingAction[]>([]);
  const [chat, { isLoading: isChatLoading }] = useAdminAiChatMutation();
  const [confirm, { isLoading: isConfirmLoading }] = useAdminAiConfirmMutation();
  const { isRecording, isTranscribing, toggleRecording } = useAdminVoiceInput();
  const toast = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isBusy = isChatLoading || isConfirmLoading || isTranscribing;

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, entries, isBusy, pendingActions.length]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const appendAssistant = useCallback(
    (content: string, actions?: AdminAIActionResult[]) => {
      setEntries((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content, actions },
      ]);
    },
    [],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isBusy) return;

      const userEntry: ChatEntry = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };
      setEntries((prev) => [...prev, userEntry]);
      setInput("");

      const history: AdminAIChatMessage[] = entries.map((e) => ({
        role: e.role,
        content: e.content,
      }));

      try {
        const res = await chat({ message: trimmed, history }).unwrap();
        if (!res.success || !res.data) {
          toast.error(resolveAdminAiError(res.message));
          return;
        }
        const { reply, actionsExecuted, requiresConfirmation, pendingActions: pending } =
          res.data;

        appendAssistant(reply, actionsExecuted);

        if (requiresConfirmation && pending?.length) {
          setPendingActions(pending);
        }
      } catch (err: unknown) {
        const msg =
          (err as { data?: { message?: string } })?.data?.message ??
          "İstek başarısız oldu.";
        toast.error(resolveAdminAiError(msg));
      }
    },
    [chat, entries, isBusy, toast, appendAssistant],
  );

  const handleConfirmPending = useCallback(async () => {
    if (pendingActions.length === 0) return;
    try {
      const res = await confirm({ actions: pendingActions }).unwrap();
      if (!res.success || !res.data) {
        toast.error(resolveAdminAiError(res.message));
        return;
      }
      appendAssistant(res.data.reply, res.data.actionsExecuted);
      setPendingActions([]);
      toast.success("İşlemler uygulandı.");
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        "Onay işlemi başarısız.";
      toast.error(resolveAdminAiError(msg));
    }
  }, [confirm, pendingActions, appendAssistant, toast]);

  const handleVoice = useCallback(() => {
    void toggleRecording(
      (text) => void sendMessage(text),
      (err) => toast.error(err),
    );
  }, [toggleRecording, sendMessage, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <>
      <ConfirmModal
        isOpen={pendingActions.length > 0}
        onClose={() => setPendingActions([])}
        onConfirm={handleConfirmPending}
        tone="danger"
        title="Bu işlemleri onaylıyor musunuz?"
        confirmText="Onayla ve uygula"
        cancelText="Vazgeç"
        isLoading={isConfirmLoading}
        message={
          <div className="space-y-3">
            <p>
              Yapay zeka asistanı aşağıdaki yönetim işlemlerini uygulamak istiyor.
              Devam etmeden önce kontrol edin.
            </p>
            <ul className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-800/50">
              {pendingActions.map((a) => (
                <li key={a.id} className="flex flex-col gap-0.5">
                  <span className="font-medium text-gray-800 dark:text-white/90">
                    {ADMIN_AI_TOOL_LABELS[a.tool] ?? a.tool}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">{a.summary}</span>
                </li>
              ))}
            </ul>
          </div>
        }
      />

      <AnimatePresence>
        {!open && (
          <motion.button
            key="admin-ai-fab"
            type="button"
            initial={{ scale: 0, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.6, opacity: 0, y: 8 }}
            transition={fabSpring}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setOpen(true)}
            className={`fixed bottom-20 right-6 z-[100000] flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
              isRecording ? "animate-pulse ring-2 ring-red-400 ring-offset-2" : ""
            }`}
            aria-label="Yapay zeka asistanını aç"
          >
            <AppIcon name="robot" className="size-7" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              key="admin-ai-backdrop"
              type="button"
              aria-label="Asistanı kapat"
              className="fixed inset-0 z-[99999] cursor-default bg-gray-900/20 backdrop-blur-[2px] dark:bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="admin-ai-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Admin yapay zeka asistanı"
              className="fixed bottom-20 right-6 z-[100000] flex w-[min(100vw-1.5rem,24rem)] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 sm:w-96"
              initial={{ opacity: 0, y: 28, scale: 0.88 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.92 }}
              transition={panelSpring}
            >
          <header className="flex items-center justify-between border-b border-gray-200 bg-brand-500 px-4 py-3 text-white dark:border-gray-700">
            <div className="flex items-center gap-2">
              <AppIcon name="robot" className="size-6" />
              <div>
                <p className="text-sm font-semibold">Admin Asistan</p>
                <p className="text-[10px] opacity-90">Claude · yazı veya mikrofon</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 hover:bg-white/20"
              aria-label="Kapat"
            >
              <AppIcon name="close" className="size-5" />
            </button>
          </header>

          <div
            ref={scrollRef}
            className="flex max-h-80 min-h-48 flex-1 flex-col gap-3 overflow-y-auto p-3"
          >
            {entries.length === 0 && (
              <div className="space-y-2 text-center text-xs text-gray-500 dark:text-gray-400">
                <p>
                  Yazın veya mikrofona basılı tutup komut verin. Ban ve askı için onay
                  istenir.
                </p>
                <div className="flex flex-wrap justify-center gap-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="rounded-full border border-gray-200 px-2 py-1 text-[10px] hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                      onClick={() => void sendMessage(s)}
                      disabled={isBusy}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                    entry.role === "user"
                      ? "bg-brand-500 text-white"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{entry.content}</p>
                  {entry.actions && entry.actions.length > 0 && (
                    <ul className="mt-2 space-y-1 border-t border-gray-200/50 pt-2 text-[10px] dark:border-gray-600">
                      {entry.actions.map((a, i) => (
                        <li
                          key={`${a.tool}-${i}`}
                          className={
                            a.success
                              ? "text-green-700 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          <span className="font-medium">{a.tool}:</span> {a.summary}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <p className="text-center text-xs text-gray-400">Düşünüyor…</p>
            )}
            {isTranscribing && (
              <p className="text-center text-xs text-gray-400">Ses metne çevriliyor…</p>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-gray-200 p-3 dark:border-gray-700"
          >
            <TextArea
              rows={2}
              placeholder="Yazın veya mikrofon ile konuşun…"
              value={input}
              onChange={setInput}
              disabled={isBusy}
              className="mb-2"
            />
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={entries.length === 0 || isBusy}
                onClick={() => {
                  setEntries([]);
                  setPendingActions([]);
                }}
              >
                Temizle
              </Button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleVoice}
                  disabled={isBusy && !isRecording}
                  title={isRecording ? "Kaydı durdur ve gönder" : "Sesli komut"}
                  aria-label={isRecording ? "Kaydı durdur" : "Sesli komut"}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${
                    isRecording
                      ? "border-red-400 bg-red-500 text-white animate-pulse"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <AppIcon name="microphone" className="size-5" />
                </button>
                <Button type="submit" size="sm" disabled={isBusy || !input.trim()}>
                  Gönder
                </Button>
              </div>
            </div>
          </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
