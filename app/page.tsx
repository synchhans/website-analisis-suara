"use client";

import { useState } from "react";
import AudioRecorder from "./components/AudioRecorder";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    transcription: string;
    personalityAnalysis: string;
  } | null>(null);

  const handleAnalysisStart = () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
  };

  const handleAnalysisComplete = (data: {
    transcription: string;
    personalityAnalysis: string;
  }) => {
    setAnalysisResult(data);
    setIsLoading(false);
  };

  const handleAnalysisError = (message: string) => {
    setError(message);
    setIsLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50 text-gray-800">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-2">
          Analisis Kepribadian dari Suara
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Rekam suara Anda dan biarkan AI mengungkap kepribadian Anda.
        </p>

        <div className="bg-white p-8 rounded-xl shadow-md">
          <AudioRecorder
            onAnalysisStart={handleAnalysisStart}
            onAnalysisComplete={handleAnalysisComplete}
            onAnalysisError={handleAnalysisError}
          />

          {isLoading && (
            <div className="mt-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                Menganalisis... Ini mungkin butuh beberapa saat.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-8 p-4 bg-red-100 text-red-700 rounded-lg">
              <p>
                <strong>Oops! Terjadi kesalahan:</strong> {error}
              </p>
            </div>
          )}

          {analysisResult && !isLoading && (
            <div className="mt-8 text-left space-y-6">
              <div>
                <h2 className="text-2xl font-semibold border-b pb-2 mb-4">
                  Hasil Analisis
                </h2>
                {/* Kita gunakan whitespace-pre-wrap agar format dari AI (seperti baris baru) tetap terjaga */}
                <p className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {analysisResult.personalityAnalysis}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold border-b pb-2 mb-4">
                  Transkripsi Ucapan
                </h3>
                <p className="bg-gray-100 p-4 rounded-lg italic text-gray-700">
                  "{analysisResult.transcription}"
                </p>
              </div>
            </div>
          )}
        </div>
        <footer className="mt-8 text-sm text-gray-500">
          <p>Powered by Next.js, OpenRouter, and MongoDB</p>
        </footer>
      </div>
    </main>
  );
}
