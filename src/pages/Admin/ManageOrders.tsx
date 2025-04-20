import React, { useEffect, useState, useMemo } from 'react';
import { get, ApiError, patch } from "@/lib/api";
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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
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
import { downloadExcel } from "@/lib/excelUtils";
import { Order } from "@/lib/types";
import { Badge } from '@/components/ui/Badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";


const ManageOrders: React.FC = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Add state for view dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');

  // Add status options constant
  const STATUS_OPTIONS = [
    { label: "All", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Processing", value: "PROCESSING" },
    { label: "Shipped", value: "SHIPPED" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  // Define columns inside the component to access state variables
  const columns: ColumnDef<Order>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Order ID<ArrowUpDown className="ml-2 h-4 w-4" /></Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "userId",
      header: "Customer",
      cell: ({ row }) => {
        const userId = row.original.userId;
        const user = row.original.user;
        return <div>
          <Badge
            variant="default"
            className="flex-shrink-0 mr-2"
          >
            id = {userId}
          </Badge>
          {user?.firstName && user?.lastName ? (
            <Link to={`/admin/orders?userId=${userId}`}>
              {user.firstName} {user.lastName}
            </Link>
          ) : (
            <span className="text-gray-500">Unknown Customer</span>
          )}
        </div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "default";
        let badgeColor = "";

        switch (status) {
          case "PENDING":
            badgeVariant = "outline";
            badgeColor = "bg-yellow-100 text-yellow-800 border-yellow-300";
            break;
          case "PROCESSING":
            badgeVariant = "outline";
            badgeColor = "bg-blue-100 text-blue-800 border-blue-300";
            break;
          case "SHIPPED":
            badgeVariant = "outline";
            badgeColor = "bg-green-100 text-green-800 border-green-300";
            break;
          case "DELIVERED":
            badgeVariant = "outline";
            badgeColor = "bg-purple-100 text-purple-800 border-purple-300";
            break;
          case "CANCELLED":
            badgeVariant = "outline";
            badgeColor = "bg-red-100 text-red-800 border-red-300";
            break;
          default:
            badgeVariant = "secondary";
        }

        return (
          <Badge
            variant={badgeVariant}
            className={`${badgeColor} capitalize`}
          >
            {status.toLowerCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
    },
    {
      accessorKey: "updatedAt",
      header: "Updated At",
    },
    {
      id: "summary",
      header: "Items Count",
      cell: ({ row }) => {
        const order = row.original;
        const totalItems = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
        return (
          <div className="font-medium">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      header: "Actions",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(order.id.toString())}>
                Copy Order ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setCurrentOrder(order);
                setViewDialogOpen(true);
              }}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Set Status</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          const response = await patch(`/api/order/${order.id}/status`, {
                            status: "PENDING"
                          });

                          if (response.error) {
                            throw response.error;
                          }

                          toast.success("Order status updated to Pending");

                          // Refresh the orders list
                          const refreshed = await get<{ orders: Order[] }>("/api/order?take=100");
                          if (refreshed.error || !refreshed.data) {
                            throw refreshed.error || { error: "Failed to refresh order data" };
                          }
                          setOrders(refreshed.data.orders);
                        } catch (error) {
                          console.error("Failed to update order status:", error);
                          const apiError = error as ApiError;
                          const errorMessage = apiError.details && apiError.details.length > 0
                            ? `${apiError.error}: ${apiError.details.join(', ')}`
                            : apiError.error || "An error occurred while updating order status";
                          toast.error(errorMessage);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className={order.status === "PENDING" ? "bg-yellow-50 text-yellow-700" : ""}
                    >
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          const response = await patch(`/api/order/${order.id}/status`, {
                            status: "PROCESSING"
                          });

                          if (response.error) {
                            throw response.error;
                          }

                          toast.success("Order status updated to Processing");

                          // Refresh the orders list
                          const refreshed = await get<{ orders: Order[] }>("/api/order?take=100");
                          if (refreshed.error || !refreshed.data) {
                            throw refreshed.error || { error: "Failed to refresh order data" };
                          }
                          setOrders(refreshed.data.orders);
                        } catch (error) {
                          console.error("Failed to update order status:", error);
                          const apiError = error as ApiError;
                          const errorMessage = apiError.details && apiError.details.length > 0
                            ? `${apiError.error}: ${apiError.details.join(', ')}`
                            : apiError.error || "An error occurred while updating order status";
                          toast.error(errorMessage);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className={order.status === "PROCESSING" ? "bg-blue-50 text-blue-700" : ""}
                    >
                      Processing
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          const response = await patch(`/api/order/${order.id}/status`, {
                            status: "SHIPPED"
                          });

                          if (response.error) {
                            throw response.error;
                          }

                          toast.success("Order status updated to Shipped");

                          // Refresh the orders list
                          const refreshed = await get<{ orders: Order[] }>("/api/order?take=100");
                          if (refreshed.error || !refreshed.data) {
                            throw refreshed.error || { error: "Failed to refresh order data" };
                          }
                          setOrders(refreshed.data.orders);
                        } catch (error) {
                          console.error("Failed to update order status:", error);
                          const apiError = error as ApiError;
                          const errorMessage = apiError.details && apiError.details.length > 0
                            ? `${apiError.error}: ${apiError.details.join(', ')}`
                            : apiError.error || "An error occurred while updating order status";
                          toast.error(errorMessage);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className={order.status === "SHIPPED" ? "bg-green-50 text-green-700" : ""}
                    >
                      Shipped
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          const response = await patch(`/api/order/${order.id}/status`, {
                            status: "DELIVERED"
                          });

                          if (response.error) {
                            throw response.error;
                          }

                          toast.success("Order status updated to Delivered");

                          // Refresh the orders list
                          const refreshed = await get<{ orders: Order[] }>("/api/order?take=100");
                          if (refreshed.error || !refreshed.data) {
                            throw refreshed.error || { error: "Failed to refresh order data" };
                          }
                          setOrders(refreshed.data.orders);
                        } catch (error) {
                          console.error("Failed to update order status:", error);
                          const apiError = error as ApiError;
                          const errorMessage = apiError.details && apiError.details.length > 0
                            ? `${apiError.error}: ${apiError.details.join(', ')}`
                            : apiError.error || "An error occurred while updating order status";
                          toast.error(errorMessage);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className={order.status === "DELIVERED" ? "bg-purple-50 text-purple-700" : ""}
                    >
                      Delivered
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          const response = await patch(`/api/order/${order.id}/status`, {
                            status: "CANCELLED"
                          });

                          if (response.error) {
                            throw response.error;
                          }

                          toast.success("Order status updated to Cancelled");

                          // Refresh the orders list
                          const refreshed = await get<{ orders: Order[] }>("/api/order?take=100");
                          if (refreshed.error || !refreshed.data) {
                            throw refreshed.error || { error: "Failed to refresh order data" };
                          }
                          setOrders(refreshed.data.orders);
                        } catch (error) {
                          console.error("Failed to update order status:", error);
                          const apiError = error as ApiError;
                          const errorMessage = apiError.details && apiError.details.length > 0
                            ? `${apiError.error}: ${apiError.details.join(', ')}`
                            : apiError.error || "An error occurred while updating order status";
                          toast.error(errorMessage);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className={order.status === "CANCELLED" ? "bg-red-50 text-red-700" : ""}
                    >
                      Cancelled
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // TODO(yushun): apply pagination if needed
        const endpoint = userId
          ? `/api/order/user/${userId}`
          : "/api/order?take=100";

        if (userId) {
          const response = await get<Order[]>(endpoint);
          if (response.error || !response.data) {
            throw response.error || { error: "Unknown Error ManageOrders" };
          }
          const data = response.data;
          console.log("Orders: ", data);
          setOrders(data);

          // Update page title only if we have orders with valid user data
          if (data.length > 0 && data[0].user?.firstName && data[0].user?.lastName) {
            document.title = `Orders for ${data[0].user.firstName} ${data[0].user.lastName}`;
          } else {
            document.title = "Customer Orders";
          }
        } else {
          const response = await get<{ orders: Order[] }>(endpoint);
          if (response.error || !response.data) {
            throw response.error || { error: "Unknown Error ManageOrders" };
          }
          const data = response.data.orders;
          console.log("Orders: ", data);
          setOrders(data);
          document.title = "Manage Orders";
        }
      } catch (error) {
        const apiError = error as ApiError;
        const errorMessage = apiError.details && apiError.details.length > 0
          ? `${apiError.error}: ${apiError.details.join(', ')}`
          : apiError.error || "Error fetching orders";
        toast.error(errorMessage);
        console.error('Error fetching orders:', error);
        setOrders([]); // Reset orders on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  // Memoize the filtered data
  const filteredData = useMemo(() => {
    return orders.filter(order => statusFilter === "ALL" || order.status === statusFilter);
  }, [orders, statusFilter]);

  const table = useReactTable({
    data: filteredData,
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
        (row.original.user?.firstName?.toLowerCase() || "").includes(searchValue) ||
        (row.original.user?.lastName?.toLowerCase() || "").includes(searchValue)
      );
    },
  });

  const handleExportOrders = () => {
    const selectedOrders = table.getFilteredSelectedRowModel().rows.map(row => row.original);
    const ordersData = selectedOrders.map(order => ({
      'Order ID': order.id,
      'Customer ID': order.userId,
      'Customer Name': `${order.user?.firstName || ''} ${order.user?.lastName || ''}`,
      'Customer Email': order.user?.email || '',
      'Status': order.status,
      'Created At': new Date(order.createdAt).toLocaleString(),
      'Updated At': new Date(order.updatedAt).toLocaleString(),
      'Total Amount': order.orderItems.reduce((sum, item) =>
        sum + (item.quantity * item.unitPrice), 0).toFixed(2)
    }));

    const orderItemsData = selectedOrders.flatMap(order =>
      order.orderItems.map(item => ({
        'Order ID': order.id,
        'Product ID': item.productId,
        'Product Name': item.product?.name || '',
        'Quantity': item.quantity,
        'Unit Price': item.unitPrice.toFixed(2),
        'Total Price': (item.quantity * item.unitPrice).toFixed(2)
      }))
    );

    downloadExcel([
      { name: 'Orders', data: ordersData },
      { name: 'Order Items', data: orderItemsData }
    ], 'selected-orders-export');
  };

  const handleExportAllOrders = () => {
    const allOrders = table.getFilteredRowModel().rows.map(row => row.original);
    const ordersData = allOrders.map(order => ({
      'Order ID': order.id,
      'Customer ID': order.userId,
      'Customer Name': `${order.user?.firstName || ''} ${order.user?.lastName || ''}`,
      'Customer Email': order.user?.email || '',
      'Status': order.status,
      'Created At': new Date(order.createdAt).toLocaleString(),
      'Updated At': new Date(order.updatedAt).toLocaleString(),
      'Total Amount': order.orderItems.reduce((sum, item) =>
        sum + (item.quantity * item.unitPrice), 0).toFixed(2)
    }));

    const orderItemsData = allOrders.flatMap(order =>
      order.orderItems.map(item => ({
        'Order ID': order.id,
        'Product ID': item.productId,
        'Product Name': item.product?.name || '',
        'Quantity': item.quantity,
        'Unit Price': item.unitPrice.toFixed(2),
        'Total Price': (item.quantity * item.unitPrice).toFixed(2)
      }))
    );

    downloadExcel([
      { name: 'Orders', data: ordersData },
      { name: 'Order Items', data: orderItemsData }
    ], 'all-orders-export');
  };

  return (
    <ProtectedRoute accessLevel="admin">
      <div className="container mx-auto py-10">
        <div className="flex items-center mb-6">
          <BackButton
            to={userId ? '/admin/orders' : '/admin'}
            label={userId ? 'Back to All Orders' : 'Back to Admin Page'}
          />
        </div>
        <h1 className="text-2xl font-bold mb-6">
          {userId && orders.length > 0 && orders[0].user?.firstName && orders[0].user?.lastName
            ? `Orders for ${orders[0].user.firstName} ${orders[0].user.lastName}`
            : userId ? "Customer Orders" : "Manage Orders"
          }
        </h1>
        <div className="w-full">
          <div className="flex items-center py-4 space-x-4">
            <Input
              placeholder="Search by order number, customer name, or email..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Status: {STATUS_OPTIONS.find(opt => opt.value === statusFilter)?.label}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {STATUS_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onSelect={() => setStatusFilter(option.value)}
                  >
                    <span className={statusFilter === option.value ? "font-medium" : ""}>
                      {option.label}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-4">
                  Bulk Actions <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={handleExportOrders}
                  disabled={table.getFilteredSelectedRowModel().rows.length === 0}
                >
                  Export selected
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleExportAllOrders}
                >
                  Export all
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

        {/* View Order Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            {currentOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-medium text-lg mb-4">Order Information</h3>
                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <span className="font-semibold">Order ID:</span>
                        <span>{currentOrder.id}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">Status:</span>
                        <Badge
                          variant="outline"
                          className={
                            currentOrder.status === "PENDING" ? "bg-yellow-100 text-yellow-800 border-yellow-300" :
                            currentOrder.status === "PROCESSING" ? "bg-blue-100 text-blue-800 border-blue-300" :
                            currentOrder.status === "SHIPPED" ? "bg-green-100 text-green-800 border-green-300" :
                            currentOrder.status === "DELIVERED" ? "bg-purple-100 text-purple-800 border-purple-300" :
                            "bg-red-100 text-red-800 border-red-300"
                          }
                        >
                          {currentOrder.status.toLowerCase()}
                        </Badge>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">Created:</span>
                        <span>{new Date(currentOrder.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">Updated:</span>
                        <span>{new Date(currentOrder.updatedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-4">Customer Information</h3>
                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <span className="font-semibold">Name:</span>
                        <span>{currentOrder.user.firstName} {currentOrder.user.lastName}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">Email:</span>
                        <span>{currentOrder.user.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-4">Order Items</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentOrder.orderItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              {item.product?.name ? (
                                <button
                                  onClick={() => navigate(`/products/${item.productId}`)}
                                  className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                                >
                                  {item.product.name}
                                </button>
                              ) : (
                                <span className="text-gray-500">Product Unavailable</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-medium">
                            Total:
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            ${currentOrder.orderItems.reduce((total, item) =>
                              total + (item.quantity * item.unitPrice), 0).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
};

export default ManageOrders;