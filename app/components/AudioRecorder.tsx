"use client";

import { useState, useRef } from "react";

interface AudioRecorderProps {
  onAnalysisComplete: (data: {
    transcription: string;
    personalityAnalysis: string;
  }) => void;
  onAnalysisStart: () => void;
  onAnalysisError: (message: string) => void;
}

export default function AudioRecorder({
  onAnalysisComplete,
  onAnalysisStart,
  onAnalysisError,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        audioChunksRef.current = [];
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioBlob(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      onAnalysisError("Tidak bisa mengakses mikrofon. Mohon berikan izin.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAnalyze = async () => {
    if (!audioBlob) return;

    onAnalysisStart();

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
      onAnalysisComplete(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menganalisis suara.";
      console.error("Error analyzing audio:", error);
      onAnalysisError(errorMessage);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-transform transform hover:scale-105"
        >
          Mulai Merekam
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-lg animate-pulse"
        >
          Berhenti Merekam
        </button>
      )}

      {audioBlob && !isRecording && (
        <div className="flex flex-col items-center gap-4 mt-4 p-4 border border-gray-300 rounded-lg">
          <p className="text-sm text-gray-600">
            Rekaman selesai. Siap dianalisis.
          </p>
          <audio
            src={URL.createObjectURL(audioBlob)}
            controls
            className="w-full max-w-sm"
          />
          <button
            onClick={handleAnalyze}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            Analisis Suara Saya
          </button>
        </div>
      )}
    </div>
  );
}
