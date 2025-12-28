# TicketSmith

**TicketSmith** is an AI-powered web application that converts unstructured text (problem statements, chat logs, bug reports) into well-structured, professional Jira tickets. Built with Next.js and supporting multiple AI providers.

## 🚀 Features

- **AI-Powered Ticket Generation**: Automatically generates structured Jira tickets from unstructured input
- **Multiple AI Providers**: Switch between OpenRouter (free models) and Google Gemini
- **Customizable Sections**: Choose which ticket sections to include (Summary, Description, Scope, Acceptance Criteria, etc.)
- **Multiple Ticket Types**: Support for Bug, Task, and Story ticket types
- **Real-time Preview**: See your generated ticket before copying
- **Copy to Clipboard**: Easy one-click copying of individual sections or full ticket
- **Rate Limiting**: Built-in rate limiting for API protection
- **Security**: Input validation, sanitization, and security headers
- **Responsive Design**: Modern, clean UI that works on all devices

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Providers**:
  - OpenRouter (free models: Qwen, Llama, etc.)
  - Google Gemini 3 Flash Preview
- **Package Manager**: Yarn

## 📋 Prerequisites

- Node.js 18+
- Yarn package manager
- API keys for your chosen AI provider:
  - OpenRouter API key: [Get one here](https://openrouter.ai/keys)
  - Google Gemini API key: [Get one here](https://aistudio.google.com/app/apikey)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TicketSmith
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   # Provider Selection
   DEFAULT_PROVIDER=openrouter

   # OpenRouter Configuration
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   OPENROUTER_PRIMARY_MODEL=qwen/qwen-2.5-7b-instruct
   OPENROUTER_FALLBACK_MODEL=meta-llama/llama-3.2-3b-instruct
   OPENROUTER_TEMPERATURE=0.3
   OPENROUTER_MAX_RETRIES=1
   OPENROUTER_MAX_TOKENS=2500
   OPENROUTER_API_TIMEOUT=30000

   # Google Gemini Configuration
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3-flash-preview
   GEMINI_TEMPERATURE=0.3
   GEMINI_MAX_RETRIES=1
   GEMINI_MAX_TOKENS=1500
   GEMINI_API_TIMEOUT=30000
   ```

4. **Run the development server**
   ```bash
   yarn dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration

### Provider Selection

Set the `DEFAULT_PROVIDER` environment variable to choose your AI provider:

- `openrouter` - Uses OpenRouter with free models (default)
- `gemini` - Uses Google Gemini API

### OpenRouter Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | Required |
| `OPENROUTER_PRIMARY_MODEL` | Primary model to use | `qwen/qwen-2.5-7b-instruct` |
| `OPENROUTER_FALLBACK_MODEL` | Fallback model if primary fails | `meta-llama/llama-3.2-3b-instruct` |
| `OPENROUTER_TEMPERATURE` | Temperature (0.0-2.0) | `0.3` |
| `OPENROUTER_MAX_RETRIES` | Maximum retry attempts | `1` |
| `OPENROUTER_MAX_TOKENS` | Maximum response tokens | `2500` |
| `OPENROUTER_API_TIMEOUT` | API timeout in milliseconds | `30000` |

**Recommended Free Models on OpenRouter:**
- `qwen/qwen-2.5-7b-instruct` - Good quality, fast
- `meta-llama/llama-3.2-3b-instruct` - Very fast, smaller
- `mistralai/mistral-7b-instruct-v0.2` - Balanced performance

### Gemini Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_GEMINI_API_KEY` | Your Google Gemini API key | Required |
| `GEMINI_MODEL` | Gemini model to use | `gemini-3-flash-preview` |
| `GEMINI_TEMPERATURE` | Temperature (0.0-2.0) | `0.3` |
| `GEMINI_MAX_RETRIES` | Maximum retry attempts | `1` |
| `GEMINI_MAX_TOKENS` | Maximum response tokens | `1500` |
| `GEMINI_API_TIMEOUT` | API timeout in milliseconds | `30000` |

**Available Gemini Models:**
- `gemini-3-flash-preview` - Latest, fast preview model
- `gemini-1.5-flash` - Fast and efficient
- `gemini-1.5-pro` - More capable, slower

## 📖 Usage

### Web Interface

1. **Enter Input Text**: Paste your problem statement, chat logs, or bug report in the input field (minimum 10 characters)

2. **Select Ticket Type**: Choose from Bug, Task, or Story

3. **Choose Sections**: Select which sections you want in your ticket:
   - Summary
   - Type
   - Description
   - Scope
   - Acceptance Criteria
   - Expected Outcome
   - Risks
   - Dependencies
   - Validation Plan

4. **Generate Ticket**: Click "Generate Ticket" and wait for the AI to create your structured ticket

5. **Review & Copy**: Review the generated ticket in the preview panel and copy individual sections or the full ticket

### API Usage

#### Endpoint

```
POST /api/generate-ticket
```

#### Request Body

```json
{
  "input": "The getFare API is timing out for Nagpur Metro in staging",
  "ticketType": "Bug",
  "sections": [
    "Summary",
    "Type",
    "Description",
    "Scope",
    "Acceptance Criteria",
    "Expected Outcome"
  ]
}
```

#### Response

```json
{
  "ticket": {
    "summary": "Investigate and Fix getFare API Timeout Issue for Nagpur Metro (Staging)",
    "type": "Bug",
    "description": "The getFare API is intermittently timing out...",
    "scope": [
      "Analyze getFare API performance in Nagpur Metro staging",
      "Identify root cause of timeouts"
    ],
    "acceptance_criteria": [
      "getFare API responds within acceptable time limits on staging",
      "No timeout errors observed during repeated test runs"
    ],
    "expected_outcome": [
      "Stable and reliable getFare API for Nagpur Metro on staging",
      "Improved performance and resilience of fare calculation flow"
    ]
  }
}
```

#### Error Responses

- `400` - Bad Request (invalid input, missing fields)
- `408` - Request Timeout
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## 📁 Project Structure

```
TicketSmith/
├── app/
│   ├── api/
│   │   └── generate-ticket/
│   │       └── route.ts          # API route handler
│   ├── globals.css               # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main page component
├── components/
│   ├── InputPanel.tsx            # Input form component
│   ├── PreviewPanel.tsx          # Ticket preview component
│   ├── SectionSelector.tsx      # Section selection component
│   ├── TicketSection.tsx          # Individual ticket section component
│   └── ui/                        # Reusable UI components
│       ├── button.tsx
│       ├── checkbox.tsx
│       ├── label.tsx
│       ├── select.tsx
│       └── textarea.tsx
├── lib/
│   ├── gemini.ts                 # Gemini API integration
│   ├── openrouter.ts             # OpenRouter API integration
│   ├── promptBuilder.ts           # Prompt construction
│   ├── rateLimit.ts              # Rate limiting logic
│   ├── schemaBuilder.ts         # JSON schema builder
│   ├── security.ts               # Security utilities
│   ├── types.ts                  # TypeScript type definitions
│   └── utils.ts                  # Utility functions
├── .env.local                    # Environment variables (create this)
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies
├── tailwind.config.ts           # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

## 🔒 Security Features

- **Input Validation**: Validates all user inputs before processing
- **Input Sanitization**: Sanitizes inputs to prevent injection attacks
- **Rate Limiting**: 10 requests per minute per client
- **Request Size Limits**: Prevents oversized requests
- **Security Headers**: CORS, XSS protection, and other security headers
- **Error Handling**: Secure error messages that don't expose internal details

## 🚦 Rate Limiting

The API implements rate limiting:
- **Limit**: 10 requests per window
- **Window**: 60 seconds (1 minute)
- **Headers**: Rate limit information is included in response headers:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`
  - `Retry-After`

## 🧪 Development

### Running in Development Mode

```bash
yarn dev
```

### Building for Production

```bash
yarn build
```

### Starting Production Server

```bash
yarn start
```

### Linting

```bash
yarn lint
```

## 📝 Available Ticket Sections

- **Summary**: Brief title of the ticket
- **Type**: Ticket type (Bug, Task, Story)
- **Description**: Detailed description of the issue or requirement
- **Scope**: List of items, systems, or components affected
- **Acceptance Criteria**: Testable conditions that must be met
- **Expected Outcome**: Desired end state and benefits
- **Risks**: Potential risks and mitigation strategies
- **Dependencies**: External dependencies or blockers
- **Validation Plan**: Steps to validate the solution

## 🎯 Best Practices

1. **Input Quality**: Provide detailed, specific input text for better results
2. **Section Selection**: Only select sections you actually need
3. **Model Selection**: Use free models for testing, paid models for production
4. **Token Limits**: Adjust `MAX_TOKENS` based on your needs (lower = faster, higher = more detailed)
5. **Temperature**: Lower temperature (0.1-0.3) for consistent, focused output. Higher (0.7-1.0) for more creative responses

## 🐛 Troubleshooting

### API Key Errors

- **"OPENROUTER_API_KEY is not set"**: Make sure your `.env.local` file has the correct API key
- **"GOOGLE_GEMINI_API_KEY is not set"**: Ensure Gemini API key is set if using Gemini provider

### Model Errors

- **Model not found**: Check that the model name is correct and available on the provider
- **Rate limit exceeded**: Wait a minute or reduce request frequency

### Response Issues

- **Timeout errors**: Increase `API_TIMEOUT` in environment variables
- **Invalid JSON**: The AI may occasionally return malformed JSON. The system will retry automatically
- **Empty responses**: Check your API keys and model availability

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For issues or suggestions, please contact the project maintainers.

## 📞 Support

For support, please open an issue or contact the development team.

---

**Built with ❤️ using Next.js and AI**
