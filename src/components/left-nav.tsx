export const LeftNav = ({ nodes, onNodeClick }) => {
  return (
    <div className="h-full mt-[10px]">
      {nodes.map((node, i) => {
        return (
          <div
            key={i}
            className="h-[100px] w-40 bg-red-500 border border-black cursor-pointer"
            onClick={() => onNodeClick(node.id)}
          >
            {node.id}
          </div>
        );
      })}
    </div>
  );
};