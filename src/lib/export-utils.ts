import type { Conversation, ChatMessage } from './types'

/**
 * Export conversation as plain text
 */
export function exportAsText(conversation: Conversation): string {
  const lines: string[] = []
  
  lines.push(`Conversation: ${conversation.title}`)
  lines.push(`Created: ${new Date(conversation.createdAt).toLocaleString()}`)
  lines.push(`Updated: ${new Date(conversation.updatedAt).toLocaleString()}`)
  lines.push('=' .repeat(60))
  lines.push('')
  
  conversation.messages.forEach((message) => {
    const role = message.role === 'user' ? 'You' : 'PrisimAI'
    const time = new Date(message.timestamp).toLocaleTimeString()
    lines.push(`[${time}] ${role}:`)
    lines.push(message.content)
    lines.push('')
  })
  
  return lines.join('\n')
}

/**
 * Export conversation as markdown
 */
export function exportAsMarkdown(conversation: Conversation): string {
  const lines: string[] = []
  
  lines.push(`# ${conversation.title}`)
  lines.push('')
  lines.push(`**Created:** ${new Date(conversation.createdAt).toLocaleString()}`)
  lines.push(`**Updated:** ${new Date(conversation.updatedAt).toLocaleString()}`)
  lines.push('')
  lines.push('---')
  lines.push('')
  
  conversation.messages.forEach((message) => {
    const role = message.role === 'user' ? '👤 **You**' : '🤖 **PrisimAI**'
    const time = new Date(message.timestamp).toLocaleTimeString()
    lines.push(`### ${role} _(${time})_`)
    lines.push('')
    lines.push(message.content)
    lines.push('')
  })
  
  return lines.join('\n')
}

/**
 * Export conversation as JSON
 */
export function exportAsJSON(conversation: Conversation): string {
  return JSON.stringify(conversation, null, 2)
}

/**
 * Download file with given content
 */
export function downloadFile(filename: string, content: string, type: string = 'text/plain') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Get conversation statistics
 */
export function getConversationStats(conversation: Conversation) {
  const messageCount = conversation.messages.length
  const userMessageCount = conversation.messages.filter(m => m.role === 'user').length
  const assistantMessageCount = conversation.messages.filter(m => m.role === 'assistant').length
  
  const totalWords = conversation.messages.reduce((count, message) => {
    return count + message.content.split(/\s+/).filter(Boolean).length
  }, 0)
  
  const totalChars = conversation.messages.reduce((count, message) => {
    return count + message.content.length
  }, 0)
  
  return {
    messageCount,
    userMessageCount,
    assistantMessageCount,
    totalWords,
    totalChars,
  }
}
