import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import dbConnect from "../lib/mongodb";
import Analysis, { IAnalysis } from "../models/Analysis";
import { authOptions } from "../lib/auth";

async function getUserAnalyses(userId: string) {
  await dbConnect();
  const analyses = await Analysis.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(analyses)) as IAnalysis[];
}

function AnalysisListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-lg h-14 w-full"></div>
      ))}
    </div>
  );
}

async function AnalysisList({ userId }: { userId: string }) {
  const analyses = await getUserAnalyses(userId);

  if (analyses.length === 0) {
    return (
      <div className="text-center py-10 px-6 bg-gray-50 rounded-lg">
        <p className="text-gray-600">
          Anda belum memiliki riwayat analisis.
          <br />
          Coba rekam suara Anda di halaman utama!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {analyses.map((analysis) => (
        <details
          key={analysis._id as string}
          className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow group"
        >
          <summary className="cursor-pointer font-medium text-blue-600 list-none flex justify-between items-center">
            <span>
              Analisis pada{" "}
              {new Date(analysis.createdAt).toLocaleString("id-ID", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </span>
            <svg
              className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </summary>
          <div className="mt-4 pt-4 border-t text-left space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800">Transkripsi:</h3>
              <p className="italic text-gray-600">{`"${analysis.transcription}"`}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                Analisis Kepribadian:
              </h3>
              <div className="p-3 mt-1 bg-gray-100 rounded">
                <p className="whitespace-pre-wrap font-mono text-sm text-gray-700">
                  {analysis.personalityAnalysis}
                </p>
              </div>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Lihat semua riwayat analisis kepribadian Anda di sini.
      </p>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Riwayat Analisis</h2>
        <Suspense fallback={<AnalysisListSkeleton />}>
          {/* @ts-expect-error: session.user tidak memiliki properti 'id' secara default */}
          <AnalysisList userId={session.user.id} />
        </Suspense>
      </div>
    </div>
  );
}
