"use client";

import React, { useState, useEffect } from "react";
import { usePage, LinkItem } from "../../_state/PageContext";
import { detectPlatform } from "../../_lib/platforms";
import { Toggle } from "../../_components/Toggle";
import { 
  HiOutlineLink, 
  HiOutlinePlus, 
  HiOutlineBars3, 
  HiOutlinePencil, 
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineXMark
} from "react-icons/hi2";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent 
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  useSortable, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableLinkRowProps {
  link: LinkItem;
  onEdit: (link: LinkItem) => void;
  onDelete: (id: string) => void;
}

function SortableLinkRow({ link, onEdit, onDelete }: SortableLinkRowProps) {
  const { toggleLink } = usePage();
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
  };

  const platform = detectPlatform(link.url);
  const Icon = platform.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex items-center gap-4 p-4 mb-3 bg-white border rounded-2xl transition-all ${
        isDragging ? "shadow-xl border-primary-coral/30 opacity-80" : "border-border-base shadow-sm"
      }`}
    >
      <button 
        {...attributes} 
        {...listeners}
        className="cursor-grab text-text-muted hover:text-text-primary p-1 active:cursor-grabbing"
      >
        <HiOutlineBars3 size={20} />
      </button>

      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${platform.color}10`, color: platform.color }}
      >
        {link.emoji ? (
          <span className="text-xl">{link.emoji}</span>
        ) : (
          <Icon size={20} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-text-primary truncate">{link.title}</h4>
        <p className="text-xs text-text-muted truncate">{link.url}</p>
      </div>

      <div className="flex items-center gap-3">
        <Toggle enabled={link.visible} onChange={() => toggleLink(link.id)} />
        
        {isDeleting ? (
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsDeleting(false)}
              className="p-1 text-text-muted hover:text-text-primary transition-colors"
            >
              <HiOutlineXMark size={20} />
            </button>
            <button 
              onClick={() => onDelete(link.id)}
              className="p-1 text-error hover:text-error/80 transition-colors"
            >
              <HiOutlineTrash size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <button 
              onClick={() => onEdit(link)}
              className="p-1 text-text-muted hover:text-text-primary transition-colors"
            >
              <HiOutlinePencil size={20} />
            </button>
            <button 
              onClick={() => setIsDeleting(true)}
              className="p-1 text-text-muted hover:text-text-primary transition-colors"
            >
              <HiOutlineTrash size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function LinksTab() {
  const { data, addLink, updateLink, deleteLink, reorderLinks } = usePage();
  const [isAdding, setIsAdding] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  
  // Inline Form State
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const startAdding = () => {
    setUrl("");
    setTitle("");
    setEmoji("");
    setIsAdding(true);
    setEditingLink(null);
  };

  const startEditing = (link: LinkItem) => {
    setUrl(link.url);
    setTitle(link.title);
    setEmoji(link.emoji || "");
    setEditingLink(link);
    setIsAdding(false);
  };

  const handleSave = () => {
    if (!url || !title) return;
    
    if (editingLink) {
      updateLink(editingLink.id, { url, title, emoji: emoji || undefined });
    } else {
      addLink({ url, title, emoji: emoji || undefined, visible: true });
    }
    
    cancelForm();
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingLink(null);
    setUrl("");
    setTitle("");
    setEmoji("");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = data.links.findIndex((l) => l.id === active.id);
      const newIndex = data.links.findIndex((l) => l.id === over.id);
      const newIds = arrayMove(data.links, oldIndex, newIndex).map(l => l.id);
      reorderLinks(newIds);
    }
  };

  const detectedPlatform = detectPlatform(url);

  return (
    <div className="w-full max-w-[640px] px-2 py-4 pb-32">
      <div className="mb-8">
        <h1 className="font-display text-3xl mb-2 text-text-primary tracking-tight">Your links</h1>
        <p className="text-text-muted text-sm leading-relaxed">
          Add, reorder, or hide links. Changes reflect instantly in the preview.
        </p>
      </div>

      {/* Add Link Button / Form */}
      {!isAdding && !editingLink ? (
        <button
          onClick={startAdding}
          className="w-full mb-8 py-4 bg-primary-coral text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary-coral/20 hover:bg-primary-coral-hover transition-all transform hover:scale-[1.01] active:scale-[0.99]"
        >
          <HiOutlinePlus size={20} strokeWidth={2.5} />
          Add Link
        </button>
      ) : (
        <div className="mb-8 p-6 bg-white border border-primary-coral/30 rounded-2xl shadow-xl shadow-primary-coral/5 animate-fade-up">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Paste your link here"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-4 pr-[60px] py-4 rounded-xl border border-border-base focus:ring-2 focus:ring-primary-coral focus:border-transparent outline-none transition-all font-medium"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center bg-primary-coral/10 text-primary-coral">
                <detectedPlatform.icon size={20} />
              </div>
            </div>
            
            {url && (
              <p className="text-xs font-semibold text-text-muted ml-1">
                Detected as <span className="text-primary-coral">{detectedPlatform.name}</span>
              </p>
            )}

            <input
              type="text"
              placeholder="What should this link say?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-4 rounded-xl border border-border-base focus:ring-2 focus:ring-primary-coral focus:border-transparent outline-none transition-all font-medium"
            />

            <input
              type="text"
              placeholder="Optional: pick an emoji instead of the auto icon"
              value={emoji}
              maxLength={4}
              onChange={(e) => setEmoji(e.target.value)}
              className="w-full px-4 py-4 rounded-xl border border-border-base focus:ring-2 focus:ring-primary-coral focus:border-transparent outline-none transition-all font-medium"
            />

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={!url || !title}
                className="flex-1 bg-primary-coral text-white py-3.5 rounded-xl font-bold hover:bg-primary-coral-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {editingLink ? "Update Link" : "Save Link"}
              </button>
              <button
                onClick={cancelForm}
                className="flex-1 bg-dashboard-bg text-text-primary py-3.5 rounded-xl font-bold border border-border-base hover:bg-border-base transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Links List */}
      <div className="space-y-3">
        {data.links.length === 0 ? (
          <div className="py-16 px-8 border-2 border-dashed border-border-base rounded-2xl flex flex-col items-center text-center">
            <HiOutlineLink size={48} className="text-text-muted mb-4 opacity-40" />
            <p className="text-text-muted font-medium">No links yet. Add your first one above.</p>
          </div>
        ) : (
          isMounted ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={data.links.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                {data.links.map((link) => (
                  <SortableLinkRow
                    key={link.id}
                    link={link}
                    onEdit={startEditing}
                    onDelete={deleteLink}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            data.links.map((link) => (
              <SortableLinkRow
                key={link.id}
                link={link}
                onEdit={startEditing}
                onDelete={deleteLink}
              />
            ))
          )
        )}
      </div>
    </div>
  );
}
