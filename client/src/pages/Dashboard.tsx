import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { License, InsertLicense } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { LicenseDialog } from "@/components/LicenseDialog";
import { DeleteDialog } from "@/components/DeleteDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { removeAuthToken } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Search, Pencil, Trash2, LogOut, Shield, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | undefined>();
  const [licenseToDelete, setLicenseToDelete] = useState<string | null>(null);

  const { data: licenses = [], isLoading, error } = useQuery<License[]>({
    queryKey: ["/api/licenses"],
    retry: false,
  });

  // Handle authentication errors
  useEffect(() => {
    if (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("401")) {
        removeAuthToken();
        setLocation("/");
      }
    }
  }, [error, setLocation]);

  const createMutation = useMutation({
    mutationFn: (data: InsertLicense) =>
      apiRequest<License>("POST", "/api/licenses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
      toast({
        title: "تم إضافة الترخيص بنجاح",
        description: "تم إضافة الترخيص الجديد إلى النظام",
      });
      setLicenseDialogOpen(false);
      setSelectedLicense(undefined);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "خطأ في إضافة الترخيص",
        description: "حدث خطأ أثناء إضافة الترخيص. حاول مرة أخرى.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertLicense) =>
      apiRequest<License>("PUT", `/api/licenses/${data.serial_number}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
      toast({
        title: "تم تحديث الترخيص بنجاح",
        description: "تم حفظ التعديلات على الترخيص",
      });
      setLicenseDialogOpen(false);
      setSelectedLicense(undefined);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "خطأ في تحديث الترخيص",
        description: "حدث خطأ أثناء تحديث الترخيص. حاول مرة أخرى.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (serialNumber: string) =>
      apiRequest("DELETE", `/api/licenses/${serialNumber}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
      toast({
        title: "تم حذف الترخيص بنجاح",
        description: "تم حذف الترخيص من النظام",
      });
      setDeleteDialogOpen(false);
      setLicenseToDelete(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "خطأ في حذف الترخيص",
        description: "حدث خطأ أثناء حذف الترخيص. حاول مرة أخرى.",
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: (serialNumber: string) =>
      apiRequest<License>("POST", `/api/licenses/${serialNumber}/reset`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
      toast({
        title: "تم إعادة التعيين",
        description: "تم إعادة تعيين التفعيل - يمكن الآن تفعيل الترخيص على جهاز جديد",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل إعادة تعيين التفعيل",
      });
    },
  });

  const handleLogout = () => {
    removeAuthToken();
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل خروجك من النظام بنجاح",
    });
    setLocation("/");
  };

  const handleAddNew = () => {
    setSelectedLicense(undefined);
    setLicenseDialogOpen(true);
  };

  const handleEdit = (license: License) => {
    setSelectedLicense(license);
    setLicenseDialogOpen(true);
  };

  const handleDelete = (serialNumber: string) => {
    setLicenseToDelete(serialNumber);
    setDeleteDialogOpen(true);
  };

  const handleSubmitLicense = (data: InsertLicense) => {
    if (selectedLicense) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleConfirmDelete = () => {
    if (licenseToDelete) {
      deleteMutation.mutate(licenseToDelete);
    }
  };

  const filteredLicenses = licenses.filter((license) => {
    const query = searchQuery.toLowerCase();
    return (
      license.serial_number.toLowerCase().includes(query) ||
      license.program_name.toLowerCase().includes(query) ||
      license.status.includes(query) ||
      (license.device_id && license.device_id.toLowerCase().includes(query)) ||
      (license.notes && license.notes.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                نظام إدارة تراخيص البرامج
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="default"
                onClick={handleLogout}
                data-testid="button-logout"
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">تسجيل خروج</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Toolbar */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="بحث عن السيريال أو اسم البرنامج أو الحالة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 text-right"
                data-testid="input-search"
              />
            </div>

            <Button
              onClick={handleAddNew}
              className="gap-2 w-full sm:w-auto"
              data-testid="button-add-license"
            >
              <Plus className="h-4 w-4" />
              إضافة ترخيص جديد
            </Button>
          </div>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي التراخيص</p>
                <p className="text-2xl font-bold">{licenses.length}</p>
              </div>
              <Shield className="h-8 w-8 text-primary opacity-20" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">التراخيص النشطة</p>
                <p className="text-2xl font-bold text-success">
                  {licenses.filter((l) => l.active).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-success opacity-20" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">التراخيص الصالحة</p>
                <p className="text-2xl font-bold text-success">
                  {licenses.filter((l) => l.status === "صالح").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-success opacity-20" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">التراخيص الموقوفة</p>
                <p className="text-2xl font-bold text-destructive">
                  {licenses.filter((l) => l.status === "موقوف").length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-destructive opacity-20" />
            </div>
          </Card>
        </div>

        {/* Licenses Table */}
        <Card>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                جاري تحميل التراخيص...
              </div>
            ) : filteredLicenses.length === 0 ? (
              <div className="p-8 text-center">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد تراخيص بعد"}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={handleAddNew}
                    variant="outline"
                    className="mt-4 gap-2"
                    data-testid="button-add-first-license"
                  >
                    <Plus className="h-4 w-4" />
                    إضافة أول ترخيص
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right font-semibold">رقم السيريال</TableHead>
                    <TableHead className="text-right font-semibold">اسم البرنامج</TableHead>
                    <TableHead className="text-right font-semibold">نشط</TableHead>
                    <TableHead className="text-right font-semibold">رقم الجهاز</TableHead>
                    <TableHead className="text-right font-semibold">تاريخ التفعيل</TableHead>
                    <TableHead className="text-right font-semibold">الحالة</TableHead>
                    <TableHead className="text-right font-semibold">الملاحظات</TableHead>
                    <TableHead className="text-right font-semibold">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLicenses.map((license) => (
                    <TableRow key={license.serial_number} className="hover-elevate">
                      <TableCell className="font-mono text-sm font-medium" data-testid={`text-serial-${license.serial_number}`}>
                        {license.serial_number}
                      </TableCell>
                      <TableCell className="font-medium">
                        {license.program_name}
                      </TableCell>
                      <TableCell>
                        {license.active ? (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            نشط
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground">
                            غير نشط
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {license.device_id || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(license.activation_date)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={license.status} />
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {license.notes || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(license)}
                            data-testid={`button-edit-${license.serial_number}`}
                            title="تعديل"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {license.device_id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => resetMutation.mutate(license.serial_number)}
                              data-testid={`button-reset-${license.serial_number}`}
                              title="إعادة تعيين التفعيل"
                              disabled={resetMutation.isPending}
                            >
                              <RotateCcw className="h-4 w-4 text-warning" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(license.serial_number)}
                            data-testid={`button-delete-${license.serial_number}`}
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      </main>

      <LicenseDialog
        open={licenseDialogOpen}
        onOpenChange={setLicenseDialogOpen}
        license={selectedLicense}
        onSubmit={handleSubmitLicense}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        serialNumber={licenseToDelete || ""}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
