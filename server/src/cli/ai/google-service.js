import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText, generateText } from 'ai'
import { config } from '../../config/google.config.js'
import chalk from 'chalk'

export class AIService {
  constructor() {
    if (!config.googleApiKey) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is missing. Please set it in your .env file.')
    }

    const google = createGoogleGenerativeAI({
      apiKey: config.googleApiKey,
    })
    this.model = google(config.model)
  }

  //  Send a message and get streaming response
  async sendMessage(messages, onChunk, tools = undefined, onToolCall = null) {
    try {
      const streamConfig = {
        model: this.model,
        messages: messages,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
      }

      // Add tools if provided with maxSteps for multi-step tool calling
      if (tools && Object.keys(tools).length > 0) {
        streamConfig.tools = tools
        streamConfig.maxSteps = 5 // Allow up to 5 tool call steps

        console.log(chalk.gray(`[DEBUG] Tools enabled: ${Object.keys(tools).join(', ')}`))
      }

      const result = streamText(streamConfig)

      let fullResponse = ''

      // Stream text chunks
      for await (const chunk of result.textStream) {
        fullResponse += chunk
        if (onChunk) {
          onChunk(chunk)
        }
      }

      // IMPORTANT: Await the result to get access to steps, toolCalls, etc.
      const fullResult = await result

      const toolCalls = []
      const toolResults = []

      // Collect tool calls from all steps (if they exist)
      if (fullResult.steps && Array.isArray(fullResult.steps)) {
        for (const step of fullResult.steps) {
          if (step.toolCalls && step.toolCalls.length > 0) {
            for (const toolCall of step.toolCalls) {
              toolCalls.push(toolCall)
              if (onToolCall) {
                onToolCall(toolCall)
              }
            }
          }

          // Collect tool results
          if (step.toolResults && step.toolResults.length > 0) {
            toolResults.push(...step.toolResults)
          }
        }
      }

      return {
        content: fullResponse,
        finishReason: fullResult.finishReason,
        usage: fullResult.usage,
        toolCalls,
        toolResults,
        steps: fullResult.steps,
      }
    } catch (error) {
      console.error(chalk.red('AI Service Error:'), error.message)
      console.error(chalk.red('Full error:'), error)
      throw error
    }
  }

  //  Get a non-streaming response
  async getMessage(messages, tools = undefined) {
    let fullResponse = ''
    const result = await this.sendMessage(
      messages,
      (chunk) => {
        fullResponse += chunk
      },
      tools
    )
    return result.content
  }

  // Generate structured output using a Zod schema
  async generateStructured(schema, prompt) {
    try {
      const result = await generateText({
        model: this.model,
        tools: {
          output: {
            description: 'Structured output container',
            parameters: schema,
          },
        },
        toolChoice: 'required',
        prompt: prompt,
      })

      return result.toolCalls[0].args
    } catch (error) {
      console.error(chalk.red('AI Structured Generation Error:'), error.message)
      throw error
    }
  }
}
