import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { TimelineNode, TimelineNodeInterface } from './timeline-node';
import { NODE_HEIGHT } from './constants';
import { DateLines } from './date-lines';

export interface TimelineInterface {
  nodes: TimelineNodeInterface[];
}

export const Timeline = ({ nodes }: TimelineInterface) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  // const [nodes, setNodes] = React.useState<TimelineNodeInterface[]>(nodes);
  const maxEndTime = useMemo(() => {
    return Math.max(...nodes.map((node) => node.interval.end));
  }, [nodes]);

  const maxStartTime = useMemo(() => {
    return Math.max(...nodes.map((node) => node.interval.start));
  }, [nodes]);
  const x = useMemo(() => d3.scaleLinear().domain([0, nodes.length]).range([0, maxEndTime]), [maxEndTime, nodes]);

  const [nodePositions, setNodePositions] = React.useState<
    {
      x: number;
      y: number;
      id: string;
    }[]
  >( nodes.map((node, i) => {
    // console.log('nodePosition', i, x)
    return { x: node.interval.start, y: NODE_HEIGHT * i + 10, id: node.id };
  }));

  


  const color = d3.scaleOrdinal(d3.schemeSet2).domain(nodes.map((node) => node.id));

  useEffect(() => {
    const currentDate = new Date();
    d3.select(svgRef.current).attr('width', maxEndTime + 20).attr('height', NODE_HEIGHT * nodes.length + 20);
    for (let i = 0; i < 10; i++) {
      d3.select(svgRef.current)
        .append('text')
        .attr('x', x(i) + 20)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .text('Timeline')
        .style('background-color', 'white');
      d3.select(svgRef.current)
        .append('line')
        .attr('x1', x(i) + 20)
        .attr('x2', x(i) + 20)
        .attr('y1', 0)
        .attr('y2', NODE_HEIGHT * nodes.length)
        .attr('stroke', 'black')
        .attr('stroke-dasharray', '5,5');
    }
  }, []);

  const scrollHandler = useCallback((event: any) => {
    const scroll = divRef.current ? Math.abs(divRef.current.getBoundingClientRect().top - divRef.current.offsetTop) : 0;
    console.log(scroll);
  }, []);
  return (
    <div className=" bg-white w-full h-full overflow-scroll" onScroll={scrollHandler} ref={divRef}>
      <svg width={maxEndTime + 20} height={NODE_HEIGHT * nodes.length + 20} overflow={'auto'} ref={svgRef}>
        <g className="h-full w-full" ref={groupRef}>
          {nodes.map((node, i) => (
            <TimelineNode
              key={i}
              interval={node.interval}
              id={node.id}
              y={nodePositions[i].y}
              x={nodePositions[i].x}
              width={node.interval.end - node.interval.start}
              height={NODE_HEIGHT}
              onRowChange={(id, x, y) => {
                const row = Math.floor(y / NODE_HEIGHT);
                const draggedNode = nodePositions.find((node) => node.id === id);
                const newNodePosition = nodePositions.map((nodePosition, i) => {
                  console.log(nodePosition, draggedNode, i , row, id);
                  if ( Math.floor(nodePosition.y/NODE_HEIGHT) === row) {
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
              // onIntervalChange={(id, x, y) => {
              //   const draggedNode = nodePositions.find((node) => node.id === id);
              //   const newNodePosition = nodePositions.map((nodePosition, i) => {
              //     if (nodePosition.id === id) {
              //       return { x: x, y: y, id: nodePosition.id };
              //     }
              //     return nodePosition;
              //   });

              //   setNodePositions(newNodePosition);
              // }}
            />
          ))}
        </g>
      </svg>
      {/* <DateLines x={x}/> */}
    </div>
  );
};
