"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from 'tiptap-markdown'
import { useEffect } from 'react'
import { SlashCommand, suggestion } from './slash-command'
import { toast } from "sonner"
import { CustomImage } from '@/lib/custom-image-extension'

interface EditorProps {
  value: string
  onChange: (value: string) => void
}

export function Editor({ value, onChange }: EditorProps) {
  const uploadImage = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const promise = fetch('/api/upload', {
      method: 'POST',
      body: formData,
    }).then(async (res) => {
      if (res.ok) {
        const { url } = await res.json()
        return url
      }
      throw new Error('Upload failed')
    })

    toast.promise(promise, {
      loading: 'Uploading image...',
      success: 'Image uploaded',
      error: 'Failed to upload image',
    })

    return promise
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
        emptyEditorClass: 'is-editor-empty',
      }),
      CustomImage,
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      SlashCommand.configure({
        suggestion,
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-neutral prose-lg max-w-none focus:outline-none min-h-[500px]',
      },
      handlePaste: (view, event, slice) => {
        const item = event.clipboardData?.items[0]
        if (item?.type.indexOf('image') === 0) {
          event.preventDefault()
          const file = item.getAsFile()
          if (file) {
            uploadImage(file).then((url) => {
              const image = view.state.schema.nodes.image.create({ 
                src: url
              })
              const transaction = view.state.tr.replaceSelectionWith(image)
              view.dispatch(transaction)
            })
          }
          return true
        }
        return false
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0]
          if (file.type.indexOf('image') === 0) {
            event.preventDefault()
            uploadImage(file).then((url) => {
              const { schema } = view.state
              const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
              if (coordinates) {
                const node = schema.nodes.image.create({ 
                  src: url
                })
                const transaction = view.state.tr.insert(coordinates.pos, node)
                view.dispatch(transaction)
              }
            })
            return true
          }
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      // Get Markdown content
      const markdown = (editor.storage as any).markdown.getMarkdown()
      onChange(markdown)
    },
  })

  // Sync content when value changes externally (e.g. initial load)
  useEffect(() => {
    if (editor && value !== (editor.storage as any).markdown.getMarkdown()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="w-full">
      <EditorContent editor={editor} />
    </div>
  )
}
