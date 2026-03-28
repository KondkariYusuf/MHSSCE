import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  if (!authLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-block bg-primary text-primary-foreground px-8 py-4 border-[3px] border-foreground mb-4"
            style={{ boxShadow: "6px 6px 0px hsl(150 10% 10%)" }}
          >
            <h1 className="text-4xl font-mono font-bold tracking-tighter">
              AICP
            </h1>
          </div>
          <p className="text-lg font-bold uppercase tracking-widest text-muted-foreground">
            Anjuman Institute Compliance Portal
          </p>
        </div>

        {/* Login Form */}
        <div
          className="bg-card border-[3px] border-foreground p-8"
          style={{ boxShadow: "6px 6px 0px hsl(150 10% 10%)" }}
        >
          <h2 className="text-2xl font-mono font-bold mb-6 uppercase">
            Sign In
          </h2>

          {error && (
            <div className="bg-[hsl(0,70%,92%)] border-[3px] border-foreground p-3 mb-4">
              <p className="text-sm font-bold text-[hsl(0,70%,30%)]">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm font-bold uppercase tracking-wider block mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@anjuman.edu"
                className="brutal-input"
              />
            </div>

            <div>
              <label className="text-sm font-bold uppercase tracking-wider block mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="brutal-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="brutal-button w-full disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Login →"}
            </button>
          </form>

          <p className="text-xs text-muted-foreground mt-4 text-center font-medium">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-foreground font-bold underline underline-offset-2 hover:text-primary"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
