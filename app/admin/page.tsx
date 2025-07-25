import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "../lib/mongodb";
import User from "../models/User";
import AddUserForm from "../components/AddUserForm";
import PromptManager from "../components/PromptManager";

async function getUsers() {
  await dbConnect();
  const users = await User.find({}).sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(users));
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // @ts-ignore
  if (session?.user?.role !== "admin") {
    redirect("/");
  }

  const users = await getUsers();

  return (
    <div className="bg-gray-100 min-h-full">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <section className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-1">Manajemen Pengguna</h2>
          <p className="text-gray-500 mb-6">
            Kelola pengguna yang memiliki akses ke aplikasi.
          </p>
          <div className="mb-8 p-4 border-l-4 border-blue-500 bg-blue-50">
            <h3 className="text-lg font-medium text-blue-800 mb-2">
              Tambah Pengguna Baru
            </h3>
            <AddUserForm />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nama
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user: any) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "admin"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-1">Pengelola Prompt</h2>
          <div className="mt-6">
            <PromptManager />
          </div>
        </section>
      </div>
    </div>
  );
}
