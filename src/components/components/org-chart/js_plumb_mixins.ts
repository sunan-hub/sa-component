import type { AnchorSpec, ConnectParams } from "jsplumb";

export type DirectionType = "top" | "bottom" | "left" | "right";

export const jsplumbSetting = {
    // 动态锚点、位置自适应
    // Anchors: ['Top', 'TopCenter', 'TopRight', 'TopLeft', 'Right', 'RightMiddle', 'Bottom', 'BottomCenter', 'BottomRight', 'BottomLeft', 'Left', 'LeftMiddle'],
    // 容器ID
    Container: "efContainer",
    // 连线的样式，直线或者曲线等，可选值:  StateMachine、Flowchart，Bezier、Straight
    // Connector: ['Bezier', {curviness: 100}],
    // Connector: ['Straight', { stub: 20, gap: 1 }],
    Connector: [
        "Flowchart",
        {
            stub: 20,
            gap: 1,
            alwaysRespectStubs: false,
            midpoint: 1,
            cornerRadius: 10,
        },
    ],
    // Connector: ['StateMachine', {margin: 5, curviness: 10, proximityLimit: 80}],
    // 鼠标不能拖动删除线
    ConnectionsDetachable: false,
    // 删除线的时候节点不删除
    DeleteEndpointsOnDetach: false,
    /**
     * 连线的两端端点类型：圆形
     * radius: 圆的半径，越大圆越大
     */
    // Endpoint: ['Dot', {radius: 5, cssClass: 'ef-dot', hoverClass: 'ef-dot-hover'}],
    /**
     * 连线的两端端点类型：矩形
     * height: 矩形的高
     * width: 矩形的宽
     */
    // Endpoint: ['Rectangle', {height: 20, width: 20, cssClass: 'ef-rectangle', hoverClass: 'ef-rectangle-hover'}],
    /**
     * 图像端点
     */
    // Endpoint: ['Image', {src: 'https://www.easyicon.net/api/resizeApi.php?id=1181776&size=32', cssClass: 'ef-img', hoverClass: 'ef-img-hover'}],
    /**
     * 空白端点
     */
    Endpoint: ["Blank", { Overlays: "" }],
    // Endpoints: [['Dot', {radius: 5, cssClass: 'ef-dot', hoverClass: 'ef-dot-hover'}], ['Rectangle', {height: 20, width: 20, cssClass: 'ef-rectangle', hoverClass: 'ef-rectangle-hover'}]],
    /**
     * 连线的两端端点样式
     * fill: 颜色值，如：#12aabb，为空不显示
     * outlineWidth: 外边线宽度
     */
    EndpointStyle: { fill: "#1879ffa1", outlineWidth: 1 },
    // 是否打开jsPlumb的内部日志记录
    LogEnabled: true,
    /**
     * 连线的样式
     */
    PaintStyle: {
        // 线的颜色
        stroke: "#000000",
        // 线的粗细，值越大线越粗
        strokeWidth: 1,
        // 设置外边线的颜色，默认设置透明，这样别人就看不见了，点击线的时候可以不用精确点击，参考 https://blog.csdn.net/roymno2/article/details/72717101
        outlineStroke: "transparent",
        // 线外边的宽，值越大，线的点击范围越大
        outlineWidth: 0,
    },
    DragOptions: { cursor: "pointer", zIndex: 2000 },
    /**
     *  叠加 参考： https://www.jianshu.com/p/d9e9918fd928
     */
    Overlays: [
        // 箭头叠加
        // [
        //     'Arrow',
        //     {
        //         width: 10, // 箭头尾部的宽度
        //         length: 8, // 从箭头的尾部到头部的距离
        //         location: 1, // 位置，建议使用0～1之间
        //         direction: 1, // 方向，默认值为1（表示向前），可选-1（表示向后）
        //         foldback: 0.623, // 折回，也就是尾翼的角度，默认0.623，当为1时，为正三角
        //     },
        // ],
        // [
        //     'Diamond',
        //     {
        //         events: {
        //             dblclick: function (diamondOverlay, originalEvent) {
        //                 console.log(
        //                     'double click on diamond overlay for : ' + diamondOverlay.component,
        //                 );
        //             },
        //         },
        //     },
        // ],
        // [
        //     'Label',
        //     {
        //         label: '+',
        //         location: 1,
        //         cssClass: 'aLabel',
        //     },
        // ],
    ],
    // 绘制图的模式 svg、canvas
    RenderMode: "svg",
    // 鼠标滑过线的样式
    HoverPaintStyle: { stroke: "#b0b2b5", strokeWidth: 1 },
    // 滑过锚点效果
    // EndpointHoverStyle: {fill: 'red'}
    Scope: "jsPlumb_DefaultScope", // 范围，具有相同scope的点才可连接
};

export const jsplumbSourceOptions = {
    // 设置可以拖拽的类名，只要鼠标移动到该类名上的DOM，就可以拖拽连线
    filter: ".flow-node-drag",
    filterExclude: false,
    // anchor: 'Continuous',
    anchors: ["BottomCenter"],
    // 是否允许自己连接自己
    allowLoopback: true,
    maxConnections: -1,
    onMaxConnections: function (info: any) {
        console.log(`超过了最大值连线: ${info.maxConnections}`);
    },
};

export const jsplumbTargetOptions = {
    // 设置可以拖拽的类名，只要鼠标移动到该类名上的DOM，就可以拖拽连线
    filter: ".flow-node-drag",
    filterExclude: false,
    // 是否允许自己连接自己
    // anchor: 'Continuous',
    anchors: ["TopCenter"],
    allowLoopback: true,
    dropOptions: { hoverClass: "ef-drop-hover" },
};

export const DirectionToAnchor: Record<string, AnchorSpec> = {
    left: "Left",
    right: "Right",
    top: "Top",
    bottom: "Bottom",
};

/**
 * 连线参数
 */
export const jsplumbConnectOptions = {
    isSource: true,
    isTarget: true,
    // 动态锚点、提供了4个方向 Continuous、AutoDefault
    // anchor: 'Continuous',
    // 设置连线上面的label样式
    labelStyle: {
        // cssClass: 'flowLabel',
    },
};

/** 渲染的节点数据类型 */
export type ShowNodeDataType = {
    nodeId: string;
    top: string[];
    bottom: string[];
    left: string[];
    right: string[];
    x: number;
    y: number;
};

// 拖动连接点
export const dragNodeAnchorStart = (pa: {
    e: any;
    mouseUpCallback?: (e: any) => void;
}) => {
    const { e, mouseUpCallback } = pa;
    // 连接点大小
    const anchorSize = 10;
    // 阻止默认事件
    e.preventDefault();
    // 记录鼠标按下时的拖动连接点的中心点坐标
    const leftCenter = e.target.getBoundingClientRect().left + anchorSize / 2;
    const topCenter = e.target.getBoundingClientRect().top + anchorSize / 2;
    // 生成一个临时的节点跟随鼠标移动(箭头)
    const tempNode = document.createElement("div");
    tempNode.id = "temp_node";
    tempNode.style.left = leftCenter + "px";
    tempNode.style.top = topCenter + "px";
    document.body.appendChild(tempNode);
    // 生成临时连线，链接点击的节点和临时节点
    const tempConnection = document.createElement("div");
    tempConnection.id = "temp_connection";
    tempConnection.style.left = leftCenter + 2 + "px";
    tempConnection.style.top = topCenter + 2 + "px";
    document.body.appendChild(tempConnection);
    // 监听鼠标移动
    const mouseMoveFn = (mouseMoveE: any) => {
        tempNode.style.left = mouseMoveE.clientX + "px";
        tempNode.style.top = mouseMoveE.clientY + "px";
        // 计算链接线的样式
        const left = mouseMoveE.clientX;
        const top = mouseMoveE.clientY;
        // 斜边
        const hypotenuse = Math.sqrt(
            Math.pow(Math.abs(left - leftCenter), 2) +
                Math.pow(Math.abs(top - topCenter), 2)
        );
        tempConnection.style.width = hypotenuse + "px";
        // 角度
        const angle =
            (Math.atan((top - topCenter) / (left - leftCenter)) / Math.PI) *
            180;
        // 判断是否在后方
        if (left - leftCenter < 0) {
            tempConnection.style.transform = `rotate(${angle + 180}deg)`;
            tempNode.style.transform = `rotate(${
                angle + 180
            }deg) translate(-50%, -50%)`;
        } else {
            tempConnection.style.transform = `rotate(${angle}deg)`;
            tempNode.style.transform = `rotate(${angle}deg) translate(-50%, -50%)`;
        }
    };
    document.addEventListener("mousemove", mouseMoveFn);
    // 监听鼠标抬起
    const mouseUpFn = (mouseUpE: any) => {
        // 阻止默认事件
        mouseUpE.preventDefault();
        // 删除临时节点
        document.body.removeChild(tempNode);
        // 删除临时连线
        document.body.removeChild(tempConnection);
        // 删除鼠标移动事件
        document.removeEventListener("mousemove", mouseMoveFn);
        // 删除鼠标抬起事件
        document.removeEventListener("mouseup", mouseUpFn);
        if (mouseUpCallback) mouseUpCallback(mouseUpE);
    };
    document.addEventListener("mouseup", mouseUpFn);
};

// 创建连接
export const createConnections = (pa: {
    dataArr: ShowNodeDataType[];
    jsPlumb: any;
    showLabel?: boolean;
}) => {
    const { dataArr, jsPlumb, showLabel = true } = pa;
    // 记录已经连线的线
    const connectionsNew: string[] = [];
    const dataMap: Record<string, ShowNodeDataType> = {};
    dataArr.forEach((item: ShowNodeDataType) => {
        dataMap[item.nodeId] = item;
    });
    if (!jsPlumb) return;
    // 初始化连线
    jsPlumb.batch(() => {
        dataArr.forEach((sourceItem: ShowNodeDataType) => {
            const directions: DirectionType[] = [
                "bottom",
                "left",
                "right",
                "top",
            ];
            // 遍历四个方向，从四个防线发出连线
            directions.forEach((direction) => {
                sourceItem[direction].forEach((targetId: string) => {
                    // 发出连线的方向
                    const anchorStart = DirectionToAnchor[direction];
                    // 目标接收连线的方向
                    let anchorEnd = DirectionToAnchor[direction];
                    // 如果目标节点的其他方向存在发出连线的情况，则将目标节点的接收连线的方向设置为发出连线的方向
                    directions
                        .filter((item: string) => item !== direction)
                        .forEach((item) => {
                            if (
                                dataMap[targetId]?.[item].includes(
                                    sourceItem.nodeId
                                )
                            ) {
                                anchorEnd = DirectionToAnchor[item];
                            }
                        });
                    const connParam: ConnectParams & { paintStyle: any } = {
                        source: sourceItem.nodeId,
                        target: targetId,
                        endpoint: "Blank",
                        connector: "Flowchart",
                        cssClass: "org-connection",
                        paintStyle: { stroke: "#d1d2d4" },
                        anchors: [anchorStart, anchorEnd],
                        overlays: showLabel
                            ? [
                                  [
                                      "Label",
                                      {
                                          label: "",
                                          location: 25,
                                          cssClass:
                                              "delete_icon delete_line_icon",
                                          visible: true,
                                      },
                                  ],
                              ]
                            : [],
                    };
                    // 避免重复连线
                    const oldConnId = `${targetId}_${anchorEnd}-${sourceItem.nodeId}_${anchorStart}`;
                    if (connectionsNew.includes(oldConnId)) return;
                    // 连线
                    jsPlumb.connect(connParam);
                    // 记录已经连线的线
                    connectionsNew.push(
                        `${sourceItem.nodeId}_${anchorStart}-${targetId}_${anchorEnd}`
                    );
                });
            });
        });
    });
};

// 判断拖拽的节点是否进入范围
export const isEnterScope = (pa: {
    nodeCoordinate: { x: number; y: number }; // 拖拽中的节点坐标
    matrixItem: { x: number; y: number }; // 矩阵项
    addNodeHeight: number; // 添加节点的高度和宽度
}) => {
    const { nodeCoordinate, matrixItem, addNodeHeight } = pa;
    return (
        nodeCoordinate.x - matrixItem.x < addNodeHeight &&
        nodeCoordinate.x - matrixItem.x > 0 &&
        nodeCoordinate.y - matrixItem.y < addNodeHeight &&
        nodeCoordinate.y - matrixItem.y > 0
    );
};
