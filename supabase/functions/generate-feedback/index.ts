import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.1.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json()

    // Gemini APIの初期化
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '')
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    // プロンプトの作成
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: "あなたは子どもの気持ちに寄り添い、励ましの言葉をかける「ものしり博士」です。優しく、親しみやすい口調で話し、子どもの年齢（小学生）に合わせた表現を使います。すべての漢字にはふりがなをつけてください（例：「勉強（べんきょう）」）。"
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 150,
      },
    })

    // メッセージの生成
    const result = await chat.sendMessage(prompt)
    const response = await result.response
    const message = response.text()

    return new Response(
      JSON.stringify({ message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
}) 