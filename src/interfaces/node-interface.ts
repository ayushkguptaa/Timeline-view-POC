export interface GanttNode<T> {
  start: T; // Start value of the node
  end: T; // End value of the node
  id: string; // Unique id of the node
  renderer?: (node: GanttNode<T>) => JSX.Element; // Function to render the node
  isLeftResizable?: boolean; // Whether or not the node is left resizable
  isRightResizable?: boolean; // Whether or not the node is right resizable
  name: string; // Name of the node
}

export interface GanttNodeProps<T> {
  node: GanttNode<T>; // Node
  toPosition: (value: T) => number; // Function to convert a value to a position
  toValue: (position: number) => T; // Function to convert a position to a value
  onResize: (node: GanttNode<T>) => boolean; // Callback function for when a node is resized
  onClick: (node: GanttNode<T>) => void; // Callback function for when a node is clicked
  onPositionChange: (node: GanttNode<T>) => void; // Callback function for when a node's position changes
}
