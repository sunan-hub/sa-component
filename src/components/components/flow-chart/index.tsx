import {
    NodeTypeWithRender,
    calcDataLevel,
    calcDataPositionY,
    calcDataPositionX,
    type NodeType,
    setNodePrevIdList,
    GraphType,
} from "./const";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { jsPlumb as jsplumbUI, type jsPlumbInstance } from "jsplumb";
import { jsplumbSetting, createConnections } from "./js_plumb_mixins";
import "./index.less";

/** 组件ref的类型 */
type RefType = {
    /** 居中节点 */
    centerNodeById: (id: React.Key) => void;
    /** 设置缩放比例 */
    setScale: (scale: number) => void;
};

type PropsType = {
    /** 外层类名 */
    wrapClassName?: string;
    /** 节点列表 */
    nodeList: NodeType[];
    /** 节点间的垂直间距 */
    nodeVerticalSpace?: number;
    /** 节点间的水平间距 */
    nodeHorizontalSpace?: number;
    /** 视图口大小 */
    viewPortSize?: { width: number; height: number };
    /** 根节点是否默认在视图内居中 */
    isRootCenter?: boolean;
    /** 组件的ref */
    actionRef?: React.MutableRefObject<RefType>;
    /** 是否开启鼠标点击事件，浏览器默认行为 */
    isMouseDownDefault?: boolean;
    /** 渲染节点 */
    renderNode?: (node: NodeTypeWithRender) => React.ReactNode;
};

// 要拉到外面，不然每次渲染都会重新创建一个实例（出现删除不了线）
const jsPlumb: jsPlumbInstance = jsplumbUI.getInstance();

/** 流程图组件，只适用树形控件（只能有一个起始点）*/
const FlowChart = (props: PropsType) => {
    const {
        isRootCenter = true,
        viewPortSize = {
            width: 600,
            height: 600,
        },
    } = props;
    // 图的属性
    const [graph, setGraph] = useState<GraphType>();
    // 缩放比例
    const [scale, setScale] = useState(100);
    // 是否是拖拽状态
    const [isDrag, setIsDrag] = useState(true);
    // 鼠标按下时的坐标
    const mouseDownPosition = useRef({ x: 0, y: 0 });
    // 图的偏移量
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    // 用于渲染的节点列表
    const showNodeList = useMemo(() => {
        const { nodeList, graph } = calcDataPositionX({
            nodeList: calcDataPositionY({
                nodeList: calcDataLevel(setNodePrevIdList(props.nodeList)),
                nodeVerticalSpace: props.nodeVerticalSpace || 80,
            }).nodeList,
            nodeHorizontalSpace: props.nodeHorizontalSpace || 20,
        });
        setGraph(graph);
        return nodeList;
    }, [props.nodeList]);

    // 初始化jsPlumb
    const initJsPlumb = () => {
        jsPlumb?.ready(function () {
            // 导入默认配置
            jsPlumb.importDefaults(jsplumbSetting);
            // 会使整个jsPlumb立即重绘。
            jsPlumb.setSuspendDrawing(false, true);
            // 绑定鼠标移入连线事件
            jsPlumb?.bind("mouseover", (conn: any) => {
                // 点击连线,不是点击连线上的path
                conn.setPaintStyle({ stroke: "#7aff00", strokeWidth: 2 });
            });
            // 绑定鼠标移出连线事件
            jsPlumb?.bind("mouseout", (conn: any) => {
                // 点击连线,不是点击连线上的path
                conn.setPaintStyle({ stroke: "#3a9ffc", strokeWidth: 2 });
            });
        });
    };

    // 缩放
    const zoom = (pa: { type: "add" | "minus"; step?: number }) => {
        const { type, step = 10 } = pa;
        if (type === "add") {
            if (scale < 1000) setScale(scale + step);
        } else {
            if (scale > 10) setScale(scale - step);
        }
    };

    // 鼠标抬起
    document.addEventListener("mouseup", () => {
        document.removeEventListener("mousemove", handleMouseMove);
    });

    // 鼠标移动
    const handleMouseMove = (e: MouseEvent) => {
        if (!isDrag) return;
        setOffset({
            x: offset.x + e.clientX - mouseDownPosition.current.x,
            y: offset.y + e.clientY - mouseDownPosition.current.y,
        });
    };

    // 鼠标按下
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isDrag) return;
        if (!props.isMouseDownDefault) e.preventDefault();
        mouseDownPosition.current = { x: e.clientX, y: e.clientY };
        document.addEventListener("mousemove", handleMouseMove);
    };

    // 根据id居中节点
    const centerNodeById = (id: React.Key) => {
        const nodeDom = document.getElementById(id.toString());
        const wrapDom = document.getElementById("flow-chart-wrap");
        if (!nodeDom || !wrapDom) return;
        // nodeDom在屏幕上的属性
        const nodeRect = nodeDom.getBoundingClientRect();
        // 视口中心在屏幕上的属性
        const wrapRect = wrapDom.getBoundingClientRect();
        // nodeDom中心
        const nodeCenter = {
            x: nodeRect.x + nodeRect.width / 2,
            y: nodeRect.y + nodeRect.height / 2,
        };
        // 视口中心
        const viewPortCenter = {
            x: wrapRect.x + wrapRect.width / 2,
            y: wrapRect.y + wrapRect.height / 2,
        };
        setOffset({
            x: offset.x + viewPortCenter.x - nodeCenter.x,
            y: offset.y + viewPortCenter.y - nodeCenter.y,
        });
    };

    // 初始化jsPlumb
    useEffect(() => {
        initJsPlumb();
        return () => {
            if (!jsPlumb) return;
            jsPlumb.deleteEveryEndpoint();
            jsPlumb.deleteEveryConnection();
            jsPlumb.unbind();
        };
    }, []);

    // 赋值ref
    useEffect(() => {
        if (props.actionRef) {
            props.actionRef.current = {
                centerNodeById,
                setScale,
            };
        }
    }, [props.actionRef]);

    useEffect(() => {
        setTimeout(() => {
            // 创建连线
            createConnections({
                dataArr: showNodeList.map((item) => ({
                    ...item,
                    nodeId: item.id.toString(),
                    bottom: item.nextIdList?.map((id) => id.toString()) || [],
                    top: item.prevIdList?.map((id) => id.toString()) || [],
                    left: [],
                    right: [],
                })),
                jsPlumb,
            });
        }, 10);
        if (isRootCenter)
            centerNodeById(
                showNodeList.find((item) => !item.prevIdList.length)?.id || ""
            );
    }, [showNodeList]);

    return (
        <div
            id="flow-chart-wrap"
            className={`flow-chart-wrap ${isDrag ? "drag" : ""} ${
                props.wrapClassName || ""
            }`}
            style={{ width: viewPortSize.width, height: viewPortSize.height }}
            onMouseDown={handleMouseDown}
        >
            <div className="flow-chart-operate">
                <div
                    className="icon add"
                    onClick={() => zoom({ type: "add" })}
                />
                <div
                    className="icon minus"
                    onClick={() => zoom({ type: "minus" })}
                />
                <div className="scale">{scale}%</div>
                <div
                    className={`icon grab ${isDrag ? "active" : ""}`}
                    onClick={() => setIsDrag(!isDrag)}
                />
                <div
                    className="icon location"
                    onClick={() =>
                        centerNodeById(
                            showNodeList.find((item) => !item.prevIdList.length)
                                ?.id || ""
                        )
                    }
                />
            </div>
            <div
                className="flow-chart-content"
                style={{
                    width: graph?.width,
                    height: graph?.height,
                    transform: `scale(${scale / 100}) translate(${
                        offset.x / (scale / 100)
                    }px, ${offset.y / (scale / 100)}px)`,
                    // transform: `scale(${scale / 100})`,
                    // left: offset.x,
                    // top: offset.y,
                }}
            >
                {showNodeList.map(
                    (item) =>
                        props.renderNode?.(item) || (
                            <div
                                id={item.id.toString()}
                                key={item.id}
                                className="node"
                                style={{
                                    left: item.x,
                                    top: item.y,
                                    width: item.width,
                                    height: item.height,
                                }}
                            >
                                {item.id}
                            </div>
                        )
                )}
            </div>
        </div>
    );
};

export default FlowChart;
