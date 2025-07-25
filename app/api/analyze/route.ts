import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@deepgram/sdk";
import { openrouter } from "@/app/lib/openrouter";
import dbConnect from "@/app/lib/mongodb";
import Analysis from "@/app/models/Analysis";

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "File audio tidak ditemukan." },
        { status: 400 }
      );
    }

    const audioBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(audioBuffer);

    const { result, error: deepgramError } =
      await deepgram.listen.prerecorded.transcribeFile(buffer, {
        model: "nova-2",
        smart_format: true,
        language: "id",
      });

    if (deepgramError) {
      console.error("Deepgram Error:", deepgramError);
      throw new Error("Gagal mentranskripsi audio.");
    }

    const transcription = result.results.channels[0].alternatives[0].transcript;
    if (!transcription) {
      throw new Error("Transkripsi kosong.");
    }

    const personalityPrompt = `
      Anda adalah seorang psikolog AI yang ahli. Analisislah transkripsi ucapan berikut untuk mengidentifikasi kepribadian pembicara berdasarkan model Big Five (OCEAN): Keterbukaan (Openness), Kesadaran (Conscientiousness), Ekstraversi (Extraversion), Keramahan (Agreeableness), dan Neurotisisme (Neuroticism).

      Instruksi Output:
      1.  Berikan skor dari 1-10 untuk setiap sifat kepribadian (Keterbukaan, Kesadaran, dll.).
      2.  Berikan penjelasan singkat, padat, dan memberi semangat untuk setiap skor dalam Bahasa Indonesia.
      3.  Format output sebagai ringkasan yang bersih dan mudah dibaca, tanpa kalimat pembuka atau penutup di luar analisis itu sendiri.

      Transkripsi Ucapan:
      "${transcription}"
    `;

    const analysisResponse = await openrouter.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: personalityPrompt }],
    });
    const personalityAnalysis =
      analysisResponse.choices[0]?.message?.content ||
      "Analisis tidak dapat dibuat.";

    await dbConnect();
    const newAnalysis = new Analysis({ transcription, personalityAnalysis });
    await newAnalysis.save();

    return NextResponse.json({
      transcription,
      personalityAnalysis,
    });
  } catch (error) {
    console.error("Error di API Route:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan internal.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
