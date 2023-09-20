import { BAND_WIDTH, NODE_HEIGHT } from '@/components/constants';
import { getDaysBetweenDates, getMonthsBetweenDates } from '@/utils';
import * as d3 from 'd3';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
export const SpaceTimeContext = createContext<{
  timeToSpaceMapper: (time: Date) => number;
  spaceToTimeMapper: (space: number) => Date;
  setNodePosition: (id: string, newPosition: { x: number; y: number; width: number | undefined }) => void;
  getNodePosition: (id: string) => { x: number; y: number; width: number | undefined } | undefined;
}>(null);

export interface SpaceTimeContextProvideProps {
  minStartTime: Date;
  maxEndTime: Date;
  timeRange: 'days' | 'months';
  children: React.ReactNode;
  nodes: any[];
}

export const SpaceTimeContextProvider = ({
  minStartTime,
  maxEndTime,
  timeRange,
  children,
  nodes,
}: SpaceTimeContextProvideProps) => {
  const [nodePositionsMap, setNodePositionsMap] = useState<
    Map<string, { x: number; y: number; width: number | undefined }>
  >(new Map());

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

  useEffect(() => {
    setNodePositionsMap(
      new Map(
        nodes.map((node: { id: any; interval: { start: Date; end: Date | undefined } }, index: number) => [
          node.id,
          {
            x: timeToSpaceMapper(node.interval.start),
            y: index * NODE_HEIGHT + 50,
            width: node.interval.end
              ? timeToSpaceMapper(node.interval.end) - timeToSpaceMapper(node.interval.start)
              : undefined,
          },
        ]),
      ),
    );
  }, [nodes, timeToSpaceMapper]);

  const setNodePosition = useCallback(
    (id: string, newPosition: { x: number; y: number; width: number | undefined }) => {
      setNodePositionsMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(id, newPosition);
        return newMap;
      });
    },
    [],
  );

  const getNodePosition = useCallback(
    (id: string) => {
      return nodePositionsMap.get(id);
    },
    [nodePositionsMap],
  );

  return (
    <SpaceTimeContext.Provider value={{ timeToSpaceMapper, spaceToTimeMapper, setNodePosition, getNodePosition }}>
      {children}
    </SpaceTimeContext.Provider>
  );
};
