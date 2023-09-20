export interface ChartBGProps<T> {
  tickValues: T[]; // Array of tick values
  onScrollLeft?: (ganttRef: React.RefObject<HTMLDivElement>) => void; // Callback function for when the start value changes
  onScrollRight?: (ganttRef: React.RefObject<HTMLDivElement>) => void; // Callback function for when the end value changes
  tickRenderer?: (value: T) => JSX.Element; // Function to render a tick
  showShadedRegion?: boolean; // Whether or not to show the shaded region
  shadedRegionStartValue?: T; // Start value of the shaded region
  shadedRegionEndValue?: T; // End value of the shaded region
}
