"use client";

import { useState } from "react";
import { FormField, validationHelpers } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

/**
 * Página de teste para FormField com validação inline
 * Demonstra todos os recursos de acessibilidade e validação
 */
export default function TestFormValidationPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    website: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Formulário válido!", {
      description: "Todos os campos foram validados com sucesso.",
    });
    console.log("Form data:", formData);
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-dark-700 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="border-gold-500/40">
          <CardHeader>
            <CardTitle className="text-3xl font-medieval text-gold-500">
              Teste de Validação de Formulário
            </CardTitle>
            <CardDescription className="text-lg">
              Demonstração de validação inline com feedback em tempo real e padrões de acessibilidade
              WCAG 2.1 Level AA
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username - Obrigatório, min 3 caracteres */}
              <FormField
                id="username"
                label="Nome de Usuário"
                value={formData.username}
                onChange={handleChange("username")}
                validationRules={[
                  validationHelpers.required("Por favor, insira um nome de usuário"),
                  validationHelpers.minLength(3, "Nome de usuário deve ter pelo menos 3 caracteres"),
                  validationHelpers.maxLength(20, "Nome de usuário deve ter no máximo 20 caracteres"),
                ]}
                placeholder="Digite seu nome de usuário"
                required
                autoComplete="username"
              />

              {/* Email - Obrigatório, formato válido */}
              <FormField
                id="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                validationRules={[
                  validationHelpers.required("Por favor, insira um email"),
                  validationHelpers.email("Por favor, insira um email válido"),
                ]}
                placeholder="seu@email.com"
                required
                autoComplete="email"
              />

              {/* Password - Obrigatório, mínimo 8 caracteres com letra e número */}
              <FormField
                id="password"
                label="Senha"
                type="password"
                value={formData.password}
                onChange={handleChange("password")}
                validationRules={[
                  validationHelpers.required("Por favor, insira uma senha"),
                  validationHelpers.password(),
                ]}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                helperText="Mínimo 8 caracteres, incluindo letra e número"
              />

              {/* Confirm Password - Deve coincidir com password */}
              <FormField
                id="confirmPassword"
                label="Confirmar Senha"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                validationRules={[
                  validationHelpers.required("Por favor, confirme sua senha"),
                  validationHelpers.custom(
                    (value) => value === formData.password,
                    "As senhas não coincidem"
                  ),
                ]}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />

              {/* Website - Opcional, mas deve ser URL válida se preenchido */}
              <FormField
                id="website"
                label="Website (opcional)"
                type="url"
                value={formData.website}
                onChange={handleChange("website")}
                validationRules={[
                  validationHelpers.custom(
                    (value) => value === "" || /^https?:\/\/.+/.test(value),
                    "URL deve começar com http:// ou https://"
                  ),
                ]}
                placeholder="https://seusite.com"
                helperText="Deixe em branco se não tiver um website"
              />

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" variant="drogon" className="flex-1">
                  Enviar Formulário
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setFormData({
                      username: "",
                      email: "",
                      password: "",
                      confirmPassword: "",
                      website: "",
                    })
                  }
                  className="flex-1"
                >
                  Limpar
                </Button>
              </div>
            </form>

            {/* Informações sobre acessibilidade */}
            <div className="mt-8 p-4 bg-card/50 rounded-lg border border-border">
              <h3 className="text-lg font-medieval text-gold-500 mb-3">
                Recursos de Acessibilidade
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>
                    <strong>Touch Targets:</strong> Todos os inputs têm altura mínima de 44px (WCAG
                    2.5.5)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>
                    <strong>Validação Inline:</strong> Feedback em tempo real ao digitar e ao sair
                    do campo
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>
                    <strong>ARIA:</strong> Atributos aria-invalid, aria-describedby, aria-required
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>
                    <strong>Screen Readers:</strong> Mensagens de erro com role="alert" e
                    aria-live="assertive"
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>
                    <strong>Feedback Visual:</strong> Cores, ícones e bordas indicam status de
                    validação
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>
                    <strong>Focus Indicators:</strong> Anel de foco visível com contraste adequado
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Card de Debug */}
        <Card className="mt-6 border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-medieval">Estado do Formulário (Debug)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-dark-500/50 p-4 rounded overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
