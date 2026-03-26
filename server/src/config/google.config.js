const config = {
  googleApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY || '',
  model: process.env.GOOGLE_MODEL || 'gemini-1.5-flash',
}
export { config }
