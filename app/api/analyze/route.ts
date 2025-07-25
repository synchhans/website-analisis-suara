import dbConnect from "@/app/lib/mongodb";
import { openrouter } from "@/app/lib/openrouter";
import Analysis from "@/app/models/Analysis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const requestFormData = await req.formData();
    const audioFile = requestFormData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file not found" },
        { status: 400 }
      );
    }

    // --- Langkah 1: Siapkan body request sebagai multipart/form-data ---
    // Ini adalah cara standar dan benar untuk mengunggah file. Kita tidak
    // lagi mengubah file menjadi Base64.
    const body = new FormData();
    body.append("file", audioFile); // Menambahkan file audio mentah
    body.append("model", "openai/whisper"); // Memberitahu OpenRouter untuk menggunakan Whisper

    // --- Langkah 2: Transkripsi menggunakan FETCH dengan FormData ke endpoint /chat/completions ---
    // Endpoint ini berfungsi sebagai "router pintar". Ia akan melihat request ini
    // adalah multipart/form-data dan mengarahkannya ke model Whisper.
    const transcriptionApiResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          // PENTING: JANGAN set 'Content-Type' di sini. Fetch akan melakukannya
          // secara otomatis dengan 'boundary' yang benar saat body adalah FormData.
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "Analisis Kepribadian Suara",
        },
        body: body, // Mengirim objek FormData sebagai body
      }
    );

    if (!transcriptionApiResponse.ok) {
      const errorBody = await transcriptionApiResponse.text();
      console.error(
        "OpenRouter transcription failed:",
        transcriptionApiResponse.status,
        errorBody
      );
      throw new Error(
        `OpenRouter API request failed with status ${transcriptionApiResponse.status}`
      );
    }

    const transcriptionData = await transcriptionApiResponse.json();

    // Berdasarkan cara OpenRouter memproses ini, hasilnya kemungkinan besar ada di properti 'text'.
    const transcription = transcriptionData.text;

    if (!transcription || transcription.trim() === "") {
      console.error("Transcription result empty:", transcriptionData);
      return NextResponse.json(
        { error: "Failed to transcribe audio, model returned empty response." },
        { status: 500 }
      );
    }

    // --- Langkah 3: Analisis Kepribadian (Tidak Berubah) ---
    const personalityPrompt = `
      Analyze the following speech transcription to identify the speaker's personality based on the Big Five (OCEAN) model: Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism. 
      Provide a score from 1-10 for each trait and a brief, encouraging explanation for your reasoning. 
      Format the output as a clean, readable summary. Do not add any introductory or concluding sentences outside of the analysis itself.

      Transcription:
      "${transcription}"
    `;

    const analysisResponse = await openrouter.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: personalityPrompt }],
    });
    const personalityAnalysis =
      analysisResponse.choices[0]?.message?.content ||
      "Analysis could not be generated.";

    // --- Langkah 4 & 5 (Tidak Berubah) ---
    const newAnalysis = new Analysis({
      transcription,
      personalityAnalysis,
    });
    await newAnalysis.save();

    return NextResponse.json({
      transcription,
      personalityAnalysis,
    });
  } catch (error) {
    console.error("Error in analysis API:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
