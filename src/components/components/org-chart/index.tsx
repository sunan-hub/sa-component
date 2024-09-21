import React, { useEffect, useState, useCallback, useRef } from "react";
import type { ShowNodeDataType, DirectionType } from "./js_plumb_mixins";
import type { jsPlumbInstance } from "jsplumb";
import { jsPlumb as jsplumbUI } from "jsplumb";
import {
    jsplumbSetting,
    createConnections,
    dragNodeAnchorStart,
    isEnterScope,
} from "./js_plumb_mixins";
import { confirm } from "@/components/confirm-box";
import NoData from "./icons/no-data.svg";
import lodash from "lodash";
import "./index.less";

// 要拉到外面，不然每次渲染都会重新创建一个实例（出现删除不了线）
const jsPlumb: jsPlumbInstance = jsplumbUI.getInstance();

/** 节点垂直方向距离 */
const TopDistance = 30;
/** 节点水平方向距离 */
const RightDistance = 130;
/** 编辑时边界预留个数 */
const ReserveCount = 2;
/** 加号的节点默认高度和宽度 */
const DefaultAddNodeHeight = 30;

/** 组织架构图属性 */
type OrgChartPropsType = {
    isEdit?: boolean; // 是否是编辑状态;
    dataList?: ShowNodeDataType[]; // 数据
    noDataRender?: React.ReactNode; // 没有数据时的渲染
    orgChartWrapName?: string; // 组织架构图外层容器的类名
    nodeKey: string | number; // 节点的key（用于刷新节点）
    addNodeHeight?: number; // 加号的节点高度和宽度
    customCoordinate?: { x?: (x: number) => number; y?: (y: number) => number }; // 自定义节点坐标
    nodeWrapClassName?: (item: ShowNodeDataType) => string; // 节点外层容器的类名
    nodeRender?: (nodeData: ShowNodeDataType) => React.ReactNode; // 节点渲染
    dataChangeCallBack?: (dataList: ShowNodeDataType[]) => void; // 数据变化回调
    clickAddNode?: (pa: {
        nodeData: ShowNodeDataType; // 新增节点数据
        callBack: (newDataList: ShowNodeDataType[]) => ShowNodeDataType[];
    }) => void;
    deleteNode?: (pa: {
        nodeData: ShowNodeDataType; // 要删除的节点数据
        callBack: (newDataList: ShowNodeDataType[]) => ShowNodeDataType[];
    }) => void;
    deleteLineCallBack?: (pa: {
        sourceId: string;
        targetId: string;
        newDataList: ShowNodeDataType[]; // 删除连线后的数据
        callBack: (newDataList: ShowNodeDataType[]) => void;
    }) => void;
    drawLine?: (pa: {
        sourceId: string;
        targetId: string;
        newDataList: ShowNodeDataType[]; // 连线后的数据
        callBack: (newDataList: ShowNodeDataType[]) => void;
    }) => void;
    dragNodeEnd?: (pa: {
        ids: string[]; // 拖拽的节点id
        newDataList: ShowNodeDataType[]; // 拖拽后的数据（新坐标）
        callBack: (newDataList: ShowNodeDataType[]) => ShowNodeDataType[];
    }) => void;
};

type MouseNodeType = {
    node: ShowNodeDataType;
    anchor: DirectionType;
} | null;

/** 坐标类型 */
type CoordinateType = {
    x: number;
    y: number;
};

// 矩阵的加号类型
type MatrixType = CoordinateType & { isHighlight?: boolean };

/** 组织架构图组件 */
const OrgChart = (props: OrgChartPropsType) => {
    const AddNodeHeight = props.addNodeHeight || DefaultAddNodeHeight;
    // 显示的数据
    const [showDataList, setShowDataList] = useState<ShowNodeDataType[]>([]);
    // 利用极限坐标得到矩阵（极限坐标上下左右各加ReserveCount个节点位，根据上距离和右距离）
    const [matrix, setMatrix] = useState<MatrixType[]>([]);
    // 鼠标按下的节点
    const [mouseDownNode, setMouseDownNode] = useState<MouseNodeType>(null);
    // 记录最大的y的坐标(用于设置高度)
    const [wapHeight, setWapHeight] = useState(0);
    // 记录最大的x的坐标(用于设宽度)
    const [wapWidth, setWapWidth] = useState(0);
    // 正在拖拽的节点
    const [dragNodeData, setDragNodeData] = useState<ShowNodeDataType>();
    // 拖拽前按下的坐标
    const dragNodeStartCoordinateRef = useRef<CoordinateType>({ x: 0, y: 0 });

    // 计算矩阵
    const calculateMatrix = (
        limitCoordinateMap: Record<DirectionType, number>,
        dataArr: ShowNodeDataType[]
    ) => {
        // 最小的x
        let minx = 0;
        // 最小的y
        let miny = 0;
        // 最终页面宽度
        let maxWidth = AddNodeHeight;
        // 最终页面高度
        let maxHeight = AddNodeHeight;
        const matrixNew: { x: number; y: number }[] = [];
        const { top, right, bottom, left } = limitCoordinateMap;
        for (
            let i = top - ReserveCount * TopDistance;
            i <= bottom + ReserveCount * TopDistance;
            i += AddNodeHeight
        ) {
            for (
                let j = left - ReserveCount * RightDistance;
                j <= right + ReserveCount * RightDistance;
                j += AddNodeHeight
            ) {
                matrixNew.push({ x: j, y: i });
                // 的到最小x和最小y
                if (j < minx) minx = j;
                if (i < miny) miny = i;
            }
        }
        // 将已存在节点的矩阵坐标去除
        dataArr.forEach((item: ShowNodeDataType) => {
            matrixNew.forEach(
                (matrixItem: { x: number; y: number }, index: number) => {
                    if (item.x === matrixItem.x && item.y === matrixItem.y) {
                        matrixNew.splice(index, 1);
                    }
                }
            );
        });
        // 将矩阵坐标转换为正数
        matrixNew.forEach((item: { x: number; y: number }) => {
            item.x -= minx;
            item.y -= miny;
            // 记录最大的y的坐标
            if (item.y + AddNodeHeight > maxHeight && props.isEdit)
                maxHeight = item.y + AddNodeHeight;
            // 记录最大的x的坐标
            if (item.x + AddNodeHeight > maxWidth && props.isEdit)
                maxWidth = item.x + AddNodeHeight;
        });
        // 节点坐标转换
        const newDataArr = lodash
            .cloneDeep(dataArr)
            .map((item: ShowNodeDataType) => {
                // 把坐标记录字典
                return {
                    ...item,
                    x: item.x - minx,
                    y: item.y - miny,
                };
            });
        // 计算最终的宽度和高度
        newDataArr.forEach((item: ShowNodeDataType) => {
            // 最终节点x坐标
            const finalX = props.isEdit
                ? item.x
                : item.x - RightDistance * ReserveCount;
            // 节点宽度
            const nodeWidth =
                document.getElementById(item.nodeId)?.offsetWidth || 0;
            // 最终节点y坐标
            const finalY = props.isEdit
                ? item.y
                : item.y - TopDistance * ReserveCount;
            // 节点高度
            const nodeHeight =
                document.getElementById(item.nodeId)?.offsetHeight || 0;
            if (finalX + nodeWidth > maxWidth) maxWidth = finalX + nodeWidth;
            if (finalY + nodeHeight > maxHeight)
                maxHeight = finalY + nodeHeight;
        });
        setWapHeight(maxHeight);
        setWapWidth(maxWidth);
        setShowDataList(newDataArr);
        setMatrix(matrixNew);
        // 避免触及边界，导致线错位
        // 删除连线
        jsPlumb?.deleteEveryConnection();
        setTimeout(() => {
            // 创建连线
            createConnections({
                dataArr: newDataArr,
                jsPlumb,
                showLabel: props.isEdit,
            });
        }, 10);
        return newDataArr;
    };

    /** 重新赋值showDataList，和重新连线（不会计算节点坐标和矩阵） */
    const setDataListAndCalculate = (newDataList: ShowNodeDataType[]) => {
        // 删除连线
        jsPlumb.deleteEveryConnection();
        // 创建连线
        createConnections({ dataArr: newDataList, jsPlumb });
        setShowDataList(newDataList);
    };

    /** 计算四个方向的极限坐标（会重新赋值showDataList，和重新连线） */
    const setDataListAndCalculateLimitCoordinate = (
        dataArr: ShowNodeDataType[]
    ) => {
        const limitCoordinateNew: Record<DirectionType, number> = {
            top: dataArr[0]?.y || 0,
            right: dataArr[0]?.x || 0,
            bottom: dataArr[0]?.y || 0,
            left: dataArr[0]?.x || 0,
        };
        dataArr.forEach((item: ShowNodeDataType) => {
            if (item.y < limitCoordinateNew.top)
                limitCoordinateNew.top = item.y;
            if (item.x > limitCoordinateNew.right)
                limitCoordinateNew.right = item.x;
            if (item.y > limitCoordinateNew.bottom)
                limitCoordinateNew.bottom = item.y;
            if (item.x < limitCoordinateNew.left)
                limitCoordinateNew.left = item.x;
        });
        // 计算矩阵
        return calculateMatrix(limitCoordinateNew, dataArr);
    };

    // 防抖执行setMatrix
    const setMatrixDebounce = useCallback(
        lodash.throttle((matrixNew: MatrixType[]) => {
            setMatrix(matrixNew);
        }, 200),
        []
    );

    // 节流执行setMatrix
    const setMatrixThrottle = useCallback(
        lodash.throttle((matrixNew: MatrixType[]) => {
            setMatrixDebounce(matrixNew);
        }, 200),
        []
    );

    // 拖拽节点
    const dragNode = (e: any) => {
        // 算拖动中移动了多少距离
        const moveX = e.clientX - dragNodeStartCoordinateRef.current.x;
        const moveY = e.clientY - dragNodeStartCoordinateRef.current.y;
        if (dragNodeData) {
            setMatrixThrottle(
                matrix.map((item) => ({
                    ...item,
                    isHighlight: isEnterScope({
                        nodeCoordinate: {
                            x:
                                moveX +
                                (props.customCoordinate?.x?.(dragNodeData?.x) ||
                                    dragNodeData?.x),
                            y:
                                moveY +
                                (props.customCoordinate?.y?.(dragNodeData?.y) ||
                                    dragNodeData?.y),
                        },
                        matrixItem: item,
                        addNodeHeight: AddNodeHeight,
                    }),
                }))
            );
        }
    };

    // 拖拽结束
    const dragNodeEnd = (e: any) => {
        if (!dragNodeData) return;
        // 算拖动中移动了多少距离
        const moveX = e.clientX - dragNodeStartCoordinateRef.current.x;
        const moveY = e.clientY - dragNodeStartCoordinateRef.current.y;
        const nodeCoordinate = {
            x:
                moveX +
                (props.customCoordinate?.x?.(dragNodeData?.x) ||
                    dragNodeData?.x),
            y:
                moveY +
                (props.customCoordinate?.y?.(dragNodeData?.y) ||
                    dragNodeData?.y),
        };
        const newDataList = showDataList.map((item: ShowNodeDataType) => {
            const newItem = { ...item };
            if (item.nodeId === dragNodeData.nodeId) {
                matrix?.forEach((matrixItem: { x: number; y: number }) => {
                    if (
                        isEnterScope({
                            nodeCoordinate,
                            matrixItem,
                            addNodeHeight: AddNodeHeight,
                        })
                    ) {
                        newItem.x = matrixItem.x;
                        newItem.y = matrixItem.y;
                    }
                });
            }
            return newItem;
        });
        setDragNodeData(undefined);
        if (props.dragNodeEnd) {
            props.dragNodeEnd({
                ids: [dragNodeData.nodeId],
                newDataList: newDataList,
                callBack: setDataListAndCalculateLimitCoordinate,
            });
        } else {
            setDataListAndCalculateLimitCoordinate(newDataList);
        }
    };

    // 删除线防抖
    const handleDeleteLine: (
        sourceId: string,
        targetId: string,
        allData: ShowNodeDataType[]
    ) => void = useCallback(
        lodash.debounce(
            (
                sourceId: string,
                targetId: string,
                allData: ShowNodeDataType[]
            ) => {
                // 删除数据
                const newDataList = lodash
                    .cloneDeep(allData)
                    .map((dataItem: ShowNodeDataType) => {
                        ["top", "right", "bottom", "left"].forEach(
                            (directionItem: string) => {
                                const direction =
                                    directionItem as DirectionType;
                                if (dataItem.nodeId === sourceId) {
                                    dataItem[direction] = dataItem[
                                        direction
                                    ].filter(
                                        (targetItem: string) =>
                                            targetItem !== targetId
                                    );
                                }
                                if (dataItem.nodeId === targetId) {
                                    dataItem[direction] = dataItem[
                                        direction
                                    ].filter(
                                        (targetItem: string) =>
                                            targetItem !== sourceId
                                    );
                                }
                            }
                        );
                        return dataItem;
                    });
                if (props.deleteLineCallBack) {
                    props.deleteLineCallBack({
                        sourceId,
                        targetId,
                        newDataList,
                        callBack: setDataListAndCalculate,
                    });
                } else setDataListAndCalculate(newDataList);
            },
            500
        ),
        []
    );

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
                conn.setPaintStyle({ stroke: "#498cff", strokeWidth: 2 });
            });
            // 绑定鼠标移出连线事件
            jsPlumb?.bind("mouseout", (conn: any) => {
                // 点击连线,不是点击连线上的path
                conn.setPaintStyle({ stroke: "#d1d2d4", strokeWidth: 1 });
            });
        });
    };

    // 删除节点
    const handleDeleteNode = (item: ShowNodeDataType) => {
        if (props.deleteNode) {
            props.deleteNode({
                nodeData: item,
                callBack: setDataListAndCalculateLimitCoordinate,
            });
        } else {
            // 删除数据
            const newDataList = lodash
                .cloneDeep(showDataList)
                .filter(
                    (dataItem: ShowNodeDataType) =>
                        dataItem.nodeId !== item.nodeId
                );
            // 删除终点坐标
            newDataList.forEach((dataItem: ShowNodeDataType) => {
                dataItem.top = dataItem.top.filter(
                    (targetItem: string) => targetItem !== item.nodeId
                );
                dataItem.right = dataItem.right.filter(
                    (targetItem: string) => targetItem !== item.nodeId
                );
                dataItem.bottom = dataItem.bottom.filter(
                    (targetItem: string) => targetItem !== item.nodeId
                );
                dataItem.left = dataItem.left.filter(
                    (targetItem: string) => targetItem !== item.nodeId
                );
            });
            setDataListAndCalculateLimitCoordinate(newDataList);
        }
    };

    // 点击添加节点按钮
    const handleAddNode = (e: any) => {
        // 获取节点在画布中的位置
        const { left, top } = e.target.getBoundingClientRect();
        // 算出父画布的偏移量
        const parentLeft = document
            .getElementById("org_component_wrap")!
            .getBoundingClientRect().left;
        const parentTop = document
            .getElementById("org_component_wrap")!
            .getBoundingClientRect().top;
        const newDataList = lodash.cloneDeep(showDataList);
        const newNode: ShowNodeDataType = {
            nodeId: "node_" + new Date().getTime(),
            x: Math.round(left - parentLeft),
            y: Math.round(top - parentTop),
            top: [],
            right: [],
            bottom: [],
            left: [],
        };
        if (props.clickAddNode) {
            props.clickAddNode({
                nodeData: newNode,
                callBack: setDataListAndCalculateLimitCoordinate,
            });
        } else {
            newDataList.push(newNode);
            setDataListAndCalculateLimitCoordinate(newDataList);
        }
    };

    /** 在链接点上松开鼠标时绘制连线 */
    const drawLine = (source: MouseNodeType, target: MouseNodeType) => {
        if (!!source && !!target && source.node.nodeId !== target.node.nodeId) {
            const newDataList = lodash.cloneDeep(showDataList);
            // 目前只能存在一条线，所以先检查原来两个节点有没有连线，删除原来的线
            ["top", "right", "bottom", "left"].forEach(
                (directionItem: string) => {
                    const direction = directionItem as DirectionType;
                    newDataList.forEach((item: ShowNodeDataType) => {
                        if (item.nodeId === source.node.nodeId) {
                            item[direction] = item[direction].filter(
                                (targetItem: string) =>
                                    targetItem !== target.node.nodeId
                            );
                        }
                        if (item.nodeId === target.node.nodeId) {
                            item[direction] = item[direction].filter(
                                (targetItem: string) =>
                                    targetItem !== source.node.nodeId
                            );
                        }
                    });
                }
            );
            newDataList.forEach((item: ShowNodeDataType) => {
                if (item.nodeId === source.node.nodeId) {
                    // 发出连线的方向
                    const anchorStart: DirectionType = source.anchor;
                    item[anchorStart].push(target.node.nodeId);
                }
                if (item.nodeId === target.node.nodeId) {
                    // 接收连线的方向
                    const anchorEnd: DirectionType = target.anchor;
                    item[anchorEnd].push(source.node.nodeId);
                }
            });
            if (props.drawLine) {
                props.drawLine({
                    sourceId: source.node.nodeId,
                    targetId: target.node.nodeId,
                    newDataList: newDataList,
                    callBack: setDataListAndCalculate,
                });
            } else setDataListAndCalculate(newDataList);
        }
        setMouseDownNode(null);
    };

    // 监听渲染数据变化
    useEffect(() => {
        if (props.dataChangeCallBack) props.dataChangeCallBack(showDataList);
    }, [showDataList]);

    useEffect(() => {
        // 绑定点击连线事件
        if (props.isEdit)
            jsPlumb?.bind("click", (conn: any, originalEvent: any) => {
                // 点击连线,不是点击连线上的path
                if (originalEvent.target.localName === "path") return false;
                handleDeleteLine(conn.sourceId, conn.targetId, showDataList);
            });
    }, [showDataList, props.isEdit]);

    useEffect(() => {
        initJsPlumb();
        setDataListAndCalculateLimitCoordinate(showDataList || []);
        return () => {
            if (!jsPlumb) return;
            jsPlumb.deleteEveryEndpoint();
            jsPlumb.deleteEveryConnection();
            jsPlumb.unbind();
        };
        // 加上props.isEdit，是为判断是否显示线上的label
    }, [props.isEdit, props.nodeKey]);

    useEffect(() => {
        setDataListAndCalculateLimitCoordinate(props.dataList || []);
    }, [props.dataList]);

    return (
        <div
            className={`org_component_wrap ${props.orgChartWrapName || ""}`}
            id="org_component_wrap"
            style={{ minHeight: wapHeight, minWidth: wapWidth }}
        >
            {/* 利用矩阵画出可添加节点的点阵 */}
            {props.isEdit &&
                matrix?.map((matrixItem) => (
                    <button
                        key={`${matrixItem.x}_${matrixItem.y}`}
                        style={{
                            left: matrixItem.x,
                            top: matrixItem.y,
                            width: AddNodeHeight,
                            height: AddNodeHeight,
                        }}
                        onClick={(e) => handleAddNode(e)}
                        title="添加节点"
                        className={`add_node_icon ${
                            matrixItem.isHighlight
                                ? "add_node_icon_highlight"
                                : ""
                        } ${matrixItem.y === 0 ? "add_node_icon_top" : ""}
                        ${matrixItem.x === 0 ? "add_node_icon_left" : ""}`}
                    >
                        <div className="add_icon_img" />
                    </button>
                ))}
            {/* 节点图 */}
            {showDataList.map((item: ShowNodeDataType) => {
                return (
                    <div
                        key={item.nodeId + "_" + props.nodeKey || ""}
                        id={item.nodeId}
                        style={{
                            left: props.isEdit
                                ? props.customCoordinate?.x?.(item.x) || item.x
                                : props.customCoordinate?.x?.(item.x) ||
                                  item.x - RightDistance * ReserveCount,
                            top: props.isEdit
                                ? props.customCoordinate?.y?.(item.y) || item.y
                                : props.customCoordinate?.y?.(item.y) ||
                                  item.y - TopDistance * ReserveCount,
                        }}
                        className={`node_wrap ${
                            (!!props.nodeWrapClassName &&
                                props.nodeWrapClassName(item)) ||
                            ""
                        } ${props.isEdit ? "node_wrap_edit" : ""}`}
                        onDrag={dragNode}
                        onDragStart={(e) => {
                            dragNodeStartCoordinateRef.current = {
                                x: e.clientX,
                                y: e.clientY,
                            };
                            setDragNodeData(item);
                        }}
                        onDragEnd={dragNodeEnd}
                        draggable={props.isEdit}
                    >
                        {/* 自定义节点 */}
                        {props.nodeRender ? props.nodeRender(item) : null}
                        {/* 拖拽节点上的四个链接点 */}
                        {props.isEdit &&
                            ["top", "right", "bottom", "left"].map(
                                (anchorItem: string) => {
                                    return (
                                        <div
                                            key={`${item.nodeId}_node_anchor_${anchorItem}`}
                                            id={`${item.nodeId}_${anchorItem}`}
                                            className={`node_anchor node_anchor_${anchorItem}`}
                                            onMouseDown={(e) => {
                                                dragNodeAnchorStart({ e });
                                                setMouseDownNode({
                                                    node: item,
                                                    anchor: anchorItem as DirectionType,
                                                });
                                            }}
                                            onMouseUp={() => {
                                                drawLine(mouseDownNode, {
                                                    node: item,
                                                    anchor: anchorItem as DirectionType,
                                                });
                                            }}
                                        />
                                    );
                                }
                            )}
                        {/* 删除节点按钮 */}
                        {props.isEdit && (
                            <div
                                title="删除节点"
                                className="delete_icon delete_node_icon"
                                onClick={() => {
                                    confirm({
                                        confirmTitle: `是否删除节点？`,
                                        confirmContent: `删除节点，会删除该节点的所有连线，是否确认删除？`,
                                        onOk: () => handleDeleteNode(item),
                                    });
                                }}
                            />
                        )}
                    </div>
                );
            })}
            {/* 暂无数据 */}
            {!showDataList.length &&
                !props.isEdit &&
                (props.noDataRender || (
                    <div className="no-data">
                        <img src={NoData} alt="暂无数据" />
                    </div>
                ))}
        </div>
    );
};

export default OrgChart;
