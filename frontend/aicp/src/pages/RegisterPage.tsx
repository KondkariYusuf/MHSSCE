import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type UserRole = "Clerk" | "Staff" | "Principal" | "Institute Authority";

interface InstituteOption {
  id: string;
  name: string;
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: "Clerk", label: "Clerk" },
  { value: "Staff", label: "Staff / HOD" },
  { value: "Principal", label: "Principal" },
  { value: "Institute Authority", label: "Institute Authority" },
];

const FALLBACK_INSTITUTES: InstituteOption[] = [
  { id: "mhssce", name: "MHSSCE" },
  { id: "mhssp", name: "MHSSP" },
  { id: "mhss-college", name: "MHSS-College" },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("Clerk");
  const [instituteId, setInstituteId] = useState("");
  const [institutes, setInstitutes] = useState<InstituteOption[]>(FALLBACK_INSTITUTES);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // If already logged in, redirect to dashboard
  if (!authLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Fetch institutes for the dropdown (keeps fallbacks if DB is empty)
  useEffect(() => {
    const fetchInstitutes = async () => {
      const { data, error } = await supabase
        .from("institutes")
        .select("id, name")
        .order("name");

      if (!error && data && data.length > 0) {
        setInstitutes(data);
      }
    };
    fetchInstitutes();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!instituteId) {
      setError("Please select an institute.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create the auth user in Supabase
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role,
              institute_id: instituteId,
            },
          },
        });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Step 2: Insert the profile row into public.users
      // This works if the user is immediately confirmed (e.g. email confirmation disabled)
      // or if you have a DB trigger / RLS INSERT policy for new users.
      if (signUpData.user) {
        const { error: profileError } = await supabase.from("users").insert({
          id: signUpData.user.id,
          full_name: fullName,
          role,
          institute_id: instituteId,
        });

        if (profileError) {
          console.error("Profile creation error:", profileError.message);
          // Don't block — the auth account was created,
          // profile can be created on first login via a trigger if needed.
        }
      }

      // Check if email confirmation is required
      if (signUpData.user && !signUpData.session) {
        // Email confirmation is enabled — show confirmation message
        setSuccess(true);
      } else {
        // Auto-confirmed — go to dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
          </div>

          <div
            className="bg-[hsl(142,70%,92%)] border-[3px] border-foreground p-8 text-center"
            style={{ boxShadow: "6px 6px 0px hsl(150 10% 10%)" }}
          >
            <div className="text-4xl mb-4">✉️</div>
            <h2 className="text-2xl font-mono font-bold uppercase mb-3">
              Check Your Email
            </h2>
            <p className="text-muted-foreground font-medium mb-2">
              We sent a confirmation link to
            </p>
            <p className="font-bold text-sm mb-4">{email}</p>
            <p className="text-xs text-muted-foreground">
              Click the link in the email to activate your account, then come
              back to sign in.
            </p>
            <Link to="/login" className="brutal-button mt-6 inline-block">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Register Form */}
        <div
          className="bg-card border-[3px] border-foreground p-8"
          style={{ boxShadow: "6px 6px 0px hsl(150 10% 10%)" }}
        >
          <h2 className="text-2xl font-mono font-bold mb-6 uppercase">
            Create Account
          </h2>

          {error && (
            <div className="bg-[hsl(0,70%,92%)] border-[3px] border-foreground p-3 mb-4">
              <p className="text-sm font-bold text-[hsl(0,70%,30%)]">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-sm font-bold uppercase tracking-wider block mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Dr. Naeem Ansari"
                className="brutal-input"
              />
            </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold uppercase tracking-wider block mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Min 6 chars"
                  className="brutal-input"
                />
              </div>
              <div>
                <label className="text-sm font-bold uppercase tracking-wider block mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="brutal-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold uppercase tracking-wider block mb-2">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  required
                  className="brutal-input"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold uppercase tracking-wider block mb-2">
                  Institute
                </label>
                <select
                  value={instituteId}
                  onChange={(e) => setInstituteId(e.target.value)}
                  required
                  className="brutal-input"
                >
                  <option value="">Select institute</option>
                  {institutes.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="brutal-button w-full disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Register →"}
            </button>
          </form>

          <p className="text-xs text-muted-foreground mt-4 text-center font-medium">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-foreground font-bold underline underline-offset-2 hover:text-primary"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
