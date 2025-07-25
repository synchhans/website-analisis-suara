import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/app/lib/mongodb";
import User from "@/app/models/User";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-expect-error
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Akses Ditolak" }, { status: 403 });
    }

    const { email, role } = await req.json();
    if (!email || !role) {
      return NextResponse.json(
        { error: "Email dan role harus diisi" },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.role === role) {
        return NextResponse.json({
          message: "Role pengguna sudah sama, tidak ada perubahan.",
          user: existingUser,
        });
      }
      existingUser.role = role;
      await existingUser.save();
      return NextResponse.json({
        message: `Role untuk ${email} berhasil diupdate menjadi ${role}.`,
        user: existingUser,
      });
    } else {
      const newUser = new User({
        email,
        name: email.split("@")[0],
        role,
      });
      await newUser.save();
      return NextResponse.json(
        { message: "Pengguna baru berhasil ditambahkan.", user: newUser },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error saat menambah/update pengguna:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
