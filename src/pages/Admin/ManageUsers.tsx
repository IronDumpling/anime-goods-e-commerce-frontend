import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
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
import { ArrowUpDown, ChevronDown, MoreHorizontal, FileSpreadsheet } from "lucide-react";

import BackButton from '@/components/layout/BackButton';
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { get, post, put, del, ApiError } from "@/lib/api";
import { User } from "@/lib/types";
import { exportTableToExcel } from "@/lib/excelUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ExcelImportDialog from '@/components/layout/ExcelImportDialog';

const ManageUsers: React.FC = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New states for user management
  const [formMode, setFormMode] = useState<"create" | "update" | null>(null);
  const [currentUser, setCurrentUser] = useState<Partial<User> & { password?: string }>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New state for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add state for bulk delete confirmation dialog
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteResults, setBulkDeleteResults] = useState<{
    success: number;
    failed: number;
    failedUsers: { id: number; name: string; reason: string }[];
  } | null>(null);

  // Add state for Excel import dialog
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const columns: ColumnDef<User>[] = [
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
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
      filterFn: (row, _columnId, value) => {
        return row.getValue<number>("id").toString().includes(value as string);
      },
    },
    {
      accessorKey: "firstName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            First Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      filterFn: (row, _columnId, value) => {
        return row.getValue<string>("firstName").toLowerCase().includes((value as string).toLowerCase());
      },
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      filterFn: (row, _columnId, value) => {
        return row.getValue<string>("lastName").toLowerCase().includes((value as string).toLowerCase());
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      filterFn: (row, _columnId, value) => {
        return row.getValue<string>("email").toLowerCase().includes((value as string).toLowerCase());
      },
    },
    {
      accessorKey: "address",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Address
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      filterFn: (row, _columnId, value) => {
        return row.getValue<string>("address").toLowerCase().includes((value as string).toLowerCase());
      },
    },
    {
      accessorKey: "isAdmin",
      header: "Role",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("isAdmin") ? "Admin" : "User"}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original
        const navigate = useNavigate();

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.id.toString())}
              >
                Copy ID
              </DropdownMenuItem>
              {/* TODO: make a better view orders when order is ready*/}
              <DropdownMenuItem onClick={() => navigate(`/admin/orders?userId=${user.id}`)}>
                View Orders
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setFormMode("update");
                  setCurrentUser(user);
                  setDialogOpen(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => {
                  setUserToDelete(user);
                  setDeleteDialogOpen(true);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await get<Array<User>>("/api/user/allCustomers");
        if (response.error || !response.data) {
          throw response.error || { error: "Unknown Error ManageUsers" };
        }
        setUsers(response.data);
      } catch (error) {
        // Using sonner toast for error notification
        const apiError = error as ApiError;
        const errorMessage = apiError.details && apiError.details.length > 0
          ? `${apiError.error}: ${apiError.details.join(', ')}`
          : apiError.error || "Error fetching users";
        toast.error(errorMessage);
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const table = useReactTable({
    data: users,
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
        row.getValue<number>("id").toString().includes(searchValue) ||
        row.getValue<string>("firstName").toLowerCase().includes(searchValue) ||
        row.getValue<string>("lastName").toLowerCase().includes(searchValue) ||
        row.getValue<string>("email").toLowerCase().includes(searchValue)
      );
    },
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validate required fields
      if (!currentUser.firstName || !currentUser.lastName || !currentUser.email) {
        setError("First name, last name, and email are required fields.");
        return;
      }

      // For new users, password is required
      if (formMode === "create" && !currentUser.password) {
        setError("Password is required for new users.");
        return;
      }

      const payload = {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        address: currentUser.address || "",
        isAdmin: currentUser.isAdmin || false,
        ...(currentUser.password && { password: currentUser.password }),
      };

      if (formMode === "create") {
        const response = await post<User>("/api/user", payload);
        if (response.error || !response.data) {
          throw response.error || { error: "Failed to create user" };
        }
        toast.success("User created successfully");
      } else if (formMode === "update" && currentUser.id) {
        const response = await put<User>(`/api/user/${currentUser.id}`, payload);
        if (response.error || !response.data) {
          throw response.error || { error: "Failed to update user" };
        }
        toast.success("User updated successfully");
      }

      setDialogOpen(false);
      setIsLoading(true);
      const refreshed = await get<Array<User>>("/api/user/allCustomers");
      if (refreshed.error || !refreshed.data) {
        throw refreshed.error || { error: "Failed to refresh user data" };
      }
      setUsers(refreshed.data);
    } catch (error) {
      console.error("Failed to submit user:", error);
      const apiError = error as ApiError;
      const errorMessage = apiError.details && apiError.details.length > 0
        ? `${apiError.error}: ${apiError.details.join(', ')}`
        : apiError.error || "An error occurred while processing your request";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  // Add handleDelete function
  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      const response = await del(`/api/user/${userToDelete.id}`);

      if (response.error) {
        throw response.error;
      }

      toast.success("User deleted successfully");
      setDeleteDialogOpen(false);

      // Refresh the users list
      const refreshed = await get<Array<User>>("/api/user/allCustomers");
      if (refreshed.error || !refreshed.data) {
        throw refreshed.error || { error: "Failed to refresh user data" };
      }
      setUsers(refreshed.data);
    } catch (error) {
      console.error("Failed to delete user:", error);
      const apiError = error as ApiError;
      const errorMessage = apiError.details && apiError.details.length > 0
        ? `${apiError.error}: ${apiError.details.join(', ')}`
        : apiError.error || "An error occurred while deleting the user";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  // Add function to handle bulk user deletion
  const handleBulkDelete = async () => {
    try {
      setIsBulkDeleting(true);
      const selectedRows = table.getFilteredSelectedRowModel().rows;

      if (selectedRows.length === 0) {
        toast.error("No users selected");
        return;
      }

      const results = {
        success: 0,
        failed: 0,
        failedUsers: [] as { id: number; name: string; reason: string }[]
      };

      // Process each user deletion
      for (const row of selectedRows) {
        const user = row.original;
        try {
          const response = await del(`/api/user/${user.id}`);

          if (response.error) {
            // Check if the error is due to foreign key constraints
            if (response.error.error && (
              response.error.error.includes("foreign key") ||
              response.error.error.includes("referenced")
            )) {
              results.failed++;
              results.failedUsers.push({
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                reason: "Referenced by existing orders"
              });
            } else {
              results.failed++;
              results.failedUsers.push({
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                reason: "Unknown error"
              });
            }
          } else {
            results.success++;
          }
        } catch (error) {
          results.failed++;
          results.failedUsers.push({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            reason: "Unknown error"
          });
        }
      }

      setBulkDeleteResults(results);

      // Show appropriate toast message
      if (results.success > 0) {
        toast.success(`Successfully deleted ${results.success} user(s)`);
      }

      if (results.failed > 0) {
        toast.error(`Failed to delete ${results.failed} user(s). See details below.`);
      }

      // Close the confirmation dialog
      setBulkDeleteDialogOpen(false);

      // Refresh the users list
      const refreshed = await get<Array<User>>("/api/user/allCustomers");
      if (refreshed.error || !refreshed.data) {
        throw refreshed.error || { error: "Failed to refresh user data" };
      }
      setUsers(refreshed.data);
    } catch (error) {
      console.error("Failed to process bulk deletion:", error);
      toast.error("An error occurred while processing the bulk deletion");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleExportUsers = () => {
    exportTableToExcel(table, 'selected-users-export', true);
  };

  const handleExportAllUsers = () => {
    exportTableToExcel(table, 'all-users-export', false);
  };

  const handleDeleteAll = async () => {
    try {
      setIsBulkDeleting(true);
      const allRows = table.getFilteredRowModel().rows;

      if (allRows.length === 0) {
        toast.error("No users to delete");
        return;
      }

      const results = {
        success: 0,
        failed: 0,
        failedUsers: [] as { id: number; name: string; reason: string }[]
      };

      // Process each user deletion
      for (const row of allRows) {
        const user = row.original;
        try {
          const response = await del(`/api/user/${user.id}`);

          if (response.error) {
            // Check if the error is due to foreign key constraints
            if (response.error.error && (
              response.error.error.includes("foreign key") ||
              response.error.error.includes("referenced")
            )) {
              results.failed++;
              results.failedUsers.push({
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                reason: "Referenced by existing orders"
              });
            } else {
              results.failed++;
              results.failedUsers.push({
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                reason: "Unknown error"
              });
            }
          } else {
            results.success++;
          }
        } catch (error) {
          results.failed++;
          results.failedUsers.push({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            reason: "Unknown error"
          });
        }
      }

      setBulkDeleteResults(results);

      // Show appropriate toast message
      if (results.success > 0) {
        toast.success(`Successfully deleted ${results.success} user(s)`);
      }

      if (results.failed > 0) {
        toast.error(`Failed to delete ${results.failed} user(s). See details below.`);
      }

      // Refresh the users list
      const refreshed = await get<Array<User>>("/api/user/allCustomers");
      if (refreshed.error || !refreshed.data) {
        throw refreshed.error || { error: "Failed to refresh user data" };
      }
      setUsers(refreshed.data);
    } catch (error) {
      console.error("Failed to process bulk deletion:", error);
      toast.error("An error occurred while processing the bulk deletion");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Add function to handle Excel import
  const handleImportUsers = async (data: Partial<User>[]) => {
    const results = {
      success: [] as User[],
      failed: [] as { row: number; data: any; reason: string }[]
    };

    for (let i = 0; i < data.length; i++) {
      const userData = data[i];
      try {
        // Create user
        const response = await post<User>("/api/user", userData);
        if (response.error || !response.data) {
          throw response.error || { error: "Failed to create user" };
        }
        results.success.push(response.data);
      } catch (error) {
        console.error(`Failed to import user at row ${i + 2}:`, error);
        const apiError = error as ApiError;
        const errorMessage = apiError.details && apiError.details.length > 0
          ? `${apiError.error}: ${apiError.details.join(', ')}`
          : apiError.error || "Unknown error";

        results.failed.push({
          row: i + 2,
          data: userData,
          reason: errorMessage
        });
      }
    }

    // Refresh the users list if at least one user was successfully imported
    if (results.success.length > 0) {
      const refreshed = await get<Array<User>>("/api/user/allCustomers");
      if (refreshed.error || !refreshed.data) {
        throw refreshed.error || { error: "Failed to refresh user data" };
      }
      setUsers(refreshed.data);
    }

    return results;
  };

  return (
    <ProtectedRoute accessLevel="admin">
      <div className="container mx-auto py-10">
        <BackButton to={`/admin`} label="Back to Admin Page" />
        <h1 className="text-2xl font-bold mb-6">Manage Accounts</h1>
        <div className="flex gap-2 mb-4">
          <Button
            onClick={() => {
              setCurrentUser({});
              setFormMode("create");
              setDialogOpen(true);
            }}
          >
            + Add Account
          </Button>
          <Button
            variant="outline"
            onClick={() => setImportDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Import Excel
          </Button>
        </div>
        <div className="w-full">
          <div className="flex items-center py-4">
            <Input
              placeholder="Search by ID, first name, last name, or email..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-4">
                  Bulk Actions <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={handleExportUsers}
                  disabled={table.getFilteredSelectedRowModel().rows.length === 0}
                >
                  Export selected
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleExportAllUsers}
                >
                  Export all
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => setBulkDeleteDialogOpen(true)}
                  disabled={table.getFilteredSelectedRowModel().rows.length === 0}
                >
                  Delete Selected ({table.getFilteredSelectedRowModel().rows.length})
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={handleDeleteAll}
                >
                  Delete All ({table.getFilteredRowModel().rows.length})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="text-left">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formMode === "create" ? "Add User" : "Update User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                value={currentUser.firstName || ""}
                onChange={(e) => setCurrentUser((u) => ({ ...u, firstName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={currentUser.lastName || ""}
                onChange={(e) => setCurrentUser((u) => ({ ...u, lastName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={currentUser.email || ""}
                onChange={(e) => setCurrentUser((u) => ({ ...u, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={currentUser.address || ""}
                onChange={(e) => setCurrentUser((u) => ({ ...u, address: e.target.value }))}
              />
            </div>
            {formMode === "create" && (
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={currentUser.password || ""}
                  onChange={(e) => setCurrentUser((u) => ({ ...u, password: e.target.value }))}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={currentUser.isAdmin ? "ADMIN" : "USER"} onValueChange={(val) => setCurrentUser((u) => ({ ...u, isAdmin: val === "ADMIN" }))} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">USER</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : formMode === "create" ? "Create" : "Update"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {userToDelete && (
              <div className="space-y-2">
                <p><strong>Name:</strong> {userToDelete.firstName} {userToDelete.lastName}</p>
                <p><strong>Email:</strong> {userToDelete.email}</p>
                <p><strong>ID:</strong> {userToDelete.id}</p>
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>
                    <strong>Warning:</strong> This will delete the user and all their associated orders.
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
              Are you sure you want to delete {table.getFilteredSelectedRowModel().rows.length} selected users? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Warning:</strong> This will delete all selected users and their associated orders. This action cannot be undone.
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
              {bulkDeleteResults?.success} user(s) deleted successfully. {bulkDeleteResults?.failed} user(s) could not be deleted.
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
                    {bulkDeleteResults.failedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setBulkDeleteResults(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Excel Import Dialog */}
      <ExcelImportDialog<User>
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImportUsers}
        title="Import Users from Excel"
        description="Upload an Excel file containing user information to create multiple accounts at once."
        requiredFields={["firstName", "lastName", "email", "password"]}
        ignoredFields={["id", "createdAt", "updatedAt"]}
        additionalFields={["address", "isAdmin"]}
        fieldValidators={{
          email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
          password: (value) => value.length >= 6
        }}
        validateRow={(row) => {
          // Additional validation for user data
          if (row.isAdmin !== undefined && typeof row.isAdmin !== 'boolean') {
            // Convert string values to boolean
            if (typeof row.isAdmin === 'string') {
              row.isAdmin = row.isAdmin.toLowerCase() === 'true' || row.isAdmin.toLowerCase() === 'yes';
            } else {
              return { valid: false, reason: "isAdmin must be a boolean value" };
            }
          }
          return { valid: true };
        }}
      />
    </ProtectedRoute>
  );
};

export default ManageUsers;