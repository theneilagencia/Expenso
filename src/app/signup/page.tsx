"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    const {
      data: { user },
      error
    } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      alert(error.message);
      return;
    }

    // Cria usuário no banco
    await fetch("/api/auth/create-user", {
      method: "POST",
      body: JSON.stringify({ email, name }),
      headers: { "Content-Type": "application/json" }
    });

    alert("Conta criada! Verifique seu email.");
    window.location.href = "/login";
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Criar Conta
        </h1>

        <input
          type="text"
          placeholder="Nome"
          className="w-full border p-2 mb-3 rounded"
          onChange={(e) => setName(e.target.value)}
        />

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
          onClick={handleSignup}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Criar conta
        </button>
      </div>
    </div>
  );
}
