"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [objective, setObjective] = useState("");
  const [budget, setBudget] = useState("");
  const [experience, setExperience] = useState("");

  async function handleFinish() {
    // enviar dados para o backend
    await fetch("/api/onboarding/save", {
      method: "POST",
      body: JSON.stringify({
        objective,
        budget,
        experience
      }),
      headers: { "Content-Type": "application/json" }
    });

    router.push("/integrations");
  }

  return (
    <div className="max-w-md mx-auto py-12">
      {step === 1 && (
        <div>
          <h1 className="text-xl font-semibold mb-4">Qual é o seu objetivo?</h1>

          <div className="space-y-2">
            <button
              className="w-full p-3 border rounded"
              onClick={() => {
                setObjective("leads");
                setStep(2);
              }}
            >
              Gerar Leads
            </button>

            <button
              className="w-full p-3 border rounded"
              onClick={() => {
                setObjective("vendas");
                setStep(2);
              }}
            >
              Vender Mais
            </button>

            <button
              className="w-full p-3 border rounded"
              onClick={() => {
                setObjective("trafego");
                setStep(2);
              }}
            >
              Aumentar Tráfego
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h1 className="text-xl font-semibold mb-4">
            Qual é o orçamento mensal?
          </h1>

          <input
            type="number"
            placeholder="Ex: 500"
            className="w-full p-2 border rounded mb-4"
            onChange={(e) => setBudget(e.target.value)}
          />

          <button
            className="w-full p-3 bg-blue-600 text-white rounded"
            onClick={() => setStep(3)}
          >
            Continuar
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h1 className="text-xl font-semibold mb-4">
            Qual é o seu nível de experiência com anúncios?
          </h1>

          <button
            className="w-full p-3 border rounded mb-2"
            onClick={() => {
              setExperience("iniciante");
              handleFinish();
            }}
          >
            Nunca anunciei
          </button>

          <button
            className="w-full p-3 border rounded mb-2"
            onClick={() => {
              setExperience("intermediario");
              handleFinish();
            }}
          >
            Já anunciei um pouco
          </button>

          <button
            className="w-full p-3 border rounded"
            onClick={() => {
              setExperience("avancado");
              handleFinish();
            }}
          >
            Sou experiente
          </button>
        </div>
      )}
    </div>
  );
}
