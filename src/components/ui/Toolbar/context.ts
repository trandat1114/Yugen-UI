import * as React from "react";

export type ToolbarSize = "small" | "medium" | "large";
export type ToolbarOrientation = "horizontal" | "vertical";

export interface ToolbarContextValue {
  size: ToolbarSize;
  orientation: ToolbarOrientation;
}

export const TOOLBAR_DEFAULTS: ToolbarContextValue = { size: "medium", orientation: "horizontal" };

/**
 * Toolbar bao quanh; null = không nằm trong Toolbar. Nội bộ (không xuất ra index): component khác như
 * DataGridColumnPicker đọc để tự làm mục của Toolbar (data-toolbar-item, theo size).
 */
export const ToolbarContext = React.createContext<ToolbarContextValue | null>(null);
