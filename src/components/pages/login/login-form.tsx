import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginSchema, type LoginFormData } from "./login-schema";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export function LoginForm({ onSubmit, loading = false, error }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmitForm = async (data: LoginFormData) => {
    await onSubmit(data.email, data.password);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 sm:space-y-5">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <Label
          htmlFor="email"
          className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
        >
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          className={`w-full border ${
            errors.email
              ? "border-red-500 dark:border-red-600"
              : "border-slate-300 dark:border-slate-600"
          } dark:bg-slate-700 dark:text-slate-100 rounded-lg px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition`}
          disabled={loading}
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Label
          htmlFor="password"
          className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
        >
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          className={`w-full border ${
            errors.password
              ? "border-red-500 dark:border-red-600"
              : "border-slate-300 dark:border-slate-600"
          } dark:bg-slate-700 dark:text-slate-100 rounded-lg px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition`}
          disabled={loading}
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white py-2.5 sm:py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? "Signing In..." : "Sign In"}
      </Button>
    </form>
  );
}

