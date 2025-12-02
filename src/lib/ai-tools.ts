import type { Tool } from './pollinations-api'

// Safe math expression evaluator without using eval or Function()
function safeMathEvaluate(expression: string): number {
  // Remove all whitespace
  const cleaned = expression.replace(/\s+/g, '')
  
  // Validate the expression contains only allowed characters
  if (!/^[0-9+\-*/().]+$/.test(cleaned)) {
    throw new Error('Invalid characters in expression. Only numbers and basic operators (+, -, *, /, parentheses) are allowed.')
  }
  
  // Tokenize the expression
  const tokens = tokenize(cleaned)
  
  // Parse and evaluate using recursive descent parser
  let pos = 0
  
  function peek(): string | null {
    return pos < tokens.length ? tokens[pos] : null
  }
  
  function consume(): string {
    return tokens[pos++]
  }
  
  function parseNumber(): number {
    const token = consume()
    const num = parseFloat(token)
    if (isNaN(num)) {
      throw new Error(`Expected number but got: ${token}`)
    }
    return num
  }
  
  function parseFactor(): number {
    const token = peek()
    
    if (token === '(') {
      consume() // consume '('
      const result = parseExpression()
      if (peek() !== ')') {
        throw new Error('Missing closing parenthesis')
      }
      consume() // consume ')'
      return result
    }
    
    // Handle negative numbers
    if (token === '-') {
      consume()
      return -parseFactor()
    }
    
    return parseNumber()
  }
  
  function parseTerm(): number {
    let left = parseFactor()
    
    while (peek() === '*' || peek() === '/') {
      const op = consume()
      const right = parseFactor()
      if (op === '*') {
        left = left * right
      } else {
        if (right === 0) {
          throw new Error('Division by zero')
        }
        left = left / right
      }
    }
    
    return left
  }
  
  function parseExpression(): number {
    let left = parseTerm()
    
    while (peek() === '+' || peek() === '-') {
      const op = consume()
      const right = parseTerm()
      if (op === '+') {
        left = left + right
      } else {
        left = left - right
      }
    }
    
    return left
  }
  
  const result = parseExpression()
  
  if (pos < tokens.length) {
    throw new Error(`Unexpected token: ${tokens[pos]}`)
  }
  
  return result
}

function tokenize(expression: string): string[] {
  const tokens: string[] = []
  let i = 0
  
  while (i < expression.length) {
    const char = expression[i]
    
    if ('+-*/()'.includes(char)) {
      tokens.push(char)
      i++
    } else if (/[0-9.]/.test(char)) {
      // Parse number (including decimals)
      let num = ''
      while (i < expression.length && /[0-9.]/.test(expression[i])) {
        num += expression[i]
        i++
      }
      tokens.push(num)
    } else {
      i++
    }
  }
  
  return tokens
}

export const AI_TOOLS: Tool[] = [
  {
    type: 'function',
    function: {
      name: 'get_current_time',
      description: 'Get the current time and date',
      parameters: {
        type: 'object',
        properties: {
          timezone: {
            type: 'string',
            description: 'The timezone to get the time for (e.g., "America/New_York", "UTC")',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate',
      description: 'Perform mathematical calculations',
      parameters: {
        type: 'object',
        properties: {
          expression: {
            type: 'string',
            description: 'The mathematical expression to evaluate (e.g., "2 + 2", "sqrt(16)")',
          },
        },
        required: ['expression'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_web',
      description: 'Search the web for information',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_code',
      description: 'Generate code in a specific programming language',
      parameters: {
        type: 'object',
        properties: {
          language: {
            type: 'string',
            description: 'The programming language (e.g., "python", "javascript", "java")',
          },
          description: {
            type: 'string',
            description: 'Description of what the code should do',
          },
        },
        required: ['language', 'description'],
      },
    },
  },
]

// Tool execution functions (simulated for now)
export function executeToolCall(toolName: string, args: Record<string, unknown>): string {
  switch (toolName) {
    case 'get_current_time': {
      const timezone = (args.timezone as string) || 'UTC'
      const date = new Date()
      return `Current time in ${timezone}: ${date.toLocaleString('en-US', { timeZone: timezone })}`
    }
    
    case 'calculate': {
      try {
        // Safe math evaluation using a parser approach instead of eval/Function
        const result = safeMathEvaluate(args.expression as string)
        return `Result: ${result}`
      } catch (error) {
        return `Error calculating: ${error instanceof Error ? error.message : String(error)}`
      }
    }
    
    case 'search_web':
      // Simulated - in a real app, this would call a search API
      return `Search results for "${args.query as string}": [This is a simulated search result. In a production app, this would call a real search API.]`
    
    case 'generate_code':
      // Simulated - the AI itself would generate this
      return `Code generation request received for ${args.language as string}: ${args.description as string}`
    
    default:
      return `Unknown tool: ${toolName}`
  }
}
