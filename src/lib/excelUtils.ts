import * as XLSX from 'xlsx';
import { Table as TableInstance } from "@tanstack/react-table";

/**
 * Utility functions for exporting data to Excel format
 */

interface SheetData {
  name: string;
  data: any[];
}

/**
 * Converts data to Excel format and downloads it
 * @param sheets - Array of sheet data objects containing name and data
 * @param filename - The name of the file to download
 */
export function downloadExcel(sheets: SheetData[], filename: string): void {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  sheets.forEach(sheet => {
    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(sheet.data);

    // Auto-adjust column widths
    adjustColumnWidth(ws);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  });

  // Generate filename with timestamp if not provided
  const finalFilename = filename.endsWith('.xlsx')
    ? filename
    : `${filename}-${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`;

  // Save the file
  XLSX.writeFile(wb, finalFilename);
}

/**
 * Adjusts column widths based on content
 * @param ws - Excel worksheet
 */
function adjustColumnWidth(ws: XLSX.WorkSheet): void {
  const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
  const colLengths = (data as any[][]).reduce((acc: number[], row: any[]) => {
    row.forEach((cell, i) => {
      const cellLength = cell ? cell.toString().length : 0;
      acc[i] = Math.max(acc[i] || 0, cellLength);
    });
    return acc;
  }, [] as number[]);

  ws['!cols'] = colLengths.map((length: number) => ({ wch: length + 2 }));
}

/**
 * Exports table data to Excel
 * @param table - TanStack table instance
 * @param filename - Name of the file to download
 * @param selectedOnly - Whether to export only selected rows
 * @param visibleColumnsOnly - Whether to export only visible columns
 */
export function exportTableToExcel(
  table: TableInstance<any>,
  filename: string,
  selectedOnly: boolean = true,
  visibleColumnsOnly: boolean = true
): void {
  // Get the rows to export based on selection
  const rows = selectedOnly ? table.getFilteredSelectedRowModel().rows : table.getFilteredRowModel().rows;

  // Get columns based on visibility preference
  const columns = visibleColumnsOnly ? table.getVisibleFlatColumns() : table.getAllFlatColumns();

  // Filter out UI-specific columns
  const dataColumns = columns.filter(column => {
    const columnId = column.id;
    return !['select', 'actions'].includes(columnId);
  });

  // Extract data
  const data = rows.map(row => {
    const rowData: Record<string, any> = {};
    dataColumns.forEach(column => {
      // Get the raw value
      let value = row.getValue(column.id);

      // Format dates if the value is a date string
      if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
        value = new Date(value).toLocaleString();
      }

      rowData[column.id] = value;
    });
    return rowData;
  });

  // Create sheet data
  const sheets: SheetData[] = [{
    name: 'Data',
    data: data
  }];

  // Download Excel file
  downloadExcel(sheets, filename);
}

/**
 * Reads an Excel file and returns its contents
 * @param file - The Excel file to read
 * @returns Promise that resolves to an array of objects for each sheet
 */
export function readExcelFile(file: File): Promise<Record<string, any[]>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        const result: Record<string, any[]> = {};

        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          result[sheetName] = XLSX.utils.sheet_to_json(worksheet);
        });

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * Validates Excel data against a schema
 * @param data - The Excel data to validate
 * @param requiredFields - Array of field names that are required
 * @param fieldValidators - Object mapping field names to validation functions
 * @returns Object with validation results
 */
export function validateExcelData<T extends Record<string, any>>(
  data: T[],
  requiredFields: string[] = [],
  fieldValidators: Record<string, (value: any) => boolean> = {}
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for empty data
  if (data.length === 0) {
    errors.push('Excel file is empty');
    return { isValid: false, errors };
  }

  // Check for required fields
  const firstRow = data[0];
  const missingFields = requiredFields.filter(field => !(field in firstRow));

  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validate each row
  data.forEach((row, index) => {
    // Check required fields have values
    requiredFields.forEach(field => {
      if (field in row && (row[field] === null || row[field] === undefined || row[field] === '')) {
        errors.push(`Row ${index + 1}: Field "${field}" is required but empty`);
      }
    });

    // Apply custom validators
    Object.entries(fieldValidators).forEach(([field, validator]) => {
      if (field in row && !validator(row[field])) {
        errors.push(`Row ${index + 1}: Field "${field}" has an invalid value: ${row[field]}`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}