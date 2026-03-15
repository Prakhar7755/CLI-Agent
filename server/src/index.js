import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node'
import { auth } from './lib/auth.js'

dotenv.config({ debug: true, override: true, path: '.env' })

const app = express()

// Configure CORS middleware
app.use(
  cors({
    origin: 'http://localhost:3000', // Replace with your frontend's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
)

// app.all('/api/auth/{*any}', toNodeHandler(auth))
app.all('/api/auth/*splat', toNodeHandler(auth)) // For ExpressJS v5
const PORT = process.env.PORT || 3005

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello from the server!')
})

app.get('/api/me', async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  })
  return res.json(session)
})

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`)
})
