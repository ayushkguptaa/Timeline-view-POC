import React from 'react';
import { Navigator } from './navigator';

export interface NavigatorsProps {
  nodes: any[];
  onNodeClick?: (id: string) => void;
  divRef: any;
}

export const Navigators = ({ nodes, onNodeClick, divRef }: NavigatorsProps) => {
  return nodes.map((node, i) => {
    return <Navigator key={node.id} node={node} onNodeClick={onNodeClick} divRef={divRef} />;
  });
};
