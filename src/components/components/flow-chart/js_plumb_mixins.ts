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

export type DataType = {
    nodeId: string;
    top: string[];
    bottom: string[];
    left: string[];
    right: string[];
    x: number;
    y: number;
};

// 创建连接
export const createConnections = (pa: {
    dataArr: DataType[];
    jsPlumb: any;
}) => {
    const { dataArr, jsPlumb } = pa;
    // 记录已经连线的线
    const connectionsNew: string[] = [];
    const dataMap: Record<string, DataType> = {};
    dataArr.forEach((item: DataType) => {
        dataMap[item.nodeId] = item;
    });
    if (!jsPlumb) return;
    // 初始化连线
    jsPlumb.batch(() => {
        dataArr.forEach((sourceItem: DataType) => {
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
                        paintStyle: { stroke: "#3a9ffc", strokeWidth: 2 },
                        anchors: [anchorStart, anchorEnd],
                        overlays: [],
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
