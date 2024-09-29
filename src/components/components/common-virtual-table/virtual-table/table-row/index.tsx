import { ShadowPositionType, VirtualColumnsType } from "../const";
import styles from "./index.less";

/** 表格单元格 */
const TableCell = (props: {
    record: Record<string, any>;
    column: VirtualColumnsType;
    shadowPosition: ShadowPositionType[];
    rowIndex: number;
}) => {
    const { record, column, shadowPosition, rowIndex } = props;
    return (
        <div
            key={column.dataIndex}
            className={`${styles.cell} ${column.fixed ? styles.fixed : ""} ${
                column.isLastFixed
                    ? styles["last-fixed-" + column.isLastFixed]
                    : ""
            } ${shadowPosition.includes("left") ? styles["left-shadow"] : ""} ${
                shadowPosition.includes("right") ? styles["right-shadow"] : ""
            } ${column.align ? styles[column.align] : styles.left}`}
            style={{
                width: column.width,
                left: column.left,
                right: column.right,
            }}
        >
            {column.render?.(record[column.dataIndex], record, rowIndex) ||
                record[column.dataIndex]}
        </div>
    );
};

/** 表格行 */
const TableRow = (props: {
    columns: VirtualColumnsType[]; // 列配置
    record: Record<string, any>; // 行数据
    shadowPosition: ShadowPositionType[]; // 阴影位置
    rowIndex: number; // 行索引
    style?: React.CSSProperties; // 行样式
    className?: string; // 行类名
}) => {
    const { className, columns, record, shadowPosition, rowIndex, style } =
        props;

    return (
        <div
            className={`${styles["virtual-table-row"]} ${className || ""}`}
            style={style}
        >
            {columns?.map(
                (column) =>
                    column.children?.map((child) => {
                        return (
                            <TableCell
                                key={child.dataIndex}
                                record={record}
                                column={child}
                                shadowPosition={shadowPosition}
                                rowIndex={rowIndex}
                            />
                        );
                    }) || (
                        <TableCell
                            key={column.dataIndex}
                            record={record}
                            column={column}
                            shadowPosition={shadowPosition}
                            rowIndex={rowIndex}
                        />
                    )
            )}
        </div>
    );
};

export default TableRow;
