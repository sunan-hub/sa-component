import { useRef } from "react";
import type { ShadowPositionType, VirtualColumnsType } from "../const";
import lodash from "lodash";
import styles from "./index.less";

/** 传入某一列的偏移量，子集要递归去平分偏移量 */
const calcChildrenOffset = (pa: {
    columns: VirtualColumnsType[]; // 列设置
    dataIndex: string; // 当前列的dataIndex
    moveDistance: number; // 移动的距离
    columnOffset: Record<string, number>; // 列的偏移量
}) => {
    const { columns, dataIndex, moveDistance, columnOffset } = pa;
    const column = columns.find((item) => item.dataIndex === dataIndex);
    if (column?.children?.length) {
        column.children?.map((item) => {
            // 子集的偏移量
            const childrenMoveDistance =
                moveDistance / (column.children?.length || 1);
            columnOffset[item.dataIndex] = childrenMoveDistance;
            calcChildrenOffset({
                columns: item.children || [],
                dataIndex: item.dataIndex,
                moveDistance: childrenMoveDistance,
                columnOffset,
            });
        });
    }
};

/** 传入某一列的偏移量，递归给所有父级加上 */
const calcParentOffset = (pa: {
    fullColumns: VirtualColumnsType[]; // 列设置
    dataIndex: string; // 当前列的dataIndex
    moveDistance: number; // 移动的距离
    columnOffset: Record<string, number>; // 列的偏移量
}) => {
    const { fullColumns, dataIndex, moveDistance, columnOffset } = pa;
    const parentColumn = fullColumns.find((item) =>
        item.children?.map((child) => child.dataIndex).includes(dataIndex)
    );
    if (parentColumn) {
        columnOffset[parentColumn.dataIndex] = moveDistance;
        calcParentOffset({
            fullColumns,
            dataIndex: parentColumn.dataIndex,
            moveDistance,
            columnOffset,
        });
    }
};

/** 表头-带有子表头 */
const Header = (props: {
    /** 用于渲染的列 */
    columns: VirtualColumnsType[];
    /** 全量的列 */
    fullColumns?: VirtualColumnsType[];
    /** 阴影位置 */
    shadowPosition: ShadowPositionType[];
    /** 是否开启鼠标点击事件，浏览器默认行为 */
    isMouseDownDefault?: boolean;
    /** 设置对应列的偏移量 */
    setColumnOffset: React.Dispatch<
        React.SetStateAction<Record<string, number>>
    >;
}) => {
    const {
        columns,
        fullColumns,
        shadowPosition,
        isMouseDownDefault,
        setColumnOffset,
    } = props;
    /** 鼠标按下时的坐标 */
    const mouseDownPosition = useRef({ x: 0, y: 0 });
    /** 鼠标按下时的column的dataIndex */
    const mouseDownColumn = useRef<string>();

    /** 鼠标移动 */
    const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        /** 移动的距离 */
        const moveDistance = {
            x: e.clientX - mouseDownPosition.current.x,
            y: e.clientY - mouseDownPosition.current.y,
        };
        mouseDownPosition.current = { x: e.clientX, y: e.clientY };
        if (mouseDownColumn.current) {
            setColumnOffset((prev) => {
                if (mouseDownColumn.current) {
                    let columnOffset: Record<string, number> = {};
                    // 计算子集的偏移量
                    calcChildrenOffset({
                        columns,
                        dataIndex: mouseDownColumn.current,
                        moveDistance: moveDistance.x,
                        columnOffset: columnOffset,
                    });
                    // 计算父级的偏移量
                    calcParentOffset({
                        fullColumns: fullColumns || columns,
                        dataIndex: mouseDownColumn.current,
                        moveDistance: moveDistance.x,
                        columnOffset: columnOffset,
                    });
                    const newValue = {
                        ...prev,
                        [mouseDownColumn.current]: prev[mouseDownColumn.current]
                            ? prev[mouseDownColumn.current] + moveDistance.x
                            : moveDistance.x,
                    };
                    Object.keys(columnOffset).map((key) => {
                        newValue[key] = prev[key]
                            ? prev[key] + columnOffset[key]
                            : columnOffset[key];
                    });
                    return newValue;
                }
                return prev;
            });
        }
    };

    /** 防抖鼠标移动 */
    const handleMouseMoveDebounce = lodash.debounce(handleMouseMove, 16);

    /** 节流鼠标移动 */
    const handleMouseMoveThrottle = lodash.throttle(
        handleMouseMoveDebounce,
        100
    );

    /** 鼠标按下 */
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isMouseDownDefault) {
            e.preventDefault();
            e.stopPropagation();
        }
        mouseDownPosition.current = { x: e.clientX, y: e.clientY };
        document.addEventListener("mousemove", handleMouseMoveThrottle);
    };

    /** 鼠标抬起 */
    document.addEventListener("mouseup", () => {
        document.removeEventListener("mousemove", handleMouseMoveThrottle);
    });

    return columns?.map((column) => {
        return (
            <div
                key={column.dataIndex}
                style={{
                    width: column.width,
                    minWidth: column.width,
                    left: column.left,
                    right: column.right,
                }}
                className={`${styles["header-cell-wrap"]} ${
                    column.fixed ? styles.fixed : ""
                } ${
                    column.isLastFixed
                        ? styles["last-fixed-" + column.isLastFixed]
                        : ""
                } ${
                    shadowPosition.includes("left") ? styles["left-shadow"] : ""
                } ${
                    shadowPosition.includes("right")
                        ? styles["right-shadow"]
                        : ""
                }`}
            >
                {/* 把手 */}
                <div
                    className={styles.handle}
                    onMouseDown={(e) => {
                        mouseDownColumn.current = column.dataIndex;
                        handleMouseDown(e);
                    }}
                />
                <div
                    className={`${styles.cell} ${
                        styles[column.align || ""] || styles.left
                    }`}
                    style={{
                        width: column.width,
                        minWidth: column.width,
                    }}
                >
                    {column.title}
                </div>
                {column.children && (
                    <div className={styles["children-cell-wrap"]}>
                        <Header
                            columns={column.children}
                            fullColumns={fullColumns || columns}
                            shadowPosition={shadowPosition}
                            isMouseDownDefault={isMouseDownDefault}
                            setColumnOffset={setColumnOffset}
                        />
                    </div>
                )}
            </div>
        );
    }) as any;
};

/** 表格表头属性 */
export type TableHeaderProps = {
    /** 表头的ref */
    headerRef?: React.RefObject<HTMLDivElement>;
    /** 类名 */
    className?: string;
    /** 样式 */
    style?: React.CSSProperties;
    /** 用于渲染的列 */
    columns: VirtualColumnsType[];
    /** 阴影位置 */
    shadowPosition: ShadowPositionType[];
    /** 是否固定表头 */
    fixedHeader?: boolean;
    /** 是否开启鼠标点击事件，浏览器默认行为 */
    isMouseDownDefault?: boolean;
    /** 设置对应列的偏移量 */
    setColumnOffset: React.Dispatch<
        React.SetStateAction<Record<string, number>>
    >;
};

/** 表格-表头 */
const TableHeader = (props: TableHeaderProps) => {
    const {
        headerRef,
        columns,
        shadowPosition,
        style,
        fixedHeader,
        isMouseDownDefault,
        setColumnOffset,
    } = props;

    return (
        <div
            ref={headerRef}
            className={`${styles["virtual-table-header"]} ${
                fixedHeader ? styles.fixed : ""
            } ${shadowPosition.includes("top") ? styles.shadow : ""} ${
                props.className || ""
            }`}
            style={style}
        >
            <Header
                columns={columns}
                isMouseDownDefault={isMouseDownDefault}
                shadowPosition={shadowPosition}
                setColumnOffset={setColumnOffset}
            />
        </div>
    );
};

export default TableHeader;
