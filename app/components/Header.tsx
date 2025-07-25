"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

function Skeleton() {
  return <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse"></div>;
}

export default function Header() {
  const { data: session, status } = useSession();
  // @ts-expect-error: session.user tidak memiliki properti 'role' secara default
  const isAdmin = session?.user?.role === "admin";

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.636 5.636a9 9 0 0112.728 0m-12.728 0l12.728 12.728"
              />
            </svg>
            <span>Analisis Suara</span>
          </Link>

          <div className="flex items-center">
            {status === "loading" ? (
              <Skeleton />
            ) : session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
                >
                  {session.user?.image && (
                    <Image
                      src={session.user.image}
                      alt="Avatar Pengguna"
                      width={38}
                      height={38}
                      className="rounded-full"
                    />
                  )}
                </button>

                <div
                  className={`
                    absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-20 
                    transition-all duration-200 ease-out
                    ${
                      isDropdownOpen
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-95 pointer-events-none"
                    }
                  `}
                >
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm text-gray-500">Masuk sebagai</p>
                    <p className="font-semibold text-gray-800 truncate">
                      {session.user?.name}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Admin Panel
                      </Link>
                    )}
                  </div>
                  <div className="border-t border-gray-200 py-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        signOut();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
