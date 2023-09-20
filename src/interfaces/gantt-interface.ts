import { ChartBGProps } from './chart-bg-interface';
import { NavigatorProps } from './navigator-interface';
import { GanttNode } from './node-interface';

export interface GanttChart<T> {
  nodes: GanttNode<T>[]; // Array of nodes
  onNodeClick?: (node: GanttNode<T>) => void; // Callback function for when a node is clicked
  onNodeResize?: (node: GanttNode<T>) => boolean; // Callback function for when a node is resized
  toPosition?: (value: T) => number; // Function to convert a value to a position
  toValue?: (position: number) => T; // Function to convert a position to a value
  sideBarRenderer?: () => JSX.Element; // Function to render the sidebar
  chartProps?: ChartBGProps<T>; // Props for the chart
  navigatorProps?: NavigatorProps<T>; // Props for the navigator
  footerRenderer?: () => JSX.Element; // Function to render the footer
  valueInFocus?: T; // Value in focus
}
