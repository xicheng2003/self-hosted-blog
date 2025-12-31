"use client"

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function ImageNodeView(props: NodeViewProps) {
  const { node, updateAttributes, editor } = props
  const [isOpen, setIsOpen] = useState(false)
  const [alt, setAlt] = useState(node.attrs.alt || '')
  const [title, setTitle] = useState(node.attrs.title || '')

  // Sync state when node attributes change externally
  useEffect(() => {
    setAlt(node.attrs.alt || '')
    setTitle(node.attrs.title || '')
  }, [node.attrs.alt, node.attrs.title])

  const handleSave = () => {
    updateAttributes({
      alt: alt || undefined,
      title: title || undefined
    })
    setIsOpen(false)
  }

  const handleOpen = () => {
    if (!editor.isEditable) return
    setAlt(node.attrs.alt || '')
    setTitle(node.attrs.title || '')
    setIsOpen(true)
  }

  return (
    <NodeViewWrapper className="image-node-view">
      <figure 
        className="relative inline-block my-8 group m-0"
        onClick={handleOpen}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={node.attrs.src}
          alt={node.attrs.alt}
          title={node.attrs.title}
          className="max-w-full h-auto rounded-sm block cursor-pointer transition-all hover:ring-2 hover:ring-primary/50"
        />
        
        {/* Hover overlay hint */}
        {editor.isEditable && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-sm">
            <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">点击编辑</span>
          </div>
        )}

        {/* Caption Display in Editor */}
        {node.attrs.title && (
          <figcaption className="text-center text-sm text-gray-500 mt-2 italic">
            {node.attrs.title}
          </figcaption>
        )}
      </figure>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>编辑图片信息</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="img-alt" className="text-right">
                Alt 文本
              </Label>
              <Input
                id="img-alt"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                className="col-span-3"
                placeholder="用于 SEO 和辅助功能"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="img-title" className="text-right">
                图片描述
              </Label>
              <Input
                id="img-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder="显示在图片下方的说明"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>取消</Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </NodeViewWrapper>
  )
}

