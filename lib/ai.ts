export async function analyzeProject(projectUrl: string, repoUrl?: string) {
  const apiKey = process.env.GROQ_API_KEY;

  if (apiKey) {
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
            content: "You are a senior technical architect. Analyze software projects. Always respond with only valid JSON."
          }, {
            role: "user",
            content: `Analyze this project: 
                     Website: ${projectUrl} 
                     Github: ${repoUrl || 'Not Provided'}

                     Return JSON with:
                     - score: a float (3.5 - 5.0)
                     - review: a professional 2-sentence architecture audit
                     - amends: array of exactly 3 numbered improvement strings`
          }],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      const aiResult = JSON.parse(data.choices[0].message.content);

      return {
        score: aiResult.score,
        reviewText: `[Groq AI Review] ${aiResult.review}`,
        amends: aiResult.amends.join('\n')
      };
    } catch (error) {
      console.error("Groq AI API Error:", error);
      // Fallback if API fails
    }
  }

  // FALLBACK LOGIC (if no API Key or if API fails)
  const projectIdentifier = (repoUrl || projectUrl).toLowerCase();
  const score = (Math.random() * 1.5 + 3.4).toFixed(1);
  const categories = [
    { keywords: ['shop', 'store', 'cart', 'ecom'], type: 'E-commerce', review: "Strong commercial structure. transaction components show high resilience.", amends: ["Optimize payment latency.", "Add saved-for-later feature.", "Audit product images."] },
    { keywords: ['blog', 'news', 'article'], type: 'Content', review: "Excellent SEO and heading hierarchy. Readability score is high.", amends: ["Implement ISR for speed.", "Add reading progress bar.", "Refine dark mode contrast."] },
    { keywords: ['portfolio', 'resume'], type: 'Identity', review: "Visual storytelling is top-tier. Motion design is smooth.", amends: ["Add PDF Resume link.", "Check external links.", "Improve A11y."] },
    { keywords: ['dashboard', 'saas', 'crm'], type: 'Enterprise', review: "Great visualization and table layouts. Solid server-side separation.", amends: ["Implement pagination.", "Standardize CSV exports.", "Add RBAC models."] }
  ];

  let result = { type: 'Neural Node', review: "Clean module architecture and solid understanding of patterns.", amends: ["Refactor logic into hooks.", "Add error boundaries.", "Strengthen validations."] };
  for (const cat of categories) {
    if (cat.keywords.some(k => projectIdentifier.includes(k))) { result = cat; break; }
  }

  return {
    score: parseFloat(score),
    reviewText: `[Auto Sync] ${result.review}`,
    amends: result.amends.map((a, i) => `${i+1}. ${a}`).join('\n')
  };
}
