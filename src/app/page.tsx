'use client'; // Necessário para usar hooks como useState e useEffect

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  // 1. Estado para armazenar a mensagem de status da API
  const [apiStatus, setApiStatus] = useState("Conectando ao Backend...");
  const [isLoading, setIsLoading] = useState(true);

  // 2. Efeito para rodar a chamada à API apenas uma vez, ao carregar
  useEffect(() => {
    // A URL da API é lida da variável de ambiente que configuramos na Vercel
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
    const testRoute = '/nfe/teste'; // Sua rota de teste

    async function checkApiStatus() {
      if (!API_BASE_URL) {
        setApiStatus("ERRO: Variável NEXT_PUBLIC_API_URL não configurada!");
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${API_BASE_URL}${testRoute}`);
        const data = await response.json();

        if (response.ok) {
          // Se a API retornar sucesso (status 200)
          setApiStatus(`SUCESSO! Mensagem do Backend: "${data.status}"`);
        } else {
          // Se a API retornar um erro (ex: 500)
          setApiStatus(`ERRO DE API: Falha ao buscar status. Status: ${response.status}`);
        }
      } catch (error) {
        // Se a requisição falhar completamente (ex: DNS, conexão)
        console.error("Erro ao conectar à API:", error);
        setApiStatus("ERRO DE CONEXÃO: Não foi possível alcançar o Backend.");
      } finally {
        setIsLoading(false);
      }
    }

    checkApiStatus();
  }, []); // O array vazio garante que roda apenas no carregamento

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-3xl font-bold text-center sm:text-left">
          Status da Integração Backend
        </h1>
        
        {/* 3. Exibindo o status */}
        <div className="p-4 rounded-lg shadow-md w-full text-center">
          {isLoading ? (
            <p className="text-blue-500 font-semibold">Carregando...</p>
          ) : (
            <p className={`text-lg font-bold ${apiStatus.startsWith('SUCESSO') ? 'text-green-600' : 'text-red-600'}`}>
              {apiStatus}
            </p>
          )}
        </div>
        
        {/* Mantive o link para o Next.js original, você pode removê-lo se quiser */}
        <Image
          className="dark:invert mt-8"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        
        <p className="mt-4 text-sm text-gray-500">
          Esta página está testando a conexão com seu Backend na DigitalOcean.
        </p>
        
      </main>
      
      {/* Footer original do Next.js */}
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}