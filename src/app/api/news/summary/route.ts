import { NextRequest, NextResponse } from 'next/server';

function cleanJsonString(str: string) {
  let clean = str.trim();
  if (clean.startsWith('```json')) {
    clean = clean.substring(7);
  } else if (clean.startsWith('```')) {
    clean = clean.substring(3);
  }
  if (clean.endsWith('```')) {
    clean = clean.substring(0, clean.length - 3);
  }
  return clean.trim();
}

function generateMockSummary(title: string, source: string) {
  const titleLower = title.toLowerCase();
  
  const isPositive = [
    'untung', 'naik', 'tumbuh', 'cuan', 'rekor', 'ekspansi', 'akuisisi', 'dividen',
    'positif', 'laba', 'growth', 'gain', 'meningkat', 'melonjak', 'optimis', 'terdongkrak', 
    'moncer', 'melejit', 'meroket', 'melesat'
  ].some(w => titleLower.includes(w));

  const isNegative = [
    'rugi', 'turun', 'anjlok', 'lemah', 'beban', 'utang', 'negatif', 'sengketa',
    'bearish', 'drop', 'fall', 'loss', 'decline', 'menurun', 'merosot', 'tertekan', 
    'lesu', 'gugatan', 'krisis', 'pangkas', 'ambruk', 'jatuh', 'koreksi', 'memerah'
  ].some(w => titleLower.includes(w));

  const sourceName = source || 'Sumber Berita';

  if (isPositive) {
    return {
      highlight: `Kinerja Operasional & Keuangan ${sourceName} Menunjukkan Tren Positif`,
      context: `Berita utama bertajuk "${title}" dari ${sourceName} mencerminkan perkembangan bisnis positif yang berpotensi mendorong apresiasi nilai emiten atau prospek ekonomi terkait di masa depan.`,
      keyFindings: [
        "Aktivitas bisnis berjalan ekspansif dengan indikasi pertumbuhan volume penjualan atau peningkatan layanan.",
        "Efisiensi biaya operasional diproyeksikan mampu meningkatkan marjin keuntungan bersih (Net Profit Margin).",
        "Respon pelaku pasar di bursa cenderung menyambut baik sentimen ini, terlihat dari stabilitas volume transaksi.",
        "Peluang dividen atau aksi korporasi strategis lainnya dinilai tetap menarik bagi pemegang saham jangka panjang."
      ],
      takeaway: "Sentimen positif ini memperkuat basis fundamental emiten. Investor dapat memanfaatkan momentum koreksi sehat untuk melakukan akumulasi bertahap."
    };
  } else if (isNegative) {
    return {
      highlight: `Waspada Tekanan Sentimen Negatif Pada ${sourceName}`,
      context: `Kabar terkini bertajuk "${title}" menyoroti tantangan atau risiko operasional tertentu yang dihadapi oleh emiten atau sektor perekonomian terkait, memicu kehati-hatian investor.`,
      keyFindings: [
        "Adanya tekanan pada margin laba yang disebabkan oleh kenaikan beban input atau biaya logistik.",
        "Struktur permodalan atau rasio liabilitas (utang) memerlukan pengawasan lebih lanjut guna mengukur solvabilitas.",
        "Pelaku pasar merespons dengan kecenderungan wait-and-see, membatasi aliran dana masuk jangka pendek.",
        "Manajemen diharapkan segera merilis rencana mitigasi risiko atau langkah restrukturisasi untuk menjaga kinerja bisnis."
      ],
      takeaway: "Tantangan operasional ini meningkatkan profil risiko jangka pendek. Disarankan untuk wait-and-see dan menunda pembelian agresif hingga ada kejelasan pemulihan fundamental."
    };
  } else {
    return {
      highlight: `Konsolidasi Sentimen & Prospek Netral dari ${sourceName}`,
      context: `Informasi "${title}" yang dilansir oleh ${sourceName} menunjukkan pergerakan yang cenderung stabil dan berimbang, tanpa katalis penggerak harga ekstrem untuk saat ini.`,
      keyFindings: [
        "Emiten berada dalam fase konsolidasi bisnis sehat, menyeimbangkan ekspansi dengan pengelolaan risiko internal.",
        "Rasio valuasi harga saham (P/E dan PBV) saat ini diperdagangkan dalam area rata-rata historisnya.",
        "Aliran dana transaksi bandar maupun pelaku pasar asing terpantau seimbang tanpa akumulasi dominan.",
        "Pasar sedang menanti rilis data laporan keuangan kuartalan berikutnya sebagai penentu arah tren baru."
      ],
      takeaway: "Ketiadaan katalis utama mengindikasikan harga akan bergerak menyamping (sideways). Strategi swing trading jangka pendek pada area support-resistance dapat dipertimbangkan."
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, source } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const openAIKey = process.env.OPENAI_API_KEY;

    if (!geminiKey && !openAIKey) {
      const mockData = generateMockSummary(title, source);
      return NextResponse.json({ ...mockData, isMock: true });
    }

    const prompt = `Anda adalah analis finansial profesional. Analisislah berita/artikel berikut ini:
Judul: "${title}"
Sumber: "${source}"

Berikan ringkasan analisis dalam Bahasa Indonesia. Output Anda HARUS berupa objek JSON dengan format persis seperti di bawah ini dan tidak ada penjelasan/teks lain di luar JSON tersebut:
{
  "highlight": "Highlight Utama (1 kalimat ringkas, padat, dan tebal, e.g., 'Kinerja Keuangan Kuartalan Meningkat')",
  "context": "Konteks Singkat (2-3 kalimat menjelaskan detail berita tersebut secara kronologis/kontekstual)",
  "keyFindings": [
    "Poin temuan kunci 1 (singkat, berupa kalimat data bernomor)",
    "Poin temuan kunci 2 (singkat, berupa kalimat data bernomor)",
    "Poin temuan kunci 3 (singkat, berupa kalimat data bernomor)",
    "Poin temuan kunci 4 (opsional, jika ada temuan kunci tambahan)"
  ],
  "takeaway": "Kesimpulan Inti / Key Takeaway (1-2 kalimat kesimpulan mendalam bagi investor)"
}
Pastikan data valid dan format JSON valid.`;

    if (geminiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }],
              generationConfig: {
                responseMimeType: "application/json"
              }
            }),
            cache: 'no-store'
          }
        );

        if (response.ok) {
          const data = await response.json();
          const textResult = data.contents?.[0]?.parts?.[0]?.text;
          if (textResult) {
            const cleanText = cleanJsonString(textResult);
            const parsed = JSON.parse(cleanText);
            return NextResponse.json({ ...parsed, isAI: true });
          }
        }
        throw new Error(`Gemini response not ok: ${response.status}`);
      } catch (geminiErr: any) {
        console.error('Gemini summary failed, checking OpenAI:', geminiErr.message);
      }
    }

    if (openAIKey) {
      try {
        const response = await fetch(
          'https://api.openai.com/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openAIKey}`
            },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.5,
              response_format: { type: "json_object" }
            }),
            cache: 'no-store'
          }
        );

        if (response.ok) {
          const data = await response.json();
          const textResult = data.choices?.[0]?.message?.content;
          if (textResult) {
            const cleanText = cleanJsonString(textResult);
            const parsed = JSON.parse(cleanText);
            return NextResponse.json({ ...parsed, isAI: true });
          }
        }
        throw new Error(`OpenAI response not ok: ${response.status}`);
      } catch (openaiErr: any) {
        console.error('OpenAI summary failed:', openaiErr.message);
      }
    }

    const mockData = generateMockSummary(title, source);
    return NextResponse.json({ ...mockData, isMock: true });

  } catch (error: any) {
    console.error('Error generating AI news summary:', error.message);
    return NextResponse.json({
      error: 'Failed to generate summary',
      details: error.message
    }, { status: 500 });
  }
}
