import React, { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { readExcelFile, validateExcelData } from "@/lib/excelUtils";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";

interface ImportResult<T> {
  success: T[];
  failed: {
    row: number;
    data: any;
    reason: string;
  }[];
}

interface ExcelImportDialogProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: T[]) => Promise<ImportResult<T>>;
  title: string;
  description: string;
  requiredFields: string[];
  ignoredFields?: string[];
  validateRow?: (row: any) => { valid: boolean; reason?: string };
  fieldValidators?: Record<string, (value: any) => boolean>;
  additionalFields?: string[];
  existingData?: T[];
  isDuplicate?: (a: T, b: T) => boolean;
}

function ExcelImportDialog<T>({
  open,
  onOpenChange,
  onImport,
  title,
  description,
  requiredFields,
  ignoredFields = [],
  validateRow,
  fieldValidators = {},
  additionalFields = [],
  existingData = [],
  isDuplicate,
}: ExcelImportDialogProps<T>) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult<T> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError("Please upload an Excel file (.xlsx or .xls)");
      }
    }
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError("Please upload an Excel file (.xlsx or .xls)");
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Read the Excel file using the utility function
      const excelData = await readExcelFile(selectedFile);

      // Get the first sheet data
      const sheetName = Object.keys(excelData)[0];
      if (!sheetName) {
        setError("Excel file is empty");
        return;
      }

      const data = excelData[sheetName];

      if (data.length === 0) {
        setError("Excel file has no data rows");
        return;
      }

      // Validate the data using the utility function
      const validationResult = validateExcelData(
        data,
        requiredFields,
        fieldValidators
      );

      if (!validationResult.isValid) {
        setError(`Validation errors: ${validationResult.errors.join(', ')}`);
        return;
      }

      // Process each row
      const processedData: T[] = [];
      const failedRows: { row: number; data: any; reason: string }[] = [];
      const localSeen: T[] = [];

      for (let i = 0; i < data.length; i++) {
        const rowData = data[i];

        // Filter out ignored fields
        const filteredData: any = {};
        Object.keys(rowData).forEach(key => {
          if (!ignoredFields.includes(key)) {
            filteredData[key] = rowData[key];
          }
        });

        // Additional validation if provided
        if (validateRow) {
          const validationResult = validateRow(filteredData);
          if (!validationResult.valid) {
            failedRows.push({
              row: i + 2, // +2 because of 0-indexing and header row
              data: filteredData,
              reason: validationResult.reason || 'Validation failed'
            });
            continue;
          }
        }

        const isDupExisting = existingData.some(item => isDuplicate?.(item, filteredData));
        const isDupLocal = localSeen.some(item => isDuplicate?.(item, filteredData));
        if (isDupExisting || isDupLocal) {
          failedRows.push({
            row: i + 2,
            data: filteredData,
            reason: 'Duplicate entry (already exists or repeated in file)'
          });
          continue;
        }

        processedData.push(filteredData as T);
        localSeen.push(filteredData as T);
      }

      if (processedData.length === 0) {
        setError("No valid data found in the Excel file");
        return;
      }

      // Import the data
      const results = await onImport(processedData);
      setImportResults(results);

      // Show summary toast
      if (results.success.length > 0) {
        toast.success(`Successfully imported ${results.success.length} items`);
      }
      if (results.failed.length > 0) {
        toast.error(`Failed to import ${results.failed.length} items`);
      }
    } catch (error) {
      console.error("Error processing Excel file:", error);
      setError("Error processing Excel file");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setImportResults(null);
    setSelectedFile(null);
    setError(null);
    onOpenChange(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-[90vw] sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {!importResults ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                <p>Please upload an Excel file with the following required columns:</p>
                <ul className="list-disc pl-5 mt-2">
                  {requiredFields.map(field => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
                {additionalFields.length > 0 && (
                  <>
                    <p className="mt-2">Additional fields (optional):</p>
                    <ul className="list-disc pl-5 mt-2">
                      {additionalFields.map(field => (
                        <li key={field}>{field}</li>
                      ))}
                    </ul>
                  </>
                )}
                {ignoredFields.length > 0 && (
                  <>
                    <p className="mt-2">The following fields will be ignored:</p>
                    <ul className="list-disc pl-5 mt-2">
                      {ignoredFields.map(field => (
                        <li key={field}>{field}</li>
                      ))}
                    </ul>
                  </>
                )}
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                id="excel-import"
                disabled={isProcessing}
              />

              <div className="flex flex-col items-center justify-center">
                <FileSpreadsheet className="w-8 h-8 text-gray-400 mb-2" />
                <p className="mb-1 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">Excel files (.xlsx, .xls)</p>
              </div>
            </div>

            {selectedFile && (
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-sm font-medium mb-2">Selected file:</p>
                <div className="flex items-center justify-between bg-white p-2 rounded">
                  <div className="flex items-center">
                    <FileSpreadsheet className="w-6 h-6 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="h-8 w-8 p-0"
                  >
                    <Upload className="h-4 w-4 rotate-180" />
                  </Button>
                </div>
                <Button
                  onClick={handleImport}
                  disabled={isProcessing}
                  className="w-full mt-3"
                >
                  {isProcessing ? "Processing..." : "Import"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-md">
                <h3 className="font-medium text-green-800">Successful Imports</h3>
                <p className="text-2xl font-bold text-green-600">{importResults.success.length}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-md">
                <h3 className="font-medium text-red-800">Failed Imports</h3>
                <p className="text-2xl font-bold text-red-600">{importResults.failed.length}</p>
              </div>
            </div>

            {importResults.failed.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Failed Rows:</h3>
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Row</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {importResults.failed.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.row}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            <pre className="text-xs overflow-auto max-h-20">{JSON.stringify(item.data, null, 2)}</pre>
                          </td>
                          <td className="px-4 py-2 text-sm text-red-600">{item.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            {importResults ? "Close" : "Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ExcelImportDialog;