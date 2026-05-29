import { useCallback, useRef, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { resolveAdminAiError } from "../features/adminAi/adminAiApi";
import { getApiBaseUrl } from "../config/api";

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t));
}

function extensionForMime(mime: string): string {
  if (mime.includes("webm")) return "webm";
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("mp4")) return "m4a";
  return "webm";
}

export function useAdminVoiceInput() {
  const token = useSelector((s: RootState) => s.auth.token);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startRecording = useCallback(async (): Promise<string | null> => {
    if (!navigator.mediaDevices?.getUserMedia) {
      return "Tarayıcınız mikrofon kaydını desteklemiyor.";
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickMimeType();
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
      return null;
    } catch {
      stopStream();
      return "Mikrofon izni gerekli. Tarayıcı ayarlarından izin verin.";
    }
  }, [stopStream]);

  const stopAndTranscribe = useCallback(async (): Promise<{
    text?: string;
    error?: string;
  }> => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      setIsRecording(false);
      stopStream();
      return { error: "Kayıt bulunamadı." };
    }

    return new Promise((resolve) => {
      recorder.onstop = async () => {
        setIsRecording(false);
        stopStream();
        recorderRef.current = null;

        const mime = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mime });
        chunksRef.current = [];

        if (blob.size < 100) {
          resolve({ error: "Kayıt çok kısa. Tekrar deneyin." });
          return;
        }

        if (!token) {
          resolve({ error: "Oturum süresi dolmuş olabilir." });
          return;
        }

        setIsTranscribing(true);
        try {
          const ext = extensionForMime(mime);
          const formData = new FormData();
          formData.append("file", blob, `admin-voice.${ext}`);

          const res = await fetch(
            `${getApiBaseUrl()}/api/admin/ai/transcribe?language=tr`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            },
          );

          const json = (await res.json()) as {
            success?: boolean;
            message?: string;
            data?: string;
          };

          if (!res.ok || !json.success) {
            resolve({
              error: resolveAdminAiError(json.message ?? "Ses metne çevrilemedi."),
            });
            return;
          }

          const text = (typeof json.data === "string" ? json.data : "").trim();
          if (!text) {
            resolve({ error: "Konuşma algılanamadı. Tekrar deneyin." });
            return;
          }

          resolve({ text });
        } catch {
          resolve({ error: "Ses gönderilemedi. Bağlantıyı kontrol edin." });
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.stop();
    });
  }, [token, stopStream]);

  const toggleRecording = useCallback(
    async (onText: (text: string) => void, onError: (msg: string) => void) => {
      if (isTranscribing) return;

      if (isRecording) {
        const result = await stopAndTranscribe();
        if (result.error) onError(result.error);
        else if (result.text) onText(result.text);
        return;
      }

      const err = await startRecording();
      if (err) onError(err);
    },
    [isRecording, isTranscribing, startRecording, stopAndTranscribe],
  );

  return { isRecording, isTranscribing, toggleRecording };
}
