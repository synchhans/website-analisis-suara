"use client";

import { useRef, useState } from "react";

function ResultSkeleton() {
  return (
    <div className="mt-8 w-full text-left space-y-6 animate-pulse">
      <div>
        <div className="h-8 bg-gray-200 rounded-md w-1/2 mb-4"></div>
        <div className="space-y-2 p-4 bg-gray-100 rounded-lg">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>
      </div>
      <div>
        <div className="h-6 bg-gray-200 rounded-md w-1/3 mb-4"></div>
        <div className="p-4 bg-gray-100 rounded-lg">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
    </svg>
  );
}

type AppState =
  | "idle"
  | "recording"
  | "recorded"
  | "analyzing"
  | "success"
  | "error";

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    transcription: string;
    personalityAnalysis: string;
  } | null>(null);

  const [recordingTime, setRecordingTime] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const MAX_RECORDING_DURATION = 30;

  const toggleRecording = async () => {
    if (appState === "recording") {
      mediaRecorderRef.current?.stop();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setRecordingTime(0);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        mediaRecorderRef.current = recorder;
        const audioChunks: Blob[] = [];

        recorder.ondataavailable = (event) => audioChunks.push(event.data);
        recorder.onstop = () => {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setRecordingTime(0);

          const blob = new Blob(audioChunks, { type: "audio/webm" });
          setAudioBlob(blob);
          setAppState("recorded");
          stream.getTracks().forEach((track) => track.stop());
        };

        recorder.start();
        setAppState("recording");

        setRecordingTime(0);
        timerIntervalRef.current = setInterval(() => {
          setRecordingTime((prevTime) => {
            const newTime = prevTime + 1;
            if (newTime >= MAX_RECORDING_DURATION) {
              mediaRecorderRef.current?.stop();
            }
            return newTime;
          });
        }, 1000);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        setError("Tidak bisa mengakses mikrofon. Mohon berikan izin.");
        setAppState("error");
      }
    }
  };

  const handleAnalyze = async () => {
    if (!audioBlob) return;

    setAppState("analyzing");
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Terjadi kesalahan pada server.");
      }
      setAnalysisResult(result);
      setAppState("success");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal menganalisis suara.";
      setError(errorMessage);
      setAppState("error");
    }
  };

  const handleReset = () => {
    setAppState("idle");
    setAudioBlob(null);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          Ungkap <span className="text-blue-600">Kepribadianmu</span> Melalui
          Suara
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto">
          Teknologi AI kami menganalisis caramu berbicara untuk memberikan
          wawasan mendalam tentang dirimu. Coba gratis sekarang.
        </p>
      </div>

      <div className="mt-12 max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 min-h-[300px] flex flex-col justify-center items-center">
        {(appState === "idle" || appState === "recording") && (
          <div className="flex flex-col items-center gap-4 animate-[fadeIn_0.5s]">
            <button
              onClick={toggleRecording}
              className={`relative flex items-center justify-center w-20 h-20 rounded-full text-white shadow-lg transition-all duration-300 ease-in-out ${
                appState === "recording"
                  ? "bg-red-500 animate-pulse"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <MicIcon className="w-8 h-8" />
            </button>
            <p className="text-sm text-gray-500">
              {appState === "recording"
                ? `Merekam... ${recordingTime}s / ${MAX_RECORDING_DURATION}s`
                : "Tekan untuk mulai (Maks. 30 detik)"}
            </p>
          </div>
        )}

        {appState === "recorded" && audioBlob && (
          <div className="w-full max-w-sm p-4 animate-[fadeIn_0.5s_ease-in-out]">
            <p className="text-center font-medium mb-3 text-gray-700">
              Rekaman Siap Dianalisis
            </p>
            <audio
              src={URL.createObjectURL(audioBlob)}
              controls
              className="w-full"
            />
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleReset}
                className="w-full px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all"
              >
                Rekam Ulang
              </button>
              <button
                onClick={handleAnalyze}
                className="w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 transition-all"
              >
                Analisis Sekarang
              </button>
            </div>
          </div>
        )}

        {appState === "analyzing" && <ResultSkeleton />}

        {appState === "success" && analysisResult && (
          <div className="w-full text-left space-y-8 animate-[fadeIn_0.5s]">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-4">
                Hasil Analisis
              </h2>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="whitespace-pre-wrap text-gray-800 font-mono text-sm leading-relaxed">
                  {analysisResult.personalityAnalysis}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-700 border-b pb-3 mb-4">
                Transkripsi Anda
              </h3>
              <p className="p-4 bg-gray-50 rounded-lg italic text-gray-600">{`"${analysisResult.transcription}"`}</p>
            </div>
            <div className="text-center pt-4">
              <button
                onClick={handleReset}
                className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
              >
                Analisis Lagi
              </button>
            </div>
          </div>
        )}

        {appState === "error" && (
          <div className="p-4 text-center animate-[fadeIn_0.5s]">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleReset}
              className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
            >
              Coba Lagi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
