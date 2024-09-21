/** 阴影位置类型 */
export type ShadowPositionType = 'left' | 'right' | 'top';

/** 懒加载表格 */
export type LazyTablePropsType = {
    /** 表头 */
    columns: LazyColumnsType[];
    /** 数据源 */
    dataSource: Record<string, any>[];
    /** 表头高度 */
    headerHeight?: number;
    /** 表体行高 */
    rowHeight: number;
    /** 是否固定表头 */
    fixedHeader?: boolean;
    /** 表格是否可滚动，也可以指定滚动区域的宽、高 */
    scroll?: { x?: number | string; y?: number | string };
    /** 表格类名 */
    className?: string;
    /** ref */
    tableRef?: React.RefObject<HTMLDivElement>;
    /** 行的主键 */
    rowKey?: (record: Record<string, any>) => string;
};

/** 列类型 */
export type LazyColumnsType = {
    /** 列标题 */
    title: string;
    /** 列数据源 */
    dataIndex: string;
    /** 列宽度 */
    width: number;
    /** 列对齐方式 */
    align?: 'left' | 'center' | 'right';
    /** 列渲染 */
    render?: (text: any, record: any, index: number) => React.ReactNode;
    /** 子列 */
    children?: LazyColumnsType[];
    /** 是否固定列 */
    fixed?: 'left' | 'right';
    /** 固定列的位置 */
    left?: number;
    right?: number;

    /** 是否是最后一个固定列，组件内自动计算，外界不需要传 */
    isLastFixed?: 'left' | 'right';
};

/** 递归计算表格宽度 */
export const calcTableWidth: (columns: LazyColumnsType[]) => number = (
    columns: LazyColumnsType[],
) => {
    return (
        columns?.reduce((prev, current) => {
            return current.children
                ? prev + calcTableWidth(current.children)
                : prev + current.width;
        }, 0) || 0
    );
};

/** 列排序，按固定左右排序 */
export const sortColumns = (columns: LazyColumnsType[]) => {
    return columns?.sort((a, b) => {
        if (a.fixed === 'left' && b.fixed === 'right') {
            return -1;
        }
        if (a.fixed === 'right' && b.fixed === 'left') {
            return 1;
        }
        return 0;
    });
};

/** 根据顺序计算固定列的固定位置 */
export const calcFixedPosition = (columns: LazyColumnsType[]) => {
    let left = 0;
    let right = 0;
    columns?.map((column) => {
        if (column.fixed === 'left') {
            column.left = left;
            left += column.width;
        }
        return column;
    });
    columns?.reverse().map((column) => {
        if (column.fixed === 'right') {
            column.right = right;
            right += column.width;
        }
        return column;
    });
    columns?.reverse().map((column) => {
        if (column.left && left) column.isLastFixed = 'left';
        if (column.right && right) column.isLastFixed = 'right';
        return column;
    });
    return columns;
};
