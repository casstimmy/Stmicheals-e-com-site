import Head from "next/head";
import Header from "@/components/Header";
import Center from "@/components/Center";
import Link from "next/link";

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page Not Found | St Michael&apos;s Store</title>
      </Head>
      <Header />
      <Center>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-center bg-white rounded-2xl shadow-lg p-12 max-w-md">
            <h1 className="text-6xl font-extrabold text-gray-300 mb-4">404</h1>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-600 mb-8">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </Center>
    </>
  );
}
