export async function analyzeProject(projectUrl: string, repoUrl?: string) {
  // Simulate network delay for neural analysis effect
  await new Promise(r => setTimeout(r, 2000))

  const projectIdentifier = (repoUrl || projectUrl).toLowerCase()
  const score = (Math.random() * 1.5 + 3.4).toFixed(1)

  // Domain-specific review logic
  const categories = [
    { 
      keywords: ['shop', 'store', 'cart', 'ecom', 'commerce', 'market'], 
      type: 'E-commerce Engine',
      review: "Strong commercial structure. The transaction components show high resilience, though the cart state persistence could be more robust for mobile users.",
      amends: [
        "Optimize payment gateway latency for faster checkouts.",
        "Implement a 'saved-for-later' feature to reduce abandoned cart rates.",
        "Audit heavy product images for improved LCP (Largest Contentful Paint)."
      ]
    },
    { 
      keywords: ['blog', 'news', 'article', 'post', 'next-blog'], 
      type: 'Content Delivery Core',
      review: "Excellent SEO optimization and heading hierarchy. The readability score is high, making it perfect for long-form content architecture.",
      amends: [
        "Implement Incremental Static Regeneration (ISR) to speed up new post deployments.",
        "Add a progress indicator for long-form articles to improve engagement metrics.",
        "Refine the typography system for better contrast ratios in dark mode."
      ]
    },
    { 
      keywords: ['portfolio', 'resume', 'me', 'personal'], 
      type: 'Identity Portal',
      review: "Visual storytelling is top-tier. The motion design is smooth and reflects a high level of polished front-end engineering.",
      amends: [
        "Add a direct PDF download link for your technical resume.",
        "Ensure all project links open in new tabs to keep users within your loop.",
        "Improve accessibility (A11y) for the custom-designed navigation menu."
      ]
    },
    { 
      keywords: ['dashboard', 'saas', 'crm', 'tool', 'admin'], 
      type: 'Enterprise Logic Hub',
      review: "Great data visualization and table layouts. The architectural separation of client-side and server-side components is well-handled.",
      amends: [
        "Implement server-side pagination for larger data sets to avoid browser memory leaks.",
        "Standardize the export functionality to support CSV and PDF streams.",
        "Add multi-level role-based access control (RBAC) to the core user model."
      ]
    }
  ]

  // Default Review if no keywords match
  let result = {
    type: 'Generic Neural Node',
    review: "The codebase demonstrates clean module architecture and solid understanding of modern design patterns. Functional components are well-isolated.",
    amends: [
      "Refactor core authentication logic into a reusable custom hook.",
      "Add global error boundary to handle unexpected runtime exceptions.",
      "Strengthen data validation logic for user-provided input streams."
    ]
  }

  // Check for specialized category
  for (const cat of categories) {
    if (cat.keywords.some(k => projectIdentifier.includes(k))) {
      result = cat
      break
    }
  }

  return {
    score: parseFloat(score),
    reviewText: `[Target: ${result.type}] ${result.review}`,
    amends: result.amends.map((a, i) => `${i+1}. ${a}`).join('\n')
  }
}
