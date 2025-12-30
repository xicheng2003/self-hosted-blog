import { visit } from 'unist-util-visit'

export function remarkMediaCard() {
  return (tree: any) => {
    visit(tree, 'blockquote', (node: any) => {
      // Helper to extract text from a node recursively
      const extractText = (n: any): string => {
        if (n.type === 'text') return n.value
        if (n.type === 'break') return '\n'
        if (n.type === 'paragraph') {
            return n.children.map(extractText).join('') + '\n'
        }
        if (n.children) {
            return n.children.map(extractText).join('')
        }
        return ''
      }

      // Get full text content of the blockquote
      const fullText = node.children.map(extractText).join('').trim()
      
      // Check if it matches our pattern
      // Allow spaces and case-insensitive match
      const match = fullText.match(/^\s*\[!\s*(BOOK|MOVIE|MUSIC|GAME|TV)\s*\]\s*(.*)/i)
      
      if (match) {
        const type = match[1].toUpperCase()
        
        // Split by newline to handle lines
        // Don't filter empty lines to preserve paragraph breaks
        const lines = fullText.split('\n').map((l: string) => l.trim())
        
        // First line contains type and title
        const firstLine = lines[0]
        const titleMatch = firstLine.match(/^\s*\[!\s*(BOOK|MOVIE|MUSIC|GAME|TV)\s*\]\s*(.*)/i)
        const title = titleMatch ? titleMatch[2] : ''
        
        let cover = ''
        let rating = 0
        let comment = ''
        let author = ''
        let status = ''
        let currentField = ''
        
        // Parse remaining lines
        lines.slice(1).forEach((line: string) => {
            const lower = line.toLowerCase()
            
            if (lower.startsWith('cover:')) {
                currentField = 'cover'
                cover = line.substring(6).trim()
            } else if (lower.startsWith('rating:')) {
                currentField = 'rating'
                rating = parseFloat(line.substring(7).trim())
            } else if (lower.startsWith('author:') || lower.startsWith('作者:')) {
                currentField = 'author'
                const colonIndex = line.indexOf(':') !== -1 ? line.indexOf(':') : line.indexOf('：')
                if (colonIndex !== -1) author = line.substring(colonIndex + 1).trim()
            } else if (lower.startsWith('status:') || lower.startsWith('状态:') || lower.startsWith('进度:')) {
                currentField = 'status'
                const colonIndex = line.indexOf(':') !== -1 ? line.indexOf(':') : line.indexOf('：')
                if (colonIndex !== -1) status = line.substring(colonIndex + 1).trim()
            } else if (lower.startsWith('comment:') || lower.startsWith('简评:') || lower.startsWith('简评：')) {
                currentField = 'comment'
                const colonIndex = line.indexOf('：') !== -1 ? line.indexOf('：') : line.indexOf(':')
                if (colonIndex !== -1) {
                    comment = line.substring(colonIndex + 1).trim()
                }
            } else {
                // Handle multi-line content (mainly for comments)
                if (currentField === 'comment') {
                    if (comment) {
                        comment += '\n' + line
                    } else {
                        comment = line
                    }
                }
            }
        })
        
        node.data = {
            hName: 'media-card',
            hProperties: {
              type,
              title,
              cover,
              rating,
              comment,
              author,
              status
            }
        }
      }
    })
  }
}
