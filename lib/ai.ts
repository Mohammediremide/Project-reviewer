export async function analyzeProject(projectUrl: string, repoUrl?: string) {
  const apiKey = process.env.GROQ_API_KEY;

  if (apiKey) {
    console.log("Initiating Groq AI Audit [Key Detected]...");
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [{
            role: "system",
            content: "You are a world-class Lead Architect. Provide extremely detailed, expansive technical audits. Always respond in valid JSON format."
          }, {
            role: "user",
            content: `Perform a deep technical audit on this project: 
                     Website: ${projectUrl} 
                     Github: ${repoUrl || 'Not Provided'}

                     Return JSON with:
                     - score: a float (3.5 - 5.0)
                     - review: an expansive 4-sentence technical architecture audit detailing strengths and structural concerns.
                     - amends: array of exactly 3 highly detailed, expansive improvement suggestions. Each suggestion must include the 'what', 'why' and specifically 'how' it should be refactored.`
          }],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      
      if (data.error) {
        console.error("Groq API Error Detail:", data.error.message);
        throw new Error(data.error.message);
      }

      const aiResult = JSON.parse(data.choices[0].message.content);

      return {
        score: aiResult.score,
        reviewText: `${aiResult.review}`,
        amends: aiResult.amends.join('\n\n')
      };
    } catch (error) {
      console.error("Groq Connection Failure:", error);
    }
  } else {
    console.warn("GROQ_API_KEY Missing. Reverting to static fallback logic.");
  }

  // FALLBACK LOGIC
  const projectIdentifier = (repoUrl || projectUrl).toLowerCase();
  const score = (Math.random() * 1.5 + 3.4).toFixed(1);
  const categories = [
    { keywords: ['shop', 'store'], type: 'E-commerce', review: "Strong commercial structure. transaction components show high resilience.", amends: ["Optimize payment latency.", "Add saved-for-later feature."] },
    { keywords: ['blog', 'article'], type: 'Content', review: "Excellent SEO and heading hierarchy. Readability score is high.", amends: ["Implement ISR for speed.", "Add reading progress bar."] },
    { keywords: ['portfolio', 'resume'], type: 'Identity', review: "Visual storytelling is top-tier. Motion design is smooth.", amends: ["Add PDF Resume link.", "Check external links."] },
    { keywords: ['dashboard', 'saas'], type: 'Enterprise', review: "Great visualization and table layouts. Solid server-side separation.", amends: ["Implement pagination.", "Standardize CSV exports."] }
  ];

  let result = { type: 'Neural Node', review: "Clean module architecture and solid understanding of patterns.", amends: ["Refactor logic into hooks.", "Add error boundaries."] };
  for (const cat of categories) { if (cat.keywords.some(k => projectIdentifier.includes(k))) { result = cat; break; } }

  return {
    score: parseFloat(score),
    reviewText: `[STATIC FALLBACK] ${result.review}`,
    amends: result.amends.map((a, i) => `${i+1}. ${a}`).join('\n')
  };
}
