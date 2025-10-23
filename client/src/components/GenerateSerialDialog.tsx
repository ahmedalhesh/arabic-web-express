import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GenerateSerialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (notes?: string) => Promise<string | null>;
  isLoading: boolean;
}

export function GenerateSerialDialog({
  open,
  onOpenChange,
  onGenerate,
  isLoading,
}: GenerateSerialDialogProps) {
  const [notes, setNotes] = useState("");
  const [generatedSerial, setGeneratedSerial] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    const serial = await onGenerate(notes);
    if (serial) {
      setGeneratedSerial(serial);
    }
  };

  const handleCopy = () => {
    if (generatedSerial) {
      navigator.clipboard.writeText(generatedSerial);
      setCopied(true);
      toast({
        title: "تم النسخ",
        description: "تم نسخ السيريال إلى الحافظة",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setNotes("");
    setGeneratedSerial(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">🔑 توليد سيريال جديد</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!generatedSerial ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أدخل ملاحظات إضافية..."
                  rows={3}
                  disabled={isLoading}
                  className="text-right"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "جاري التوليد..." : "🎲 توليد السيريال"}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>السيريال المولد</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 bg-muted rounded-md text-center font-mono text-lg font-bold">
                    {generatedSerial}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleClose}
                  className="flex-1"
                >
                  ✅ تم
                </Button>
                <Button
                  onClick={() => {
                    setGeneratedSerial(null);
                    setNotes("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  توليد آخر
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

