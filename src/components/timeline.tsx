import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { TimelineNode, TimelineNodeInterface } from './timeline-node';
import { BAND_WIDTH, NODE_HEIGHT } from './constants';
import { parts } from './data';
import { addDays, addMonths, eachDayOfInterval, eachMonthOfInterval, set } from 'date-fns';
import { getDaysBetweenDates, getMonthsBetweenDates } from '@/utils';
import { SpaceTimeContextProvider } from '@/contexts/space-time-context';

export interface TimelineInterface {
  nodes: TimelineNodeInterface[];
  nodeInView: string;
  timerange: 'days' | 'months';
}

export const Timeline = ({ nodes, nodeInView, timerange }: TimelineInterface) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<SVGGElement>(null);
  const todayRef = useRef<SVGGElement>(null);
  const [maxEndTime, setMaxEndTime] = React.useState<Date>(new Date());
  const [minStartTime, setMinStartTime] = React.useState<Date>(new Date());
  const [rangeStart, setRangeStart] = React.useState<number>(0);
  const [rangeEnd, setRangeEnd] = React.useState<number>(0);
  const [scrollLeft, setScrollLeft] = React.useState<number>(0);
  const [clientWidth, setClientWidth] = React.useState<number>(0);
  // const [nodes, setNodes] = React.useState<TimelineNodeInterface[]>(nodes);

  useEffect(() => {
    new ResizeObserver(() => {
      setClientWidth(divRef.current?.clientWidth ?? 0);
    }).observe(divRef.current as any);
  }, []);

  useEffect(() => {
    const mx = nodes
      .filter((node) => node.interval.end)
      .map((node) => node.interval.end)
      .reduce(function (a, b) {
        return a > b ? a : b;
      });
    if (timerange === 'days') setMaxEndTime(mx > addDays(new Date(), 1) ? mx : addDays(new Date(), 1));
    else setMaxEndTime(mx > addMonths(new Date(), 1) ? mx : addMonths(new Date(), 1));

    setMinStartTime(
      timerange === 'days'
        ? addDays(
            nodes
              .map((node) => node.interval.start)
              .reduce(function (a, b) {
                return a < b ? a : b;
              }),
            -20,
          )
        : addMonths(
            nodes
              .map((node) => node.interval.start)
              .reduce(function (a, b) {
                return a < b ? a : b;
              }),
            -20,
          ),
    );
    divRef.current.scrollLeft += BAND_WIDTH * 20;
  }, [nodes, timerange]);

  const MAX_WIDTH = useMemo(() => {
    return (
      BAND_WIDTH *
      (timerange === 'days'
        ? getDaysBetweenDates(minStartTime, maxEndTime)
        : getMonthsBetweenDates(minStartTime, maxEndTime) + 2)
    );
  }, [maxEndTime, minStartTime, timerange]);

  useEffect(() => {
    setRangeEnd(MAX_WIDTH);
    setRangeStart(0);
  }, [MAX_WIDTH]);

  const x = useMemo(
    () => d3.scaleLinear().domain([minStartTime, maxEndTime]).range([rangeStart, rangeEnd]),
    [maxEndTime, minStartTime, rangeEnd, rangeStart],
  );

  const getTimeFromX = useCallback(() => {
    return d3.scaleLinear().domain([rangeStart, rangeEnd]).range([minStartTime, maxEndTime]);
  }, [MAX_WIDTH, maxEndTime, minStartTime, timerange]);

  const [nodePositions, setNodePositions] = React.useState<
    {
      x: number;
      y: number;
      id: string;
    }[]
  >(
    nodes.map((node, i) => {
      return { x: x(node.interval.start) ?? 0, y: NODE_HEIGHT * i + 50, id: node.id };
    }),
  );

  useEffect(() => {
    setNodePositions(
      nodes.map((node, i) => {
        return { x: x(node.interval.start) ?? 0, y: NODE_HEIGHT * i + 50, id: node.id };
      }),
    );
  }, [nodes, timerange, x]);

  const color = d3.scaleOrdinal(d3.schemeSet2).domain(nodes.map((node) => node.id));

  // useEffect(() => {
  //   d3.select(divRef.current).node().scrollLeft = (divRef.current?.scrollLeft ?? 0) + BAND_WIDTH * 20;
  // }, []);

  useEffect(() => {
    d3.select(linesRef.current)
      .attr('width', Math.max(x(maxEndTime) - x(minStartTime) ?? 0, 10000) + 20)
      .attr('height', NODE_HEIGHT * nodes.length + 20);

    d3.select(svgRef.current)
      .attr('width', Math.max(x(maxEndTime) - x(minStartTime) ?? 0, 10000) + 20)
      .attr('height', NODE_HEIGHT * nodes.length + 20);

    const d3array =
      timerange === 'days'
        ? eachDayOfInterval({
            start: minStartTime,
            end:
              maxEndTime > addDays(minStartTime, Math.floor(10000 / BAND_WIDTH))
                ? maxEndTime
                : addDays(minStartTime, Math.floor(10000 / BAND_WIDTH)),
          })
        : eachMonthOfInterval({
            start: minStartTime,
            end:
              maxEndTime > addMonths(minStartTime, Math.floor(10000 / BAND_WIDTH))
                ? maxEndTime
                : addMonths(minStartTime, Math.floor(10000 / BAND_WIDTH)),
          });
    d3.selectAll(linesRef.current?.childNodes).remove();
    d3array.forEach((date, i) => {
      d3.select(linesRef.current)
        .append('text')
        .attr('x', x(date) ?? 0 + 5)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .text(
          `${date.toLocaleString(
            'default',
            timerange === 'days' ? { day: 'numeric', month: 'short' } : { month: 'short', year: 'numeric' },
          )}`,
        )
        .style('background-color', 'white');
      d3.select(linesRef.current)
        .append('line')
        .attr('x1', x(date) ?? 0 + 20)
        .attr('x2', x(date) ?? 0 + 20)
        .attr('y1', 0)
        .attr('y2', NODE_HEIGHT * nodes.length + 50)
        .attr('stroke', 'black')
        .attr('stroke-dasharray', '5,5');
    });
  }, [maxEndTime, minStartTime, nodes.length, timerange, x]);

  return (
    <SpaceTimeContextProvider minStartTime={minStartTime} maxEndTime={maxEndTime} timeRange={timerange}>
    <div
      className=" bg-white w-full h-full overflow-scroll"
      ref={divRef}
      onScroll={() => {
        // console.log(divRef.current?.scrollLeft, divRef.current?.scrollWidth, divRef.current?.offsetWidth);
        if (
          divRef.current &&
          divRef.current.scrollLeft >= divRef.current?.scrollWidth - divRef.current?.offsetWidth - 10
        ) {
          setMaxEndTime(timerange === 'days' ? addDays(maxEndTime, 10) : addMonths(maxEndTime, 10));
          setRangeEnd(rangeEnd + BAND_WIDTH * 10);
        }
        if (divRef.current && divRef.current.scrollLeft === 0) {
          setMinStartTime(timerange === 'days' ? addDays(minStartTime, -10) : addMonths(minStartTime, -10));
          setRangeStart(rangeStart - BAND_WIDTH * 10);
          divRef.current.scrollLeft += BAND_WIDTH * 10;
        }
        setScrollLeft(divRef.current?.scrollLeft ?? 0);
      }}
      onResize={() => {
        console.log(divRef.current?.getBoundingClientRect());
        setClientWidth(divRef.current?.offsetWidth ?? 0);
      }}
    >
      <svg width={10000} height={NODE_HEIGHT * nodes.length + 50} overflow={'auto'} ref={svgRef}>
        {/* <rect x={0} y={0} height={NODE_HEIGHT * nodes.length + 20} width={x(new Date())} /> */}
        <defs>
          <pattern id="dashed" width="15" height="15" patternUnits="userSpaceOnUse">
            <line x1="15" y1="0" x2="0" y2="15" style={{ stroke: 'gray', strokeWidth: 1 }} />
          </pattern>
        </defs>
        <rect width={x(new Date())} height="100%" fill="url(#dashed)" />

        <g ref={linesRef}></g>
        {/* <line x1={200} x2={200} y1={0} y2={NODE_HEIGHT * nodes.length} stroke="blue" />
        <foreignObject x={100} y={20} width={200} height={100}>
          <div className=" h-10 w-full rounded-md flex justify-center items-center bg-sky-400"> Beta Launch</div>
        </foreignObject>
        <line x1={x(new Date())} x2={x(new Date())} y1={0} y2={NODE_HEIGHT * nodes.length} stroke="blue" /> */}
        <foreignObject x={x(new Date()) - 100} y={20} width={200} height={100} ref={todayRef}>
          <div className=" h-10 w-full rounded-md flex justify-center items-center bg-sky-400"> {'Today'}</div>
        </foreignObject>
        <g className="h-full w-full" ref={groupRef}>
          {nodes.map((node, i) => (
            <TimelineNode
              key={i}
              interval={node.interval}
              id={node.id}
              y={nodePositions[i].y}
              x={nodePositions[i].x}
              width={
                !isNaN(node.interval.end.getDate()) ? (x(node.interval.end) ?? 0) - (x(node.interval.start) ?? 0) : 300
              }
              height={NODE_HEIGHT}
              onRowChange={(id, x, y) => {
                const row = Math.floor(y / NODE_HEIGHT);
                const draggedNode = nodePositions.find((node) => node.id === id);
                const newNodePosition = nodePositions.map((nodePosition, i) => {
                  if (Math.floor(nodePosition.y / NODE_HEIGHT) === row) {
                    return { x: nodePosition.x, y: draggedNode?.y ?? 0, id: nodePosition.id };
                  }
                  if (nodePosition.id === id) {
                    return { x: x as number, y: y as number, id: nodePosition.id };
                  }
                  return nodePosition;
                });

                setNodePositions(newNodePosition);
              }}
              fill={color(node.id)}
              band={timerange === 'days' ? BAND_WIDTH : BAND_WIDTH / 30}
              nodeToShow={nodeInView}
              getTimeFromX={getTimeFromX}
              onResizeNode={(id, interval) => {
                // console.log(id, interval);
              }}
              scrollLeft={scrollLeft}
              clientWidth={clientWidth}
              divRef={divRef}
            />
          ))}
        </g>
      </svg>
      {/* <DateLines x={x}/> */}
    </div>
    </SpaceTimeContextProvider>
  );
};
