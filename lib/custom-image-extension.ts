import Image from '@tiptap/extension-image'

export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: null,
        parseHTML: element => element.getAttribute('title'),
        renderHTML: attributes => {
          if (!attributes.caption) {
            return {}
          }
          return {
            title: attributes.caption,
          }
        },
      },
    }
  },

  addNodeView() {
    return ({ node, editor }) => {
      const container = document.createElement('div')
      container.className = 'image-wrapper'
      container.style.cssText = 'position: relative; display: inline-block; margin: 1rem 0;'

      const img = document.createElement('img')
      img.src = node.attrs.src
      img.alt = node.attrs.alt || ''
      img.title = node.attrs.caption || ''
      img.style.cssText = 'max-width: 100%; height: auto; border-radius: 4px; cursor: pointer;'
      
      img.addEventListener('click', () => {
        if (!editor.isEditable) return
        const newCaption = prompt('图片描述（可选）：', node.attrs.caption || '')
        if (newCaption !== null) {
          editor.commands.updateAttributes('image', { caption: newCaption || null })
        }
      })

      const caption = document.createElement('div')
      caption.className = 'image-caption'
      caption.textContent = node.attrs.caption || ''
      caption.style.cssText = 'text-align: center; font-size: 0.875rem; color: #666; margin-top: 0.5rem; font-style: italic;'
      
      container.appendChild(img)
      if (node.attrs.caption) {
        container.appendChild(caption)
      }

      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) return false
          img.src = updatedNode.attrs.src
          img.alt = updatedNode.attrs.alt || ''
          img.title = updatedNode.attrs.caption || ''
          caption.textContent = updatedNode.attrs.caption || ''
          
          if (updatedNode.attrs.caption && !container.contains(caption)) {
            container.appendChild(caption)
          } else if (!updatedNode.attrs.caption && container.contains(caption)) {
            container.removeChild(caption)
          }
          return true
        }
      }
    }
  },
})

