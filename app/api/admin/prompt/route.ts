import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/app/lib/mongodb";
import Setting from "@/app/models/Setting";

const PROMPT_KEY = "personalityPrompt";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Akses Ditolak" }, { status: 403 });
    }

    await dbConnect();
    const promptSetting = await Setting.findOne({ key: PROMPT_KEY });

    if (!promptSetting) {
      return NextResponse.json({ prompt: "Prompt belum diatur." });
    }

    return NextResponse.json({ prompt: promptSetting.value });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil prompt" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Akses Ditolak" }, { status: 403 });
    }

    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt tidak boleh kosong" },
        { status: 400 }
      );
    }

    await dbConnect();

    const updatedSetting = await Setting.findOneAndUpdate(
      { key: PROMPT_KEY },
      { value: prompt },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      message: "Prompt berhasil disimpan",
      setting: updatedSetting,
    });
  } catch (error) {
    console.error("Error menyimpan prompt:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan prompt" },
      { status: 500 }
    );
  }
}
