"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Leaf } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Already logged in — redirect to map
  useEffect(() => {
    if (user) {
      router.push("/map");
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/map");
    } catch (err: any) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Try again later.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-leaf-lt rounded-full mb-4">
            <Leaf className="w-8 h-8 text-leaf" />
          </div>
          <h1 className="font-bitter text-2xl font-bold text-root">G&S Good Stuff</h1>
          <p className="text-stone-c font-dm-sans text-sm mt-1">Farm Operating System</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-linen rounded-xl border border-fence-lt p-6 shadow-sm">
          <div className="mb-4">
            <label htmlFor="email" className="block text-xs font-bold text-stone-c uppercase mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="gary@gsgoodstuff.com"
              required
              className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root font-dm-sans text-sm focus:outline-none focus:ring-2 focus:ring-petal focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-xs font-bold text-stone-c uppercase mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root font-dm-sans text-sm focus:outline-none focus:ring-2 focus:ring-petal focus:border-transparent"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-frost-lt rounded-lg text-frost text-sm font-dm-sans">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-soil text-white py-3 rounded-lg font-bold font-dm-sans hover:bg-root transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
