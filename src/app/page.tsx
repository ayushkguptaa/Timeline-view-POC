'use client';

import React, { useEffect } from 'react';
import * as d3 from 'd3';

import { Timeline } from '../components';
import { LeftNav } from '@/components/left-nav';

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
  const nodes = getNodes();
  const onNodeClick = (id) => {
    setNodeInView(id);
  };
  return (
    <div className="flex">
      <LeftNav nodes={nodes} onNodeClick={onNodeClick} />
      <Timeline nodes={nodes} nodeInView={nodeInView} />
    </div>
  );
}
