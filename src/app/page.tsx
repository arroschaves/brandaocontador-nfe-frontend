'use client'; // Necessário para usar hooks como useState e useEffect

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
    // 1. Estados para o status da API (GET)
    const [apiStatus, setApiStatus] = useState("Conectando ao Backend...");
    const [isLoading, setIsLoading] = useState(true);

    // 2. Novo Estado para o resultado da emissão (POST)
    const [postStatus, setPostStatus] = useState("Aguardando teste de POST...");
    const [isPosting, setIsPosting] = useState(false);

    // Variáveis de Rota
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
    const testRoute = '/nfe/teste'; // GET
    const emitirRoute = '/nfe/emitir'; // POST

    // --- Função de Teste da Rota GET ---
    useEffect(() => {
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
                    setApiStatus(`SUCESSO! Mensagem do Backend: "${data.status}"`);
                } else {
                    setApiStatus(`ERRO DE API: Falha ao buscar status. Status: ${response.status}`);
                }
            } catch (error) {
                setApiStatus("ERRO DE CONEXÃO: Não foi possível alcançar o Backend.");
            } finally {
                setIsLoading(false);
            }
        }

        checkApiStatus();
    }, []); 
    
    // --- Nova Função para Envio POST ---
    const sendNfeData = async () => {
        if (!API_BASE_URL) {
            setPostStatus("ERRO: NEXT_PUBLIC_API_URL não configurada.");
            return;
        }

        setIsPosting(true);
        setPostStatus("Enviando dados POST para o backend...");

        // Dados simulados para emissão da NF-e
        const simulatedData = {
            identificacao: 'nf-0001',
            destinatario: 'Cliente Teste Vercel',
            valor_total: 50.99,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch(`${API_BASE_URL}${emitirRoute}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(simulatedData)
            });

            const data = await response.json();

            if (response.ok) {
                setPostStatus(`✅ POST SUCESSO! Status: ${data.status}. Dados recebidos: ${data.dados_recebidos.identificacao}`);
            } else {
                setPostStatus(`❌ POST ERRO DE API: Status ${response.status}. Mensagem: ${data.mensagem || 'Falha desconhecida.'}`);
            }

        } catch (error) {
            console.error("Erro no POST:", error);
            setPostStatus("❌ ERRO DE CONEXÃO: Falha ao enviar dados POST.");
        } finally {
            setIsPosting(false);
        }
    };


    return (
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <h1 className="text-3xl font-bold text-center sm:text-left">
                    Status da Integração Backend
                </h1>
                
                {/* 1. Status da Rota GET (/nfe/teste) */}
                <div className="p-4 rounded-lg shadow-md w-full text-center">
                    {isLoading ? (
                        <p className="text-blue-500 font-semibold">Carregando...</p>
                    ) : (
                        <p className={`text-lg font-bold ${apiStatus.startsWith('SUCESSO') ? 'text-green-600' : 'text-red-600'}`}>
                            {apiStatus}
                        </p>
                    )}
                </div>

                {/* --- SEÇÃO DE TESTE POST: EMISSÃO NFE --- */}
                <h2 className="text-2xl font-bold mt-8 text-center sm:text-left">
                    Teste de Emissão de NF-e (POST)
                </h2>
                <div className="flex flex-col gap-4 w-full">
                    
                    <button
                        onClick={sendNfeData}
                        disabled={isPosting}
                        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 transition duration-150 ease-in-out"
                    >
                        {isPosting ? 'Enviando...' : 'Enviar Dados de Emissão (POST)'}
                    </button>

                    {/* Status da Rota POST (/nfe/emitir) */}
                    <div className="p-4 rounded-lg shadow-md w-full text-center border">
                        <p className={`text-md font-medium ${postStatus.startsWith('✅') ? 'text-green-600' : postStatus.startsWith('❌') ? 'text-red-600' : 'text-gray-500'}`}>
                            {postStatus}
                        </p>
                    </div>
                </div>
                {/* -------------------------------------- */}
                
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