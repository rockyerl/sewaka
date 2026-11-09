"use client";

import { useState, useTransition } from "react";
import {
  X,
  Star,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/components/ui/toast";

import { submitVendorReviewAction } from "../actions/vendor-inquiry-actions";

interface VendorReviewDialogProps {
  workspaceId: string;
  vendorId: string;
  vendorName: string;
  onClose: () => void;
}

export function VendorReviewDialog({
  workspaceId,
  vendorId,
  vendorName,
  onClose,
}: VendorReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (rating === 0) {
      showToast("Pilih rating terlebih dahulu.", "warning");
      return;
    }

    startTransition(async () => {
      try {
        const result = await submitVendorReviewAction(
          workspaceId,
          vendorId,
          rating,
          reviewText.trim() || undefined
        );

        if (result.success) {
          showToast(result.message, "success");
          onClose();
        } else {
          showToast(result.message, "error");
        }
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : "Gagal mengirim review.",
          "error"
        );
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Review Vendor</h2>
          <Button size="icon" variant="ghost" onClick={onClose} className="size-8">
            <X className="size-4" />
          </Button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">
              Vendor
            </label>
            <p className="mt-1 text-sm text-muted-foreground">{vendorName}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">
              Rating
            </label>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`size-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-none text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-2 text-sm text-amber-600">
                {rating === 1 && "Sangat Buruk"}
                {rating === 2 && "Buruk"}
                {rating === 3 && "Cukup"}
                {rating === 4 && "Bagus"}
                {rating === 5 && "Sangat Bagus!"}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">
              Review (Opsional)
            </label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Ceritakan pengalaman Anda dengan vendor ini..."
              className="mt-2 min-h-[100px]"
              maxLength={1000}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {reviewText.length}/1000 karakter
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending || rating === 0}
              className="flex-1 bg-[#5B132B] text-white hover:bg-[#5B132B]/90"
            >
              {isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Kirim Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
