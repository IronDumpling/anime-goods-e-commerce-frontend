import React, { useEffect, useState } from 'react';
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

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

import BackButton from "@/components/layout/BackButton";
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { post, put, get, del, ApiError } from "@/lib/api";
import { Product } from '@/lib/types';
import { exportTableToExcel } from "@/lib/excelUtils";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageUpload } from '@/components/layout/ImageUpload';

const ManageProducts: React.FC = () => {
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

  // Add state for bulk status update
  const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<Product["status"]>("ACTIVE");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Add state for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add state for bulk delete confirmation dialog
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteResults, setBulkDeleteResults] = useState<{
    success: number;
    failed: number;
    failedProducts: { id: number; name: string; reason: string }[];
  } | null>(null);

  const [imageInputMethod, setImageInputMethod] = useState<'url' | 'upload'>('url');

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
      console.log("Products data:", refreshed.data.products);
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
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Name<ArrowUpDown className="ml-2 h-4 w-4" /></Button>
      ),
    },
    {
      accessorKey: "brand",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Brand<ArrowUpDown className="ml-2 h-4 w-4" /></Button>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Price<ArrowUpDown className="ml-2 h-4 w-4" /></Button>
      ),
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"));
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(price);
        return formatted;
      },
    },
    {
      accessorKey: "stock",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Stock<ArrowUpDown className="ml-2 h-4 w-4" /></Button>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Status<ArrowUpDown className="ml-2 h-4 w-4" /></Button>
      ),
      cell: ({ row }) => <span className="capitalize">{row.getValue("status")}</span>,
    },
    {
      accessorKey: "imageURL",
      header: "Image URL",
      cell: ({ row }) => {
        const imageURL = row.getValue("imageURL") as string;
        if (!imageURL) return <span className="text-gray-400">No image</span>;

        // If URL is too long, display abbreviated version
        const displayText = imageURL.length > 30
          ? `${imageURL.substring(0, 15)}...${imageURL.substring(imageURL.length - 15)}`
          : imageURL;

        // Check if it's a valid URL (starts with http or https)
        const isValidUrl = /^https?:\/\//i.test(imageURL);

        if (isValidUrl) {
          // If it's a valid URL, display as a clickable link
          return (
            <a
              href={imageURL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[200px] block"
              title={imageURL} // Show full URL as hover tooltip
            >
              {displayText}
            </a>
          );
        } else {
          // If it's not a valid URL, display as plain text
          return (
            <span
              className="truncate max-w-[200px] block"
              title={imageURL} // Show full text as hover tooltip
            >
              {displayText}
            </span>
          );
        }
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Category<ArrowUpDown className="ml-2 h-4 w-4" /></Button>
      ),
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
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Set Status</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          const response = await put(`/api/product/${product.id}`, {
                            ...product,
                            status: "ACTIVE"
                          });

                          if (response.error) {
                            throw response.error;
                          }

                          toast.success("Product status updated to Active");

                          // Refresh the products list
                          const refreshed = await get<{ products: Product[] }>("/api/product");
                          if (refreshed.error || !refreshed.data) {
                            throw refreshed.error || { error: "Failed to refresh product data" };
                          }
                          setProducts(refreshed.data.products);
                        } catch (error) {
                          console.error("Failed to update product status:", error);
                          const apiError = error as ApiError;
                          const errorMessage = apiError.details && apiError.details.length > 0
                            ? `${apiError.error}: ${apiError.details.join(', ')}`
                            : apiError.error || "An error occurred while updating product status";
                          toast.error(errorMessage);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className={product.status === "ACTIVE" ? "bg-green-50 text-green-700" : ""}
                    >
                      Active
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          const response = await put(`/api/product/${product.id}`, {
                            ...product,
                            status: "INACTIVE"
                          });

                          if (response.error) {
                            throw response.error;
                          }

                          toast.success("Product status updated to Inactive");

                          // Refresh the products list
                          const refreshed = await get<{ products: Product[] }>("/api/product");
                          if (refreshed.error || !refreshed.data) {
                            throw refreshed.error || { error: "Failed to refresh product data" };
                          }
                          setProducts(refreshed.data.products);
                        } catch (error) {
                          console.error("Failed to update product status:", error);
                          const apiError = error as ApiError;
                          const errorMessage = apiError.details && apiError.details.length > 0
                            ? `${apiError.error}: ${apiError.details.join(', ')}`
                            : apiError.error || "An error occurred while updating product status";
                          toast.error(errorMessage);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className={product.status === "INACTIVE" ? "bg-yellow-50 text-yellow-700" : ""}
                    >
                      Inactive
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          const response = await put(`/api/product/${product.id}`, {
                            ...product,
                            status: "DISCONTINUED"
                          });

                          if (response.error) {
                            throw response.error;
                          }

                          toast.success("Product status updated to Discontinued");

                          // Refresh the products list
                          const refreshed = await get<{ products: Product[] }>("/api/product");
                          if (refreshed.error || !refreshed.data) {
                            throw refreshed.error || { error: "Failed to refresh product data" };
                          }
                          setProducts(refreshed.data.products);
                        } catch (error) {
                          console.error("Failed to update product status:", error);
                          const apiError = error as ApiError;
                          const errorMessage = apiError.details && apiError.details.length > 0
                            ? `${apiError.error}: ${apiError.details.join(', ')}`
                            : apiError.error || "An error occurred while updating product status";
                          toast.error(errorMessage);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className={product.status === "DISCONTINUED" ? "bg-red-50 text-red-700" : ""}
                    >
                      Discontinued
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
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
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => {
                  setProductToDelete(product);
                  setDeleteDialogOpen(true);
                }}
              >
                Delete
              </DropdownMenuItem>
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
        console.log("Products data:", response.data.products);
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

  // Add function to handle bulk status update
  const handleBulkStatusUpdate = async () => {
    try {
      setIsUpdatingStatus(true);
      const selectedRows = table.getFilteredSelectedRowModel().rows;

      if (selectedRows.length === 0) {
        toast.error("No products selected");
        return;
      }

      const updatePromises = selectedRows.map(row => {
        const product = row.original;
        return put(`/api/product/${product.id}`, {
          ...product,
          status: bulkStatus
        });
      });

      const results = await Promise.all(updatePromises);
      const hasErrors = results.some(result => result.error);

      if (hasErrors) {
        throw new Error("Some products could not be updated");
      }

      toast.success(`Updated status to ${bulkStatus} for ${selectedRows.length} products`);
      setBulkStatusDialogOpen(false);

      // Refresh the products list
      const refreshed = await get<{ products: Product[] }>("/api/product");
      if (refreshed.error || !refreshed.data) {
        throw refreshed.error || { error: "Failed to refresh product data" };
      }
      setProducts(refreshed.data.products);
    } catch (error) {
      console.error("Failed to update product statuses:", error);
      const apiError = error as ApiError;
      const errorMessage = apiError.details && apiError.details.length > 0
        ? `${apiError.error}: ${apiError.details.join(', ')}`
        : apiError.error || "An error occurred while updating product statuses";
      toast.error(errorMessage);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Add function to handle single product deletion
  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      setIsDeleting(true);
      const response = await del(`/api/product/${productToDelete.id}`);

      if (response.error) {
        // Check if the error is due to foreign key constraints (product referenced by orders)
        if (response.error.error && (
          response.error.error.includes("foreign key") ||
          response.error.error.includes("referenced")
        )) {
          throw new Error("This product cannot be deleted because it is referenced by existing orders. Consider setting it to 'DISCONTINUED' instead.");
        }
        throw response.error;
      }

      toast.success("Product deleted successfully");
      setDeleteDialogOpen(false);

      // Refresh the products list
      const refreshed = await get<{ products: Product[] }>("/api/product");
      if (refreshed.error || !refreshed.data) {
        throw refreshed.error || { error: "Failed to refresh product data" };
      }
      setProducts(refreshed.data.products);
    } catch (error) {
      console.error("Failed to delete product:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : "An error occurred while deleting the product";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  // Add function to handle bulk product deletion
  const handleBulkDelete = async () => {
    try {
      setIsBulkDeleting(true);
      const selectedRows = table.getFilteredSelectedRowModel().rows;

      if (selectedRows.length === 0) {
        toast.error("No products selected");
        return;
      }

      const results = {
        success: 0,
        failed: 0,
        failedProducts: [] as { id: number; name: string; reason: string }[]
      };

      // Process each product deletion
      for (const row of selectedRows) {
        const product = row.original;
        try {
          const response = await del(`/api/product/${product.id}`);

          if (response.error) {
            // Check if the error is due to foreign key constraints
            if (response.error.error && (
              response.error.error.includes("foreign key") ||
              response.error.error.includes("referenced")
            )) {
              results.failed++;
              results.failedProducts.push({
                id: product.id,
                name: product.name,
                reason: "Referenced by existing orders"
              });
            } else {
              results.failed++;
              results.failedProducts.push({
                id: product.id,
                name: product.name,
                reason: "Unknown error"
              });
            }
          } else {
            results.success++;
          }
        } catch (error) {
          results.failed++;
          results.failedProducts.push({
            id: product.id,
            name: product.name,
            reason: "Unknown error"
          });
        }
      }

      setBulkDeleteResults(results);

      // Show appropriate toast message
      if (results.success > 0) {
        toast.success(`Successfully deleted ${results.success} product(s)`);
      }

      if (results.failed > 0) {
        toast.error(`Failed to delete ${results.failed} product(s). See details below.`);
      }

      // Close the confirmation dialog
      setBulkDeleteDialogOpen(false);

      // Refresh the products list
      const refreshed = await get<{ products: Product[] }>("/api/product");
      if (refreshed.error || !refreshed.data) {
        throw refreshed.error || { error: "Failed to refresh product data" };
      }
      setProducts(refreshed.data.products);
    } catch (error) {
      console.error("Failed to process bulk deletion:", error);
      toast.error("An error occurred while processing the bulk deletion");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Replace the export handler
  const handleExportProducts = () => {
    exportTableToExcel(table, 'products-export');
  };

  const handleImageUploadComplete = (fileUrlMap: Record<string, string>) => {
    // Get the first URL from the map
    const firstUrl = Object.values(fileUrlMap)[0];
    if (firstUrl) {
      setCurrentProduct(prev => ({ ...prev, imageURL: firstUrl }));
    }
  };

  return (
    <ProtectedRoute accessLevel="admin">
      <div className="container mx-auto py-10">
        <BackButton to={`/admin`} label="Back to Admin Page" />
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
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-4">
                    Bulk Actions <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Set Status</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => {
                          setBulkStatus("ACTIVE");
                          setBulkStatusDialogOpen(true);
                        }}>
                          Active
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setBulkStatus("INACTIVE");
                          setBulkStatusDialogOpen(true);
                        }}>
                          Inactive
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setBulkStatus("DISCONTINUED");
                          setBulkStatusDialogOpen(true);
                        }}>
                          Discontinued
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportProducts}>
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                  >
                    Delete Selected ({table.getFilteredSelectedRowModel().rows.length})
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
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
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setError(null); // Clear error when dialog is closed
          }
        }}
      >
        <DialogContent
          className="max-w-2xl"
          style={{
            maxWidth: imageInputMethod === 'upload' ? '45rem' : '30rem',
            width: '100%'
          }}
        >
          <DialogHeader>
            <DialogTitle>{formMode === "create" ? "Add Product" : "Update Product"}</DialogTitle>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className={`grid grid-cols-1 ${imageInputMethod === 'upload' ? 'md:grid-cols-2' : ''} gap-6 mt-4`}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={currentProduct.name || ""} onChange={(e) => setCurrentProduct((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Brand</Label>
                <Input value={currentProduct.brand || ""} onChange={(e) => setCurrentProduct((p) => ({ ...p, brand: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={currentProduct.category || ""} onChange={(e) => setCurrentProduct((p) => ({ ...p, category: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={currentProduct.description || ""} onChange={(e) => setCurrentProduct((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input type="number" value={currentProduct.price || ""} onChange={(e) => setCurrentProduct((p) => ({ ...p, price: parseFloat(e.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input type="number" value={currentProduct.stock || ""} onChange={(e) => setCurrentProduct((p) => ({ ...p, stock: parseInt(e.target.value) }))} />
                </div>
              </div>
              <div className="space-y-2">
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
            </div>

            {imageInputMethod === 'upload' && (
              <div className="space-y-4">
                <div>
                  <ImageUpload
                    onUploadComplete={handleImageUploadComplete}
                    label="Upload Product Image"
                    mode="single"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Image URL section at the bottom */}
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Image</Label>
              <div className="space-y-2">
                <div className="flex space-x-2 mb-2">
                  <Button
                    type="button"
                    variant={imageInputMethod === 'url' ? 'default' : 'outline'}
                    onClick={() => setImageInputMethod('url')}
                    className="flex-1"
                  >
                    Enter URL
                  </Button>
                  <Button
                    type="button"
                    variant={imageInputMethod === 'upload' ? 'default' : 'outline'}
                    onClick={() => setImageInputMethod('upload')}
                    className="flex-1"
                  >
                    Upload to S3
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={currentProduct.imageURL || ""}
                onChange={(e) => setCurrentProduct((p) => ({ ...p, imageURL: e.target.value }))}
                disabled={imageInputMethod === 'upload'}
                className={imageInputMethod === 'upload' ? "bg-gray-100" : ""}
              />
              <div className="h-5"> {/* Fixed height container */}
                {imageInputMethod === 'upload' && (
                  <p className="text-xs text-gray-500">Image URL is automatically set when you upload an image</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{formMode === "create" ? "Create" : "Update"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Bulk Status Update Dialog */}
      <Dialog open={bulkStatusDialogOpen} onOpenChange={setBulkStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Product Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to update the status of {table.getFilteredSelectedRowModel().rows.length} selected products to {bulkStatus}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <AlertDescription>
                This action will update the status of all selected products to <strong>{bulkStatus}</strong>.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkStatusDialogOpen(false)} disabled={isUpdatingStatus}>
              Cancel
            </Button>
            <Button onClick={handleBulkStatusUpdate} disabled={isUpdatingStatus}>
              {isUpdatingStatus ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {productToDelete && (
              <div className="space-y-2">
                <p><strong>Name:</strong> {productToDelete.name}</p>
                <p><strong>Brand:</strong> {productToDelete.brand}</p>
                <p><strong>ID:</strong> {productToDelete.id}</p>
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>
                    <strong>Warning:</strong> If this product is referenced by any orders, it cannot be deleted. Consider setting it to "Discontinued" instead.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {table.getFilteredSelectedRowModel().rows.length} selected products? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Warning:</strong> Products that are referenced by existing orders cannot be deleted. These will be skipped during the deletion process.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteDialogOpen(false)} disabled={isBulkDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete} disabled={isBulkDeleting}>
              {isBulkDeleting ? "Deleting..." : "Delete Selected"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Bulk Delete Results Dialog */}
      <Dialog
        open={!!bulkDeleteResults}
        onOpenChange={(open) => {
          if (!open) setBulkDeleteResults(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Delete Results</DialogTitle>
            <DialogDescription>
              {bulkDeleteResults?.success} product(s) deleted successfully. {bulkDeleteResults?.failed} product(s) could not be deleted.
            </DialogDescription>
          </DialogHeader>
          {bulkDeleteResults && bulkDeleteResults.failed > 0 && (
            <div className="py-4">
              <h3 className="font-medium mb-2">Failed Deletions:</h3>
              <div className="max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bulkDeleteResults.failedProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.id}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Alert className="mt-4">
                <AlertDescription>
                  Consider setting these products to "Discontinued" instead of deleting them.
                </AlertDescription>
              </Alert>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setBulkDeleteResults(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
};

export default ManageProducts;