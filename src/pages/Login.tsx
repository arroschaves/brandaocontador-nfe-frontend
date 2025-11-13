import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Building2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Button, ButtonLoading } from "../components/ui/button";
import { Input } from "../components/ui/Input";
import { useToast } from "../contexts/ToastContext";
import { formatCooldown } from "../utils/time";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Cooldown após rate limiting (HTTP 429)
  const [cooldownSeconds, setCooldownSeconds] = useState<number | null>(null);

  const {
    login,
    isAuthenticated,
    error,
    clearError,
    user,
    isLoading: authLoading,
  } = useAuth();
  const { showToast } = useToast();

  // Helper: formatar cooldown em mm:ss

  // Helper: extrair segundos do Retry-After a partir da mensagem de erro
  const extractRetrySeconds = (msg: string): number | null => {
    const secMatch = msg.match(/Aguarde\s+(\d+)\s*s/i);
    if (secMatch) {
      const sec = parseInt(secMatch[1], 10);
      if (!Number.isNaN(sec) && sec > 0) return sec;
    }
    const minMatch = msg.match(/Aguarde\s+(\d+)\s+minuto/i);
    if (minMatch) {
      const mins = parseInt(minMatch[1], 10);
      if (!Number.isNaN(mins) && mins > 0) return mins * 60;
    }
    return null;
  };

  // Limpar erro quando componente montar
  useEffect(() => {
    clearError();
  }, []);

  // Detectar erros de rate limit (429) e iniciar cooldown
  useEffect(() => {
    if (!error) return;
    const isRateLimited =
      /Limite de tentativas|Muitas tentativas|Aguarde/i.test(error);
    if (!isRateLimited) return;

    const seconds = extractRetrySeconds(error) ?? 60; // padrão: 60s
    setCooldownSeconds(seconds);
  }, [error]);

  // Countdown do cooldown
  useEffect(() => {
    if (cooldownSeconds == null) return;
    if (cooldownSeconds <= 0) {
      showToast("Você já pode tentar novamente", "info");
      setCooldownSeconds(null);
      clearError();
      return;
    }
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev == null) return null;
        const next = prev - 1;
        return next > 0 ? next : 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  // Redirecionar se já estiver autenticado
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Impedir tentativa durante cooldown
    if (cooldownSeconds && cooldownSeconds > 0) {
      showToast("Muitas tentativas. Aguarde o cooldown terminar.", "warning");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(formData.email, formData.password);

      if (!success) {
        // Erro já tratado no AuthContext
      }
    } catch (error) {
      // Erro já tratado no AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
              placeholder="seu@email.com"
              disabled={isLoading || !!cooldownSeconds}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange}
              className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
              placeholder="Sua senha"
              disabled={isLoading || !!cooldownSeconds}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading || !!cooldownSeconds}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Cooldown info */}
        {cooldownSeconds != null && cooldownSeconds > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-700">
              Muitas tentativas. Aguarde {formatCooldown(cooldownSeconds)} para
              tentar novamente.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div>
          {isLoading ? (
            <ButtonLoading className="w-full">Entrando...</ButtonLoading>
          ) : (
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !!cooldownSeconds}
            >
              {cooldownSeconds
                ? `Aguarde ${formatCooldown(cooldownSeconds)}...`
                : "Entrar"}
            </Button>
          )}
        </div>
      </form>

      {/* Footer Links */}
      <div className="mt-6 text-center space-y-2">
        <div>
          <Link
            to="/esqueci-senha"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Esqueceu sua senha?
          </Link>
        </div>
        <div className="text-sm text-gray-600">
          Não possui uma conta?{" "}
          <Link
            to="/cadastro"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Cadastre-se aqui
          </Link>
        </div>
      </div>
    </>
  );
};

export default Login;
