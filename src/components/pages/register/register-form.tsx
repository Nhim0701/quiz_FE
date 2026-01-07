import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { registerSchema, type RegisterFormData } from "./register-schema";

interface RegisterFormProps {
  onSubmit: (name: string, email: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export function RegisterForm({ onSubmit, loading = false }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const onSubmitForm = async (data: RegisterFormData) => {
    await onSubmit(data.name, data.email, data.password);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitForm)}
      className="space-y-3.5 sm:space-y-4"
    >
      <div>
        <Label
          htmlFor="name"
          className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
        >
          Full Name
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          className={`w-full border ${
            errors.name
              ? "border-red-500 dark:border-red-600"
              : "border-slate-300 dark:border-slate-600"
          } dark:bg-slate-700 dark:text-slate-100 rounded-lg px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition`}
          disabled={loading}
          {...register("name")}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.name.message}
          </p>
        )}
      </div>

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
          } dark:bg-slate-700 dark:text-slate-100 rounded-lg px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition`}
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
          } dark:bg-slate-700 dark:text-slate-100 rounded-lg px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition`}
          disabled={loading}
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <Label
          htmlFor="confirmPassword"
          className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
        >
          Confirm Password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          className={`w-full border ${
            errors.confirmPassword
              ? "border-red-500 dark:border-red-600"
              : "border-slate-300 dark:border-slate-600"
          } dark:bg-slate-700 dark:text-slate-100 rounded-lg px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition`}
          disabled={loading}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 text-white py-2.5 sm:py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 dark:hover:from-purple-600 dark:hover:to-indigo-600 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 mt-5 sm:mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
}
