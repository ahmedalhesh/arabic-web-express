import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { License } from "@shared/schema";

interface EditNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  license: License | null;
  onSave: (serial: string, notes: string) => Promise<void>;
  isLoading: boolean;
}

export function EditNotesDialog({
  open,
  onOpenChange,
  license,
  onSave,
  isLoading,
}: EditNotesDialogProps) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (license) {
      setNotes(license.notes || "");
    }
  }, [license]);

  const handleSave = async () => {
    if (license) {
      await onSave(license.serial_number, notes);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">✏️ تعديل الملاحظات</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>السيريال</Label>
            <div className="p-2 bg-muted rounded-md text-center font-mono text-sm">
              {license?.serial_number}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">الملاحظات</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أدخل ملاحظات..."
              rows={4}
              disabled={isLoading}
              className="text-right"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "جاري الحفظ..." : "💾 حفظ"}
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              disabled={isLoading}
              className="flex-1"
            >
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

