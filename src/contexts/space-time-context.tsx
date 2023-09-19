import { BAND_WIDTH } from '@/components/constants';
import { getDaysBetweenDates, getMonthsBetweenDates } from '@/utils';
import * as d3 from 'd3';
import { createContext, useCallback, useMemo } from 'react';
export const SpaceTimeContext = createContext<{
  timeToSpaceMapper: (time: Date) => number;
  spaceToTimeMapper: (space: number) => Date;
}>(null);

export interface SpaceTimeContextProvideProps {
  minStartTime: Date;
  maxEndTime: Date;
  timeRange: 'days' | 'months';
  children: React.ReactNode;
}

export const SpaceTimeContextProvider = ({
  minStartTime,
  maxEndTime,
  timeRange,
  children,
}: SpaceTimeContextProvideProps) => {
  const MAX_WIDTH = useMemo(() => {
    return (
      BAND_WIDTH *
      (timeRange === 'days'
        ? getDaysBetweenDates(minStartTime, maxEndTime)
        : getMonthsBetweenDates(minStartTime, maxEndTime) + 2)
    );
  }, [maxEndTime, minStartTime, timeRange]);

  const internalTimeToSpace = useMemo(() => {
    return d3.scaleLinear().domain([minStartTime, maxEndTime]).range([0, MAX_WIDTH]);
  }, [MAX_WIDTH, maxEndTime, minStartTime]);

  const internalSpaceToTimeMapper = useMemo(() => {
    return d3.scaleLinear().domain([0, MAX_WIDTH]).range([minStartTime.valueOf(), maxEndTime.valueOf()]);
  }, [MAX_WIDTH, maxEndTime, minStartTime]);

  const timeToSpaceMapper = useCallback(
    (time: Date) => {
      return internalTimeToSpace(time);
    },
    [internalTimeToSpace],
  );

  const spaceToTimeMapper = useCallback(
    (x: number): Date => {
      return new Date(internalSpaceToTimeMapper(x));
    },
    [internalSpaceToTimeMapper],
  );

  return (
    <SpaceTimeContext.Provider value={{ timeToSpaceMapper, spaceToTimeMapper }}>{children}</SpaceTimeContext.Provider>
  );
};
