import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@deepgram/sdk";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/app/lib/mongodb";
import Analysis from "@/app/models/Analysis";
import { openrouter } from "@/app/lib/openrouter";
import Setting from "@/app/models/Setting";

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
const RATE_LIMIT_COUNT = 5;

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session) {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const usageCount = await Analysis.countDocuments({
      ipAddress: ip,
      createdAt: { $gte: startOfDay },
    });

    if (usageCount >= RATE_LIMIT_COUNT) {
      return NextResponse.json(
        {
          error:
            "Anda telah mencapai batas penggunaan harian. Silakan login untuk penggunaan tanpa batas.",
        },
        { status: 429 }
      );
    }
  }

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
    if (!transcription || transcription.trim() === "") {
      throw new Error("Transkripsi kosong.");
    }

    const promptSetting = await Setting.findOne({ key: "personalityPrompt" });

    let basePrompt = `
          Anda adalah seorang psikolog AI... (PROMPT DEFAULT DI SINI)
          Transkripsi Ucapan: "{transcription}"
        `;

    if (promptSetting) {
      basePrompt = promptSetting.value;
    }

    const personalityPrompt = basePrompt.replace(
      "{transcription}",
      transcription
    );

    const analysisResponse = await openrouter.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: personalityPrompt }],
    });

    const personalityAnalysis =
      analysisResponse.choices[0]?.message?.content ||
      "Analisis tidak dapat dibuat.";

    // @ts-ignore
    const userId = session?.user?.id;
    const ipAddress = !session
      ? req.headers.get("x-forwarded-for") ?? "127.0.0.1"
      : undefined;

    const newAnalysis = new Analysis({
      transcription,
      personalityAnalysis,
      userId,
      ipAddress,
    });
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
