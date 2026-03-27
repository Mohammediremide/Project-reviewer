export async function analyzeProject(projectUrl: string, repoUrl?: string) {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 2000))

  const score = (Math.random() * 1.5 + 3.4).toFixed(1) // 3.4 to 4.9
  
  const reviews = [
    "The codebase demonstrates a sophisticated understanding of modern design patterns. The implementation of state management is particularly clean, showing a disciplined approach to data flow.",
    "This project stands out for its modular architecture and clear separation of concerns. The use of hooks and functional components is exemplary, making the code highly readable and maintainable.",
    "A solid foundation with impressive performance optimizations. The project handles complex interactions with grace, though there's slight room for refinement in certain utility functions."
  ]

  const amendsList = [
    [
      "Refactor the authentication logic into a custom hook for better reusability across components.",
      "Add global error boundary to catch and handle unexpected runtime exceptions.",
      "Enhance the CI/CD pipeline with automated unit testing for the core data transformations."
    ],
    [
      "Optimize heavy image assets to improve Initial Page Load time on mobile devices.",
      "Consider using a dedicated style system like CSS Modules for better encapsulation in the UI layer.",
      "Standardize the naming convention for API response models to improve developer experience."
    ],
    [
      "Implement memoization for expensive calculations in the dashboard components.",
      "Strengthen the validation logic for user-provided URLs in the import flow.",
      "Documentation is sparse in the service layer; adding JSDoc comments would benefit future maintainers."
    ]
  ]

  const idx = Math.floor(Math.random() * reviews.length)
  
  return {
    score: parseFloat(score),
    reviewText: reviews[idx],
    amends: amendsList[idx].map((a, i) => `${i+1}. ${a}`).join('\n')
  }
}
