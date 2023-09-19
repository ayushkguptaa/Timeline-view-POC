import React, { use, useCallback, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { NODE_HEIGHT } from './constants';
import { get } from 'http';
import { isInViewPort } from '@/utils';
import { SpaceTimeContextProvider } from '@/contexts/space-time-context';

export interface TimelineNodeInterface extends React.SVGProps<SVGForeignObjectElement> {
  interval: {
    start: Date | undefined;
    end: Date | undefined;
  };
  id: string;
  onRowChange?: (id: string, row: number, event: any) => void;
  onResizeNode?: (
    id: string,
    interval: {
      start: Date;
      end: Date;
    },
  ) => void;
  nodeToShow?: string;
  band?: any;
  getTimeFromX?: any;
  scrollLeft?: number;
  clientWidth?: number;
  divRef?: any;
  //   onIntervalChange?: (id: string, x: number, y:number) => void;
}

export const TimelineNode = ({
  interval,
  id,
  onRowChange,
  x,
  y,
  nodeToShow,
  width,
  band,
  getTimeFromX,
  onResizeNode,
  scrollLeft,
  clientWidth,
  divRef,
  ...props
}: TimelineNodeInterface) => {
  const nodeRef = useRef(null);
  const [xstate, setX] = React.useState<number>(x as number);
  const [widthstate, setWidth] = React.useState<number>(Math.max(width as number, 100));
  const [ystate, setY] = React.useState<number>(y as number);
  const expandLeftRef = useRef(null);
  const expandRightRef = useRef(null);
  const foreignRef = useRef(null);

  useEffect(() => setY(y as number), [y]);
  useEffect(() => setX(x as number), [x]);
  useEffect(() => setWidth(Math.max(width as number, 100)), [width]);
  useEffect(() => {
    if (nodeToShow === id) {
      window.requestAnimationFrame(() => {
        divRef &&
          divRef.current.scrollTo({
            left: xstate - 100,
            behavior: 'smooth',
          });
      });
    }
  }, [nodeToShow]);

  useEffect(() => {
    onResizeNode?.(id, {
      start: getTimeFromX?.()(xstate),
      end: !isNaN(interval.end.getDay()) ? getTimeFromX?.()(xstate + widthstate) : undefined,
    });
  }, [xstate, widthstate, onResizeNode, id, getTimeFromX]);

  const leftDragHandler = useCallback(
    (event: any) => {
      const newWidth = xstate + widthstate - event.x;
      if (event.x < xstate + widthstate - 100) {
        setX(Math.floor(event.x / band) * band + 20);
        setWidth(newWidth);
      }
    },
    [band, widthstate, xstate],
  );

  const rightDragHandler = useCallback(
    (event: any) => {
      const newWidth = Math.floor((event.x - xstate) / band) * band;
      setWidth(Math.max(newWidth, band));
    },
    [band, xstate],
  );

  useEffect(() => {
    const dragHandler = d3.drag().on('drag', function (event) {
      d3.select(this).attr('x', event.x).attr('y', event.y);
      setX(Math.floor(event.x / band) * band + 20);
      setY(Math.floor(event.y / NODE_HEIGHT) * NODE_HEIGHT + 50);
      onRowChange?.(id, Math.floor(event.x / band) * band + 10, Math.floor(event.y / NODE_HEIGHT) * NODE_HEIGHT + 10);
    });
    if (nodeRef.current) dragHandler(d3.select(nodeRef.current));
  }, [band, id, onRowChange]);

  useEffect(() => {
    const dragHandler = d3.drag().on('drag', leftDragHandler);
    if (expandLeftRef.current) dragHandler(d3.select(expandLeftRef.current));
    d3.select(nodeRef.current).attr('x', xstate);
    d3.select(nodeRef.current).attr('width', widthstate);
    d3.select(foreignRef.current).attr('x', xstate);
    d3.select(foreignRef.current).attr('width', widthstate);
    d3.select(expandLeftRef.current).attr('x', xstate);
    d3.select(expandRightRef.current).attr('x', xstate + widthstate - 10);
  }, [leftDragHandler, widthstate, xstate]);

  useEffect(() => {
    const dragHandler = d3.drag().on('drag', rightDragHandler);
    if (expandRightRef.current) dragHandler(d3.select(expandRightRef.current));
  }, [rightDragHandler]);

  if (scrollLeft > xstate + widthstate) {
    return (
      <g x={scrollLeft} width={widthstate} y={ystate} onClick={() => console.log('left')}>
        <foreignObject x={scrollLeft} y={ystate + 50} width={1000} height={50}>
          <button
            className="w-fit bg-white rounded-md"
            onClick={() => {
              window.requestAnimationFrame(() => {
                divRef &&
                  divRef.current.scrollTo({
                    left: xstate - 100,
                    behavior: 'smooth',
                  });
              });
            }}
          >
            {'<<' + id}
          </button>
        </foreignObject>
      </g>
    );
  }
  if (scrollLeft + clientWidth < xstate) {
    return (
      // <foreignObject className={`right-0 top-[${ystate}px] absolute`} width={1000} height={50}>
      <button
        className={`w-fit bg-white rounded-md  absolute right-0 top-[${ystate + 50}px]`}
        onClick={() => {
          window.requestAnimationFrame(() => {
            divRef &&
              divRef.current.scrollTo({
                left: xstate - 100,
                behavior: 'smooth',
              });
          });
        }}
      >
        {id + '>>'}
      </button>
      // </foreignObject>
    );
  }

  return (
    <g ref={nodeRef} x={xstate} width={widthstate} y={ystate} {...props}>
      <foreignObject x={xstate} y={ystate} width={widthstate} height={NODE_HEIGHT} ref={foreignRef} cursor={'grab'}>
        <div className="flex h-full flex-col mb-1 overflow-y-auto flex-grow">
          <div className={`h-full shrink w-full border border-black bg-red-500`}>{id}</div>
          {isNaN(interval.end?.getDate()) && (
            <div
              className="h-full bg-fading-overlay w-40 right-0 absolute transform top-0 bottom-0"
              style={{
                background: 'linear-gradient(90deg, transparent, white 100%)',
              }}
            />
          )}
        </div>
      </foreignObject>

      <rect
        x={xstate}
        y={(ystate as number) + 2}
        ref={expandLeftRef}
        width={10}
        height={NODE_HEIGHT - 4}
        fill={'black'}
        cursor={'ew-resize'}
      />
      {!isNaN(interval.end.getDay()) && (
        <rect
          x={xstate + widthstate - 10}
          y={(ystate as number) + 2}
          ref={expandRightRef}
          width={10}
          height={NODE_HEIGHT - 4}
          fill={'black'}
          cursor={'ew-resize'}
        />
      )}
    </g>
  );
};
