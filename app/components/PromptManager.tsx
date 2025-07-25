"use client";

import { useState, useEffect, FormEvent } from "react";

function SkeletonLoader() {
  return (
    <div className="animate-pulse">
      <div className="w-full h-48 bg-gray-200 rounded-md"></div>
      <div className="mt-4 h-10 bg-gray-200 rounded-md w-32"></div>
    </div>
  );
}

export default function PromptManager() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchPrompt = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/admin/prompt");
        const data = await response.json();
        if (response.ok) {
          setPrompt(data.prompt);
        } else {
          throw new Error(data.error || "Gagal memuat prompt.");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Terjadi kesalahan.";
        setMessage({ type: "error", text: errorMessage });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompt();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menyimpan prompt.");
      }

      setMessage({ type: "success", text: data.message });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Terjadi kesalahan.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-gray-500 mb-4 text-sm leading-relaxed">
        Ubah instruksi yang diberikan kepada AI untuk analisis kepribadian.
        Gunakan placeholder{" "}
        <code className="bg-gray-200 text-gray-800 font-mono text-xs px-1.5 py-0.5 rounded-md">{`{transcription}`}</code>{" "}
        untuk menyisipkan hasil transkripsi suara ke dalam prompt Anda.
      </p>
      <textarea
        className="w-full p-3 border rounded-md bg-gray-50 font-mono text-sm focus:ring-2 focus:ring-blue-500"
        rows={15}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Masukkan prompt Anda di sini..."
      />
      <div className="mt-4 flex items-center justify-between">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {isSaving ? "Menyimpan..." : "Simpan Prompt"}
        </button>
        {message && (
          <p
            className={`text-sm font-medium ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}
