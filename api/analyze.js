export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { images, doorDir, roomType, goal } = req.body

  if (!images?.length || !doorDir || !roomType || !goal) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  let response
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `You are a feng shui master. Analyze room photos and respond ONLY in valid JSON:
{"overallScore":number,"energyFlow":"Good|Moderate|Blocked","commanding_position":"Yes|No|Partial",
"summary":"2-3 sentences","issues":[{"severity":"critical|moderate|minor","title":"string",
"description":"string","fix":"string"}],"priorityActions":["string","string","string"],
"elementBalance":{"Wood":number,"Fire":number,"Earth":number,"Metal":number,"Water":number}}`,
        messages: [{
          role: 'user',
          content: [
            ...images.map((img) => ({ type: 'image', source: { type: 'base64', media_type: img.mediaType, data: img.base64 } })),
            { type: 'text', text: `Analyze this ${roomType}. Door faces ${doorDir}. Goal: ${goal}. JSON only.` },
          ],
        }],
      }),
    })
  } catch {
    return res.status(502).json({ error: 'Network error reaching Anthropic API' })
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    if (response.status === 429) return res.status(429).json({ error: 'Rate limited — wait a moment and retry.' })
    if (response.status === 413) return res.status(413).json({ error: 'Images too large — try fewer or smaller photos.' })
    return res.status(response.status).json({ error: errData?.error?.message || `API error ${response.status}` })
  }

  const data = await response.json()
  if (!data.content?.length) return res.status(502).json({ error: 'Empty response from API' })

  const text = data.content.map((c) => c.text || '').join('').trim()
  const clean = text.replace(/```json|```/g, '').trim()

  let parsed
  try { parsed = JSON.parse(clean) } catch { return res.status(502).json({ error: 'Could not parse response — try again.' }) }

  if (typeof parsed.overallScore !== 'number') return res.status(502).json({ error: 'Malformed response — try again.' })

  return res.status(200).json(parsed)
}
