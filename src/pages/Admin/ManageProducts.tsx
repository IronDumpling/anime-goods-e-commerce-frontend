import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { post, put, get, ApiError } from "@/lib/api";
import { Product } from '@/lib/types';
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ManageProducts: React.FC = () => {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formMode, setFormMode] = useState<"create" | "update" | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);
  

  const handleSubmit = async () => {
    try {
      // Handle Invalid Product Alert
      const payload = {
        name: currentProduct.name || "",
        brand: currentProduct.brand || "",
        description: currentProduct.description || "",
        price: Number(currentProduct.price || 0),
        imageURL: currentProduct.imageURL || "",
        stock: Number(currentProduct.stock || 0),
        status: currentProduct.status || "ACTIVE",
        category: currentProduct.category || "Figures",
      };

      if (formMode === "create") {
        const response = await post("/api/product", payload);
        if (response.error || !response.data) {
          throw response.error || { error: "Failed to create user" };
        }
        toast.success("User created successfully");
      } else if (formMode === "update" && currentProduct.id) {
        const response = await put(`/api/product/${currentProduct.id}`, payload);
        if (response.error || !response.data) {
          throw response.error || { error: "Failed to update user" };
        }
        toast.success("User updated successfully");
      }

      setDialogOpen(false);
      setIsLoading(true);
      const refreshed = await get<{ products: Product[] }>("/api/product");
      if (refreshed.error || !refreshed.data) {
        throw refreshed.error || { error: "Failed to refresh user data" };
      }
      setProducts(refreshed.data?.products || []);
    } catch (error) {
      console.error("Failed to submit product:", error);
      const apiError = error as ApiError;
      const errorMessage = apiError.details && apiError.details.length > 0
        ? `${apiError.error}: ${apiError.details.join(', ')}`
        : apiError.error || "An error occurred while processing your request";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>ID<ArrowUpDown className="ml-2 h-4 w-4" /></Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "brand",
      header: "Brand",
    },
    {
      accessorKey: "price",
      header: "Price",
    },
    {
      accessorKey: "stock",
      header: "Stock",
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <span className="capitalize">{row.getValue("status")}</span>,
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
    },
    {
      id: "actions",
      enableHiding: false,
      header: "Actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(product.id.toString())}>Copy Product ID</DropdownMenuItem>
              <DropdownMenuItem>View</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setFormMode("update");
                  setCurrentProduct(product);
                  setDialogOpen(true);
                }}
              >
                Update
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await get<{ products: Product[] }>("/api/product");
        if (response.error || !response.data) {
          throw response.error || { error: "Unknown Error Fetching Products" };
        }
        setProducts(response.data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const table = useReactTable({
    data: products,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, value) => {
      const searchValue = value.toLowerCase();
      return (
        row.original.name.toLowerCase().includes(searchValue) ||
        row.original.brand.toLowerCase().includes(searchValue)
      );
    },
  });

  return (
    <ProtectedRoute accessLevel="admin">
      <div className="container mx-auto py-10">
        <button
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          onClick={() => navigate(`/admin`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Admin Page
        </button>
        <h1 className="text-2xl font-bold mb-6">Manage Products</h1>
        <Button
          onClick={() => {
            setCurrentProduct({});
            setFormMode("create");
            setDialogOpen(true);
          }}
        >
          + Add Product
        </Button>
        <div className="w-full">
          <div className="flex items-center py-4">
            <Input
              placeholder="Search by name or brand..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table.getAllColumns().filter((col) => col.getCanHide()).map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize"
                    checked={col.getIsVisible()}
                    onCheckedChange={(value) => col.toggleVisibility(!!value)}
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">Loading...</TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="text-left">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formMode === "create" ? "Add Product" : "Update Product"}</DialogTitle>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={currentProduct.name || ""} onChange={(e) => setCurrentProduct((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <Label>Brand</Label>
              <Input value={currentProduct.brand || ""} onChange={(e) => setCurrentProduct((p) => ({ ...p, brand: e.target.value }))} />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={currentProduct.category || ""} onChange={(e) => setCurrentProduct((p) => ({ ...p, category: e.target.value }))} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={currentProduct.description || ""} onChange={(e) => setCurrentProduct((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price</Label>
                <Input type="number" value={currentProduct.price || ""} onChange={(e) => setCurrentProduct((p) => ({ ...p, price: parseFloat(e.target.value) }))} />
              </div>
              <div>
                <Label>Stock</Label>
                <Input type="number" value={currentProduct.stock || ""} onChange={(e) => setCurrentProduct((p) => ({ ...p, stock: parseInt(e.target.value) }))} />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={currentProduct.status || "ACTIVE"} onValueChange={(val) => setCurrentProduct((p) => ({ ...p, status: val as Product["status"] }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                  <SelectItem value="DISCONTINUED">DISCONTINUED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={currentProduct.imageURL || ""} onChange={(e) => setCurrentProduct((p) => ({ ...p, imageURL: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{formMode === "create" ? "Create" : "Update"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </ProtectedRoute>
  );
};

export default ManageProducts;