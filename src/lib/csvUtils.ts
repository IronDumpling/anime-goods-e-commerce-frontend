/**
 * Utility functions for exporting data to CSV format
 */

/**
 * Converts a value to a CSV-safe string
 * @param value - The value to convert
 * @returns A CSV-safe string
 */
const escapeCSV = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If the value contains commas, quotes, or newlines, wrap it in quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    // Escape quotes by doubling them
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

/**
 * Converts an array of objects to a CSV string
 * @param data - Array of objects to convert
 * @returns CSV string
 */
export const convertToCSV = <T extends Record<string, any>>(data: T[]): string => {
  if (data.length === 0) {
    return '';
  }

  console.log("[convertToCSV] data:", data);

  // Extract keys from the first object
  const keys = Object.keys(data[0]);

  // Create header row using original keys
  const headerRow = keys.map(escapeCSV).join(',');

  // Create data rows
  const rows = data.map(item => {
    return keys
      .map(key => escapeCSV(item[key]))
      .join(',');
  });

  // Combine header and data rows
  const csv = [headerRow, ...rows].join('\n');
  console.log("CSV:", csv);
  return csv;
};

/**
 * Downloads a CSV string as a file
 * @param csvContent - The CSV content as a string
 * @param filename - The name of the file to download
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Create blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  // Set up download link
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

import { Table as TableInstance } from "@tanstack/react-table";

/**
 * Exports table data to CSV
 * @param table - TanStack table instance
 * @param filename - Name of the file to download
 * @param selectedOnly - Whether to export only selected rows
 * @param visibleColumnsOnly - Whether to export only visible columns
 */
export function exportTableToCSV(
  table: TableInstance<any>,
  filename: string,
  selectedOnly: boolean = true,
  visibleColumnsOnly: boolean = true
): void {
  // Get the rows to export based on selection, preserving the current order
  // This does not apply any additional sorting
  const rows = selectedOnly ? table.getFilteredSelectedRowModel().rows : table.getFilteredRowModel().rows;

  // Get columns based on visibility preference
  const columns = visibleColumnsOnly ? table.getVisibleFlatColumns() : table.getAllFlatColumns();

  // Filter out UI-specific columns that don't represent actual data
  const dataColumns = columns.filter(column => {
    const columnId = column.id;
    // Exclude columns that are used for UI purposes only
    return !['select', 'actions'].includes(columnId);
  });

  // Extract data
  const data = rows.map(row => {
    const rowData: Record<string, any> = {};
    dataColumns.forEach(column => {
      rowData[column.id] = row.getValue(column.id);
    });
    return rowData;
  });

  // Convert to CSV and download
  const csvContent = convertToCSV(data);
  downloadCSV(csvContent, filename);
}

/**
 * Parses a CSV string into an array of objects
 * @param csvString - The CSV string to parse
 * @returns Array of objects with keys from the header row
 */
export function parseCSV<T extends Record<string, any>>(csvString: string): T[] {
  if (!csvString.trim()) {
    return [];
  }

  // Split the CSV string into lines
  const lines = csvString.split(/\r?\n/);

  // Extract headers from the first line
  const headers = parseCSVLine(lines[0]);

  // Parse the data rows
  const result: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines

    const values = parseCSVLine(lines[i]);
    const row: Record<string, any> = {};

    // Map values to headers
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    result.push(row as T);
  }

  return result;
}

/**
 * Parses a single CSV line, handling quoted values correctly
 * @param line - A single line from a CSV file
 * @returns Array of values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        // Handle escaped quotes (double quotes)
        currentValue += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of field
      result.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  // Add the last value
  result.push(currentValue);

  return result;
}

/**
 * Reads a CSV file and returns its contents as an array of objects
 * @param file - The CSV file to read
 * @returns Promise that resolves to an array of objects
 */
export function readCSVFile<T extends Record<string, any>>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const csvString = event.target?.result as string;
        const data = parseCSV<T>(csvString);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Validates CSV data against a schema
 * @param data - The CSV data to validate
 * @param requiredFields - Array of field names that are required
 * @param fieldValidators - Object mapping field names to validation functions
 * @returns Object with validation results
 */
export function validateCSVData<T extends Record<string, any>>(
  data: T[],
  requiredFields: string[] = [],
  fieldValidators: Record<string, (value: any) => boolean> = {}
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for empty data
  if (data.length === 0) {
    errors.push('CSV file is empty');
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