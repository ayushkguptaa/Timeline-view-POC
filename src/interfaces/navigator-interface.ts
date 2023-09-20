import { GanttNode } from './node-interface';

export interface NavigatorProps<T> {
  showLeftNavigator?: boolean; // Whether or not to show the left navigator
  showRightNavigator?: boolean; // Whether or not to show the right navigator
  onNavigatorClick?: (value: GanttNode<T>) => void; //  Callback function for when a navigator is clicked
  ganttRef?: React.RefObject<HTMLDivElement>; // Reference to the gantt chart
  leftNavigatorRenderer?: (value: GanttNode<T>) => JSX.Element; // Function to render the left navigator
  rightNavigatorRenderer?: (value: GanttNode<T>) => JSX.Element; // Function to render the right navigator
}
