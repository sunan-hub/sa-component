import dagre from "dagre";

/** 图类型 */
export type GraphType = {
    height: number;
    width: number;
    rankDir: "TB" | "BT" | "LR" | "RL";
    ranker: "network-simplex" | "tight-tree" | "longest-path";
};

/** 传入的节点类型 */
export type NodeType = {
    id: React.Key;
    /** 节点宽度 */
    width: number;
    /** 节点高度 */
    height: number;
    nextIdList: React.Key[];
};

// 计算时附加的节点类型
export type NodeTypeWithCalc = {
    prevIdList: React.Key[];
};

/** 渲染时附加的节点类型 */
export type NodeTypeWithRender = NodeType &
    NodeTypeWithCalc & {
        level: number;
        x: number;
        y: number;
    };

/** 处理数据计算层级 */
export const calcDataLevel = (nodeList: (NodeType & NodeTypeWithCalc)[]) => {
    // 默认层级为0
    const defaultLevel = 0;
    // 深拷贝节点列表
    let newNodes: ((NodeType & NodeTypeWithCalc) & { level: number })[] = [
        ...nodeList,
    ].map((item) => ({
        ...item,
        level: defaultLevel,
    }));
    // 起始节点
    const startNode = newNodes?.find((item) => item.prevIdList.length === 0);
    // 递归计算节点的层级
    const calcLevel = (node: NodeType & { level: number }) => {
        node.nextIdList.forEach((nextId) => {
            const nextNode = newNodes.find((item) => item.id === nextId);
            if (nextNode?.level === defaultLevel) {
                nextNode.level = node.level + 1;
                calcLevel(nextNode);
            }
        });
    };
    if (startNode) {
        startNode.level = 1;
        calcLevel(startNode);
    }
    return newNodes;
};

/** 处理数据计算坐标Y */
export const calcDataPositionY = (pa: {
    nodeList: ((NodeType & NodeTypeWithCalc) & { level: number })[];
    nodeVerticalSpace: number;
}) => {
    const { nodeList, nodeVerticalSpace } = pa;
    // 深拷贝节点列表
    const newNodes: ((NodeType & NodeTypeWithCalc) & {
        level: number;
        y: number;
    })[] = [...nodeList].map((item) => ({
        ...item,
        y: 0,
    }));
    // 每层高度的最高值字典
    const levelHeightMap: Record<number, number> = {};
    // 计算每层的最高值
    newNodes.forEach((item) => {
        if (!levelHeightMap[item.level]) {
            levelHeightMap[item.level] = item.height;
        } else {
            levelHeightMap[item.level] = Math.max(
                levelHeightMap[item.level],
                item.height
            );
        }
    });
    // 根据层级和前置层最高的节点高度计算Y坐标
    newNodes.forEach((item) => {
        const prevNodes = newNodes.filter((node) =>
            item.prevIdList.includes(node.id)
        );
        if (prevNodes.length === 0) {
            item.y = 0;
        } else {
            const prevNode = prevNodes[0];
            const prevLevelHeight = levelHeightMap[prevNode.level];
            item.y = prevNode.y + prevLevelHeight + nodeVerticalSpace;
        }
    });
    return {
        nodeList: newNodes as NodeTypeWithRender[],
    };
};

/** 处理数据计算坐标X */
export const calcDataPositionX = (pa: {
    nodeList: (NodeType & { level: number })[];
    nodeHorizontalSpace: number;
}) => {
    const { nodeList, nodeHorizontalSpace } = pa;
    // 深拷贝节点列表
    const newNodes: (NodeType & { level: number; x: number })[] = [
        ...nodeList,
    ].map((item) => ({
        ...item,
        x: 0,
    }));
    const g = new dagre.graphlib.Graph();
    // 参数请看https://juejin.cn/post/7257321872424009783
    // 设置图的默认值，算法我也不太懂，但是network-simplex会导致节点位置变化，所以这里设置为longest-path
    g.setGraph({
        rankDir: "BT",
        nodesep: nodeHorizontalSpace,
        ranker: "longest-path",
    });
    g.setDefaultEdgeLabel(function () {
        return {};
    });
    newNodes.forEach((node) => {
        g.setNode(node.id.toString(), {
            width: node.width,
            height: node.height,
        });
    });
    newNodes.forEach((node) => {
        node.nextIdList.forEach((nextId) => {
            g.setEdge(node.id.toString(), nextId.toString());
        });
    });
    dagre.layout(g);
    newNodes.forEach((node) => {
        const nodePosition = g.node(node.id.toString());
        if (nodePosition) node.x = nodePosition.x - node.width / 2;
    });
    return {
        nodeList: newNodes as NodeTypeWithRender[],
        graph: g.graph(),
    };
};

/** 根据节点的nextIdList，得到prevIdList */
export const setNodePrevIdList = (data: NodeType[]) => {
    const newNodes: (NodeType & NodeTypeWithCalc)[] = [...data].map((item) => ({
        ...item,
        prevIdList: [],
    }));
    newNodes.forEach((item) => {
        item.nextIdList.forEach((nextId) => {
            const nextNode = newNodes.find((node) => node.id === nextId);
            if (nextNode) {
                nextNode.prevIdList.push(item.id);
            }
        });
    });
    return newNodes;
};
