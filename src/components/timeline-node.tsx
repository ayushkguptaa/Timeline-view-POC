import React, { useCallback, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { NODE_HEIGHT } from './constants';

export interface TimelineNodeInterface extends React.SVGProps<SVGForeignObjectElement> {
  interval: {
    start: number;
    end: number;
  };
  id: string;
  onRowChange?: (id: string, row: number, event: any) => void;
  //   onIntervalChange?: (id: string, x: number, y:number) => void;
}

export const TimelineNode = ({ interval, id, onRowChange, x,y,  width, ...props }: TimelineNodeInterface) => {
  const nodeRef = useRef(null);
  const [xstate, setX] = React.useState<number>(x as number);
  const [widthstate, setWidth] = React.useState<number>(Math.max(width as number, 100));
  const [ystate, setY] = React.useState<number>(y as number);
  const expandLeftRef = useRef(null);
  const expandRightRef = useRef(null);
  const foreignRef = useRef(null);
    console.log(y, ystate)

    useEffect(() => setY(y as number), [y])

  const leftDragHandler = useCallback(
    (event: any) => {
      const newWidth = xstate + widthstate - event.x;
      console.log('left', id, event.x, xstate, width, widthstate, newWidth);
      if (event.x < xstate + widthstate - 100) {
        setX(event.x);
        setWidth(newWidth);
      }
    },
    [id, width, widthstate, xstate],
  );

  const rightDragHandler = useCallback((event: any) => {
    console.log(event.x, xstate)
    setWidth(Math.max(event.x - xstate, 100));
}, [xstate])

  useEffect(() => {
    const dragHandler = d3.drag().on('drag', function (event) {
      d3.select(this).attr('x', event.x).attr('y',  event.y);
      setX(event.x);
      setY(Math.floor(event.y/ NODE_HEIGHT) * NODE_HEIGHT + 10);
      onRowChange?.(id, event.x, Math.floor(event.y/ NODE_HEIGHT) * NODE_HEIGHT + 10);
    });
    if (nodeRef.current) dragHandler(d3.select(nodeRef.current));
  }, [id, onRowChange]);
  
  useEffect(() => {
    const dragHandler = d3.drag().on('drag', leftDragHandler);
    if (expandLeftRef.current) dragHandler(d3.select(expandLeftRef.current));
    d3.select(nodeRef.current).attr('x', xstate);
    d3.select(nodeRef.current).attr('width', widthstate);
    d3.select(foreignRef.current).attr('x', xstate);
    d3.select(foreignRef.current).attr('width', widthstate);
    d3.select(expandLeftRef.current).attr('x', xstate);
    d3.select(expandRightRef.current).attr('x', xstate + widthstate - 10);
  }, []);
  console.log('render', id, xstate, width, widthstate);

  useEffect(() => {
    const dragHandler = d3.drag().on('drag', rightDragHandler);
    if (expandRightRef.current) dragHandler(d3.select(expandRightRef.current));
  }, []);

  return (
    <g ref={nodeRef} x={xstate} width={widthstate} y={ystate} {...props}>
      <foreignObject x={xstate} y={ystate} width={widthstate} height={NODE_HEIGHT} ref={foreignRef}>
        <div className="h-full shrink w-full bg-red-500 border border-black">{id}</div>
      </foreignObject>
      <rect
        x={xstate}
        y={(ystate as number) + 2}
        ref={expandLeftRef}
        width={10}
        height={NODE_HEIGHT - 4}
        fill={'black'}
      />
      <rect
        x={xstate + widthstate - 10}
        y={(ystate as number) + 2}
        ref={expandRightRef}
        width={10}
        height={NODE_HEIGHT - 4}
        fill={'black'}
      />
    </g>
  );
};
