import { SpaceTimeContext } from '@/contexts/space-time-context';
import { useContext } from 'react';

export interface NavigatorProps {
  node: any;
  onNodeClick?: (id: string) => void;
  divRef: any;
}

export const Navigator = ({ node, onNodeClick, divRef }: NavigatorProps) => {
  const { getNodePosition } = useContext(SpaceTimeContext);
  const position = getNodePosition(node.id);

  const clientWidth = divRef?.current?.clientWidth;
  const scrollLeft = divRef?.current?.scrollLeft;
  const offsetLeft = divRef?.current?.offsetLeft;

  if ((position?.x ?? 0) > scrollLeft + clientWidth)
    return (
      <button
        className={`w-fit bg-white rounded-md  absolute right-0`}
        style={{ top: (position?.y ?? 0) + 50 }}
        onClick={() => {
          window.requestAnimationFrame(() => {
            divRef &&
              divRef.current.scrollTo({
                left: (position?.x ?? 0) - 100,
                behavior: 'smooth',
              });
          });
          onNodeClick?.(node.id);
        }}
      >
        {node.name + '>>'}
      </button>
    );

  if ((position?.x ?? 0) + (position?.width ?? 500) < scrollLeft)
    return (
      <button
        className={`w-fit bg-white rounded-md  absolute`}
        style={{ top: (position?.y ?? 0) + 50, left: offsetLeft }}
        onClick={() => {
          window.requestAnimationFrame(() => {
            divRef &&
              divRef.current.scrollTo({
                left: (position?.x ?? 0) - 100,
                behavior: 'smooth',
              });
          });
          onNodeClick?.(node.id);
        }}
      >
        {'<<' + node.name}
      </button>
    );

  return null;
};
