import Image from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ImageNodeView } from '@/components/editor/image-node-view'

export const CustomImage = Image.extend({
  // Ensure we support all standard image attributes from Tiptap
  addAttributes() {
    return {
      ...this.parent?.(),
      // title is used as caption in markdown: ![alt](url "title")
      title: {
        default: null,
        parseHTML: element => element.getAttribute('title'),
        renderHTML: attributes => {
          if (!attributes.title) {
            return {}
          }
          return {
            title: attributes.title,
          }
        },
      },
    }
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView)
  },
})



