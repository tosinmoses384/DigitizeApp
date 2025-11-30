/**
 * Common types and interfaces used across the application
 */

// Dropdown option interface for select components
export interface DropdownOption {
  key: string;
  value: string;
}

// Toast notification details interface
export interface ToastDetails {
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration: number;
}