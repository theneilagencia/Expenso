"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert("Erro ao entrar: " + error.message);
    } else {
      window.location.href = "/dashboard";
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-semibold mb-4 text-center">Entrar</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-3 rounded"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full border p-2 mb-5 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Entrar
        </button>

        <p className="text-center mt-4 text-sm">
          Não tem conta?{" "}
          <a href="/signup" className="text-blue-600">
            Criar conta
          </a>
        </p>
      </div>
    </div>
  );
}
