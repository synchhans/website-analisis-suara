"use client";

import { useState, useRef } from "react";

// Tipe untuk props agar bisa komunikasi dengan parent component
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
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(blob);
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioBlob(null); // Reset audio blob saat mulai merekam
    } catch (err) {
      console.error("Error accessing microphone:", err);
      onAnalysisError("Tidak bisa mengakses mikrofon. Mohon berikan izin.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      // Hentikan track mikrofon agar lampu indikator mati
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const handleAnalyze = async () => {
    if (!audioBlob) return;

    onAnalysisStart(); // Beri tahu parent bahwa analisis dimulai

    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze audio.");
      }

      const result = await response.json();
      onAnalysisComplete(result);
    } catch (error) {
      console.error("Error analyzing audio:", error);
      onAnalysisError("Gagal menganalisis suara. Coba lagi nanti.");
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
