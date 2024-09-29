import type { CheckedType } from "./table-checkbox/checkbox";

/** 阴影位置类型 */
export type ShadowPositionType = "left" | "right" | "top";

/** 表格行选择配置类型 */
export type RowSelectionType = {
    /** 选择框列的宽度 */
    width?: number;
    /** 把选择框列固定 */
    fixed?: "left" | "right";
    /** 指定选中项的 key 数组，需要和 onChange 进行配合 */
    selectedRowKeys: React.Key[];
    /** 选中的行 */
    onChange: (selectedRowKeys: React.Key[]) => void;
    /** 自定义渲染复选框 */
    render?: (pa: {
        checked: CheckedType;
        record?: Record<string, any>;
    }) => React.ReactNode;
};

/** 懒加载表格 */
export type VirtualTablePropsType = {
    /** 表头 */
    columns: VirtualColumnsType[];
    /** 数据源 */
    dataSource: Record<string, any>[];
    /** 表头高度 */
    headerHeight?: number;
    /** 表体行高 */
    rowHeight: number;
    /** 是否固定表头 */
    fixedHeader?: boolean;
    /** 表格是否可滚动，也可以指定滚动区域的宽、高 */
    scroll: { x?: number | string; y: number };
    /** 表格类名 */
    className?: string;
    /** ref */
    tableRef?: React.RefObject<HTMLDivElement>;
    /** 表格行是否可选择 */
    rowSelection?: RowSelectionType;
    /** 行的主键 */
    rowKey?: (record: Record<string, any>) => string;
};

/** 列类型 */
export type VirtualColumnsType = {
    /** 列标题 */
    title: string | React.ReactNode;
    /** 列数据源 */
    dataIndex: string;
    /** 列宽度 */
    width: number;
    /** 列对齐方式 */
    align?: "left" | "center" | "right";
    /** 列渲染 */
    render?: (text: any, record: any, index: number) => React.ReactNode;
    /** 子列 */
    children?: VirtualColumnsType[];
    /** 是否固定列 */
    fixed?: "left" | "right";
    /** 固定列的位置 */
    left?: number;
    right?: number;
    /** 是否是最后一个固定列，组件内自动计算，外界不需要传 */
    isLastFixed?: "left" | "right";
};

/** 递归计算表格宽度 */
export const calcTableWidth: (columns: VirtualColumnsType[]) => number = (
    columns: VirtualColumnsType[]
) => {
    return (
        columns?.reduce((prev, current) => {
            return current.children
                ? prev + calcTableWidth(current.children)
                : prev + current.width;
        }, 0) || 0
    );
};

/** 列排序，按固定左右排序，左固定放最前面，又固定方最后面 */
export const sortColumns = (columns: VirtualColumnsType[]) => {
    const leftColumns: VirtualColumnsType[] = [];
    const rightColumns: VirtualColumnsType[] = [];
    const centerColumns: VirtualColumnsType[] = [];
    columns?.map((column) => {
        if (column.fixed === "left") {
            leftColumns.push(column);
        } else if (column.fixed === "right") {
            rightColumns.push(column);
        } else {
            centerColumns.push(column);
        }
    });
    return [...leftColumns, ...centerColumns, ...rightColumns];
};

/** 根据顺序计算固定列的固定位置 */
export const calcFixedPosition = (columns: VirtualColumnsType[]) => {
    let left = 0;
    let right = 0;
    columns?.map((column) => {
        if (column.fixed === "left") {
            column.left = left;
            left += column.width;
        }
        return column;
    });
    columns?.reverse().map((column) => {
        if (column.fixed === "right") {
            column.right = right;
            right += column.width;
        }
        return column;
    });
    columns?.reverse().map((column) => {
        if (column.left == left - column.width) column.isLastFixed = "left";
        if (column.right == right - column.width) column.isLastFixed = "right";
        return column;
    });
    return columns;
};

/** 传入全columns和dataIndex判断有多少叶子节点 */
export const getLeafColumns = (pa: {
    columns: VirtualColumnsType[];
    dataIndex: string;
}) => {
    const { columns, dataIndex } = pa;
    const column = columns.find((column) => column.dataIndex === dataIndex);
    if (!column?.children?.length) return 1; // 当前节点是叶子节点
    let leafCount = 0;
    column.children?.forEach((child) => {
        leafCount += getLeafColumns({
            columns: column.children || [],
            dataIndex: child.dataIndex,
        });
    });
    return leafCount;
};

/** 递归给columns的宽度加上偏移量 */
export const addOffset = (
    columns: VirtualColumnsType[],
    offset: Record<string, number>
): VirtualColumnsType[] => {
    return columns.map((column) => {
        const leafCount = getLeafColumns({
            columns: columns,
            dataIndex: column.dataIndex,
        });
        const newColumnWidth = column.width + (offset[column.dataIndex] || 0);
        // 判断是否最小宽度，应该在计算总偏移量的时候就判断 TODO
        if (newColumnWidth < leafCount * 40) {
            column.width = leafCount * 40;
        } else column.width = newColumnWidth;
        /** 递归子列 */
        if (column.children)
            column.children = addOffset(column.children, offset);
        return column;
    });
};
