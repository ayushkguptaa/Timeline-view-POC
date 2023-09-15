'use client';

import React, { useEffect } from 'react';
import * as d3 from 'd3';

import { Timeline } from '../components';
import { LeftNav } from '@/components/left-nav';
import { parts } from '@/components/data';

const getNodes = () => {
  const arr = [];
  for (let i = 0; i < 10; i++) {
    const start = Math.random() * 3000;
    const end = start + Math.random() * 3000;
    const id = `node-${i}`;
    arr.push({ interval: { start, end }, id });
  }
  return arr;
};

export default function Home() {
  const [nodeInView, setNodeInView] = React.useState<string>('');
  const [timerange, setTimerange] = React.useState<'days' | 'months'>('days');
  const currentDate = new Date();

  const nodes = parts.map((part) => {
    return {
      interval: {
        start: new Date(part.created_date || part.modified_date),
        end: new Date(part.actual_close_date || part.target_close_date) ?? undefined,
      },
      id: part.id,
    };
  });
  const onNodeClick = (id) => {
    setNodeInView(id);
  };
  return (
    <div className="flex-col">
      <select className="border-2 border-gray-500 rounded-md p-2" onChange={(e) => setTimerange(e.target.value)}>
        <option value={'days'}>Days</option>
        <option value={'months'}>Months</option>
      </select>
      <div className="flex">
        <LeftNav nodes={nodes} onNodeClick={onNodeClick} />
        <Timeline nodes={nodes} nodeInView={nodeInView} timerange={timerange} />
      </div>
    </div>
  );
}
