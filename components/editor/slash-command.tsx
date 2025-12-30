import React, {
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react"
import { Editor, Range, Extension } from "@tiptap/core"
import Suggestion, { SuggestionOptions } from "@tiptap/suggestion"
import { ReactRenderer } from "@tiptap/react"
import tippy from "tippy.js"
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Text,
  Code,
  CheckSquare,
  Image as ImageIcon,
} from "lucide-react"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { toast } from "sonner"

// 1. Define the Command Item Interface
interface CommandItemProps {
  title: string
  description: string
  icon: React.ElementType
  command: (editor: { chain: () => any }) => void
}

// 2. Define the available commands
const getSuggestionItems = ({ query }: { query: string }) => {
  return [
    {
      title: "Text",
      description: "Just start typing with plain text.",
      icon: Text,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setParagraph().run()
      },
    },
    {
      title: "Heading 1",
      description: "Big section heading.",
      icon: Heading1,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run()
      },
    },
    {
      title: "Heading 2",
      description: "Medium section heading.",
      icon: Heading2,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run()
      },
    },
    {
      title: "Heading 3",
      description: "Small section heading.",
      icon: Heading3,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run()
      },
    },
    {
      title: "Bullet List",
      description: "Create a simple bullet list.",
      icon: List,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run()
      },
    },
    {
      title: "Numbered List",
      description: "Create a list with numbering.",
      icon: ListOrdered,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run()
      },
    },
    {
      title: "To-do List",
      description: "Track tasks with a to-do list.",
      icon: CheckSquare,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run()
      },
    },
    {
      title: "Image",
      description: "Upload an image from your computer.",
      icon: ImageIcon,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).run()
        const input = document.createElement("input")
        input.type = "file"
        input.accept = "image/*"
        input.onchange = async () => {
          if (input.files?.length) {
            const file = input.files[0]
            const formData = new FormData()
            formData.append("file", file)

            const promise = fetch("/api/upload", {
              method: "POST",
              body: formData,
            }).then(async (res) => {
              if (res.ok) {
                const data = await res.json()
                editor.chain().focus().setImage({ src: data.url }).run()
                return data
              }
              throw new Error("Upload failed")
            })

            toast.promise(promise, {
              loading: "Uploading image...",
              success: "Image uploaded",
              error: "Failed to upload image",
            })
          }
        }
        input.click()
      },
    },
    {
      title: "Code Block",
      description: "Capture a code snippet.",
      icon: Code,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
      },
    },
  ].filter((item) => {
    if (typeof query === "string" && query.length > 0) {
      return item.title.toLowerCase().includes(query.toLowerCase())
    }
    return true
  })
}

// 3. The React Component for the Menu
const CommandListRenderer = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = useCallback(
    (index: number) => {
      const item = props.items[index]
      if (item) {
        props.command(item)
      }
    },
    [props]
  )

  useEffect(() => {
    const navigationKeys = ["ArrowUp", "ArrowDown", "Enter"]
    const onKeyDown = (e: KeyboardEvent) => {
      if (navigationKeys.includes(e.key)) {
        e.preventDefault()
        if (e.key === "ArrowUp") {
          setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
          return true
        }
        if (e.key === "ArrowDown") {
          setSelectedIndex((selectedIndex + 1) % props.items.length)
          return true
        }
        if (e.key === "Enter") {
          selectItem(selectedIndex)
          return true
        }
        return false
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [props.items, selectedIndex, selectItem])

  useEffect(() => {
    setSelectedIndex(0)
  }, [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
        return true
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((selectedIndex + 1) % props.items.length)
        return true
      }
      if (event.key === "Enter") {
        selectItem(selectedIndex)
        return true
      }
      return false
    },
  }))

  return (
    <Command className="border rounded-md shadow-md w-64 bg-white overflow-hidden">
      <CommandList>
        <CommandGroup heading="Suggestions">
          {props.items.map((item: any, index: number) => (
            <CommandItem
              key={index}
              onSelect={() => selectItem(index)}
              className={`flex items-center gap-2 px-2 py-1 cursor-pointer ${
                index === selectedIndex ? "bg-neutral-100" : ""
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-200 bg-white">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-neutral-500">{item.description}</p>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
})

CommandListRenderer.displayName = "CommandListRenderer"

// 4. The Tiptap Extension
export const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range })
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

// 5. Configuration for the Suggestion utility
export const suggestion = {
  items: getSuggestionItems,
  render: () => {
    let component: any
    let popup: any

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(CommandListRenderer, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        popup = tippy("body", {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        })
      },

      onUpdate(props: any) {
        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        })
      },

      onKeyDown(props: any) {
        if (props.event.key === "Escape") {
          popup[0].hide()
          return true
        }

        return component.ref?.onKeyDown(props)
      },

      onExit() {
        popup[0].destroy()
        component.destroy()
      },
    }
  },
}
