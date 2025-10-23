import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { License } from "@shared/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GenerateSerialDialog } from "@/components/GenerateSerialDialog";
import { EditNotesDialog } from "@/components/EditNotesDialog";
import { DeleteDialog } from "@/components/DeleteDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { removeAuthToken } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, LogOut, Shield, Key, Search, Filter, X } from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "serial">("date-desc");

  const { data: licenses = [], isLoading } = useQuery<License[]>({
    queryKey: ["/api/licenses"],
    retry: false,
  });

  const generateMutation = useMutation({
    mutationFn: (notes?: string) =>
      apiRequest<{ success: boolean; serial: string; license: License }>(
        "POST",
        "/api/generate-serial",
        { notes }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: ({ serial, notes }: { serial: string; notes: string }) =>
      apiRequest<{ success: boolean }>("PUT", `/api/licenses/${serial}/notes`, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث الملاحظات بنجاح",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (serial: string) =>
      apiRequest("DELETE", `/api/licenses/${serial}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
      toast({
        title: "تم الحذف",
        description: "تم حذف السيريال من النظام",
      });
      setDeleteDialogOpen(false);
      setSelectedLicense(null);
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

  const handleGenerate = async (notes?: string): Promise<string | null> => {
    try {
      const response = await generateMutation.mutateAsync(notes);
      return response.serial;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل توليد السيريال",
      });
      return null;
    }
  };

  const handleEdit = (license: License) => {
    setSelectedLicense(license);
    setEditDialogOpen(true);
  };

  const handleDelete = (license: License) => {
    setSelectedLicense(license);
    setDeleteDialogOpen(true);
  };

  const handleSaveNotes = async (serial: string, notes: string) => {
    await updateNotesMutation.mutateAsync({ serial, notes });
  };

  const handleConfirmDelete = () => {
    if (selectedLicense) {
      deleteMutation.mutate(selectedLicense.serial_number);
    }
  };

  // Filtered and sorted licenses
  const filteredLicenses = useMemo(() => {
    let filtered = [...licenses];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((license) => {
        return (
          license.serial_number.toLowerCase().includes(query) ||
          (license.program_name && license.program_name.toLowerCase().includes(query)) ||
          (license.device_id && license.device_id.toLowerCase().includes(query)) ||
          (license.notes && license.notes.toLowerCase().includes(query))
        );
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((license) => {
        if (statusFilter === "active") {
          return license.active === 1;
        } else {
          return license.active === 0;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "date-desc") {
        const dateA = a.activation_date ? new Date(a.activation_date).getTime() : 0;
        const dateB = b.activation_date ? new Date(b.activation_date).getTime() : 0;
        return dateB - dateA;
      } else if (sortBy === "date-asc") {
        const dateA = a.activation_date ? new Date(a.activation_date).getTime() : 0;
        const dateB = b.activation_date ? new Date(b.activation_date).getTime() : 0;
        return dateA - dateB;
      } else {
        return a.serial_number.localeCompare(b.serial_number);
      }
    });

    return filtered;
  }, [licenses, searchQuery, statusFilter, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("date-desc");
  };

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
                نظام إدارة التراخيص
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="default"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">خروج</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Toolbar */}
        <Card className="p-4">
          <div className="flex flex-col gap-4">
            {/* Top Row - Stats and Add Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Key className="h-5 w-5" />
                <span>إجمالي: <strong className="text-foreground">{licenses.length}</strong></span>
                <span className="mx-2">•</span>
                <span>النتائج: <strong className="text-primary">{filteredLicenses.length}</strong></span>
                <span className="mx-2">•</span>
                <span>نشطة: <strong className="text-success">{licenses.filter(l => l.active).length}</strong></span>
              </div>

              <Button
                onClick={() => setGenerateDialogOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                توليد سيريال
              </Button>
            </div>

            {/* Search and Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="بحث في السيريال، اسم البرنامج، معرف الجهاز، الملاحظات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 text-right"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط فقط</SelectItem>
                  <SelectItem value="inactive">غير نشط فقط</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="ترتيب حسب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">الأحدث أولاً</SelectItem>
                  <SelectItem value="date-asc">الأقدم أولاً</SelectItem>
                  <SelectItem value="serial">حسب السيريال</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {(searchQuery || statusFilter !== "all" || sortBy !== "date-desc") && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearFilters}
                  title="إلغاء التصفية"
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Licenses Table */}
        <Card>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                جاري تحميل التراخيص...
              </div>
            ) : licenses.length === 0 ? (
              <div className="p-8 text-center">
                <Key className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                <p className="text-muted-foreground mb-4">
                  لا توجد تراخيص بعد
                </p>
                <Button
                  onClick={() => setGenerateDialogOpen(true)}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  توليد أول سيريال
                </Button>
              </div>
            ) : filteredLicenses.length === 0 ? (
              <div className="p-8 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                <p className="text-muted-foreground mb-4">
                  لا توجد نتائج تطابق البحث أو التصفية
                </p>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  إلغاء التصفية
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right font-semibold">السيريال</TableHead>
                    <TableHead className="text-right font-semibold">اسم البرنامج</TableHead>
                    <TableHead className="text-right font-semibold">معرف الجهاز</TableHead>
                    <TableHead className="text-right font-semibold">الحالة</TableHead>
                    <TableHead className="text-right font-semibold">تاريخ التفعيل</TableHead>
                    <TableHead className="text-right font-semibold">الملاحظات</TableHead>
                    <TableHead className="text-right font-semibold">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLicenses.map((license) => (
                    <TableRow key={license.serial_number}>
                      <TableCell className="font-mono text-sm font-medium">
                        {license.serial_number}
                      </TableCell>
                      <TableCell className="font-medium">
                        {license.program_name || <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">
                        {license.device_id || <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>
                        {license.active ? (
                          <Badge className="bg-success/10 text-success border-success/20">
                            ✅ نشط
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground">
                            ⏸️ غير نشط
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(license.activation_date)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {license.notes || <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(license)}
                            title="تعديل الملاحظات"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(license)}
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

      <GenerateSerialDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        onGenerate={handleGenerate}
        isLoading={generateMutation.isPending}
      />

      <EditNotesDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        license={selectedLicense}
        onSave={handleSaveNotes}
        isLoading={updateNotesMutation.isPending}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        serialNumber={selectedLicense?.serial_number || ""}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

