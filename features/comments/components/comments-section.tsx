"use client";

import { useState } from "react";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/page-components";
import { createCommentAction, getCommentsAction, deleteCommentAction } from "@/features/comments/actions/comment-actions";
import { formatDistanceToNow } from "date-fns";

export function CommentsSection({
  workspaceId,
  targetId,
  targetType,
}: {
  workspaceId: string;
  targetId: string;
  targetType: "TASK" | "EVENT" | "DOCUMENT" | "VENDOR";
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadComments() {
    const result = await getCommentsAction(workspaceId, targetId, targetType);
    setComments(result);
  }

  async function handleSubmit() {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await createCommentAction(workspaceId, { targetId, targetType, content });
      setContent("");
      await loadComments();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(commentId: string) {
    try {
      await deleteCommentAction(commentId);
      await loadComments();
    } catch (err) {
      console.error(err);
    }
  }

  // Load comments on mount
  useState(() => {
    loadComments();
  });

  const parentComments = comments.filter((c) => !c.parentId);
  const childComments = comments.filter((c) => c.parentId);

  return (
    <Card className="p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="h-4 w-4 text-[#D4AF37]" />
        <h3 className="text-sm font-semibold text-[#5B132B]">
          Komentar ({comments.length})
        </h3>
      </div>

      {/* Comment List */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {parentComments.length === 0 && (
          <EmptyState message="Belum ada komentar. Mulai percakapan!" icon={MessageSquare} />
        )}
        {parentComments.map((comment) => (
          <div key={comment.id} className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{comment.userName || "Anonim"}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt))} yang lalu
                  </span>
                </div>
                <p className="text-sm mt-1">{comment.content}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                onClick={() => handleDelete(comment.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            {/* Replies */}
            {childComments
              .filter((child) => child.parentId === comment.id)
              .map((reply) => (
                <div key={reply.id} className="ml-4 border-l-2 border-border pl-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{reply.userName || "Anonim"}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(reply.createdAt))} yang lalu
                        </span>
                      </div>
                      <p className="text-sm mt-1">{reply.content}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                      onClick={() => handleDelete(reply.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* Comment Input */}
      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tulis komentar..."
          rows={2}
          className="resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          className="bg-[#5B132B] hover:bg-[#4a1025] self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
