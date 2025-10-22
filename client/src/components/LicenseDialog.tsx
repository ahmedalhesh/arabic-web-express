import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLicenseSchema, type License, type InsertLicense } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateSerialNumber, formatDate } from "@/lib/utils";

interface LicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  license?: License;
  onSubmit: (data: InsertLicense) => void;
  isLoading?: boolean;
}

export function LicenseDialog({
  open,
  onOpenChange,
  license,
  onSubmit,
  isLoading = false,
}: LicenseDialogProps) {
  const isEdit = !!license;

  const form = useForm<InsertLicense>({
    resolver: zodResolver(insertLicenseSchema),
    defaultValues: license ? {
      serial_number: license.serial_number,
      program_name: license.program_name,
      status: license.status,
      notes: license.notes,
    } : {
      serial_number: generateSerialNumber(),
      program_name: "",
      status: "غير مفعّل",
      notes: null,
    },
  });

  const handleSubmit = (data: InsertLicense) => {
    onSubmit(data);
    if (!isEdit) {
      form.reset({
        serial_number: generateSerialNumber(),
        program_name: "",
        status: "غير مفعّل",
        notes: null,
      });
    }
  };

  const handleGenerateSerial = () => {
    form.setValue("serial_number", generateSerialNumber());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEdit ? "تعديل الترخيص" : "إضافة ترخيص جديد"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "قم بتعديل معلومات الترخيص أدناه"
              : "أدخل معلومات الترخيص الجديد"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="serial_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم السيريال *</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="XXXX-XXXX-XXXX-XXXX"
                          className="font-mono text-right"
                          data-testid="input-serial-number"
                          disabled={isEdit}
                        />
                      </FormControl>
                      {!isEdit && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGenerateSerial}
                          data-testid="button-generate-serial"
                        >
                          توليد
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="program_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم البرنامج *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="أدخل اسم البرنامج"
                        className="text-right"
                        data-testid="input-program-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحالة *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      dir="rtl"
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="صالح">صالح</SelectItem>
                        <SelectItem value="منتهي">منتهي</SelectItem>
                        <SelectItem value="موقوف">موقوف</SelectItem>
                        <SelectItem value="غير مفعّل">غير مفعّل</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الملاحظات</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        placeholder="أضف أي ملاحظات إضافية..."
                        rows={3}
                        className="resize-none text-right"
                        data-testid="input-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEdit && license && (
                <div className="space-y-4 border rounded-md p-4 bg-muted/50">
                  <h3 className="text-sm font-medium text-muted-foreground">معلومات التفعيل (تلقائية)</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">حالة التفعيل:</span>
                      <Badge variant="outline" className={license.active ? "bg-success/10 text-success mr-2" : "mr-2"}>
                        {license.active ? "مفعّل" : "غير مفعّل"}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">رقم الجهاز:</span>
                      <span className="font-mono mr-2">{license.device_id || "-"}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">تاريخ التفعيل:</span>
                      <span className="mr-2">{formatDate(license.activation_date)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                data-testid="button-cancel"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                data-testid="button-save"
              >
                {isLoading ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة الترخيص"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
