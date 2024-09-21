import React, { useMemo, useRef, useState } from "react";
import type {
    LazyTablePropsType,
    LazyColumnsType,
    ShadowPositionType,
} from "./const";
import { calcFixedPosition, calcTableWidth, sortColumns } from "./const";
import { InView } from "react-intersection-observer";
import useScrollOffset from "@/hooks/use-scroll-offset";
import "./index.less";

/** 表头-带有子表头 */
const Header: any = (props: {
    columns: LazyColumnsType[];
    shadowPosition: ShadowPositionType[];
}) => {
    const { columns, shadowPosition } = props;
    return columns?.map((column) => {
        return (
            <InView key={column.dataIndex}>
                {({ inView, ref }) => {
                    return (
                        <div
                            ref={ref}
                            style={{
                                width: column.width,
                                minWidth: column.width,
                                left: column.left,
                                right: column.right,
                            }}
                            className={`headerCellWrap ${
                                column.fixed ? "fixed" : ""
                            } ${
                                column.isLastFixed
                                    ? "lastFixed-" + column.isLastFixed
                                    : ""
                            } ${
                                shadowPosition.includes("left")
                                    ? "leftShadow"
                                    : ""
                            } ${
                                shadowPosition.includes("right")
                                    ? "rightShadow"
                                    : ""
                            }`}
                        >
                            {inView && (
                                <div
                                    className="cell"
                                    style={{
                                        width: column.width,
                                        minWidth: column.width,
                                    }}
                                >
                                    {column.title}
                                </div>
                            )}
                            {inView && column.children && (
                                <div className="childrenCellWrap">
                                    <Header
                                        columns={column.children}
                                        shadowPosition={shadowPosition}
                                    />
                                </div>
                            )}
                        </div>
                    );
                }}
            </InView>
        );
    });
};

/** 表体单元格 */
const BodyCell = (props: {
    record: Record<string, any>;
    column: LazyColumnsType;
    shadowPosition: ShadowPositionType[];
    rowIndex: number;
}) => {
    const { record, column, shadowPosition, rowIndex } = props;
    return (
        <div
            key={column.dataIndex}
            className={`cell ${column.fixed ? "fixed" : ""} ${
                column.isLastFixed ? "lastFixed-" + column.isLastFixed : ""
            } ${shadowPosition.includes("left") ? "leftShadow" : ""} ${
                shadowPosition.includes("right") ? "rightShadow" : ""
            } ${column.align || "left"}`}
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

/** 懒加载表格 */
export const LazyTable = (props: LazyTablePropsType) => {
    /** 阴影位置 */
    const [shadowPosition, setShadowPosition] = useState<ShadowPositionType[]>(
        []
    );

    /** 表格的ref */
    const tableRef = useRef<HTMLDivElement>(null);

    /** 用于渲染的列 */
    const columns = useMemo(() => {
        return calcFixedPosition(sortColumns(props.columns));
    }, [props.columns]);

    /** 表格宽度 */
    const tableWidth = useMemo(() => {
        return calcTableWidth(props.columns);
    }, [props.columns]);

    // 监听滚动
    useScrollOffset({
        setEventTarget: (eventTarget) => {
            const shadow: ShadowPositionType[] = [];
            if (
                eventTarget.scrollLeft <
                eventTarget.scrollWidth - eventTarget.clientWidth
            )
                shadow.push("right");
            if (eventTarget.scrollLeft > 0) shadow.push("left");
            if (eventTarget.scrollTop > 0) shadow.push("top");
            if (JSON.stringify(shadow) != JSON.stringify(shadowPosition))
                setShadowPosition(shadow);
        },
        ref: props.tableRef || tableRef,
    });

    return (
        <div
            className={`lazyTableWrap ${props.className}`}
            ref={props.tableRef || tableRef}
            style={{
                width: props.scroll?.x,
                height: props.scroll?.y,
                overflow: (props.scroll && "auto") || "visible",
            }}
        >
            {/* 表头 */}
            <div
                className={`lazyTableHeader ${
                    props.fixedHeader ? "fixed" : ""
                } ${shadowPosition.includes("top") ? "shadow" : ""}`}
                style={{
                    height: props.headerHeight || "max-content",
                }}
            >
                <Header columns={columns} shadowPosition={shadowPosition} />
            </div>

            {/* 表体 */}
            <div className="lazyTableBody" style={{ width: tableWidth }}>
                {props.dataSource?.map((record, index) => (
                    <InView key={props.rowKey?.(record) || record.id || index}>
                        {({ inView, ref }) => (
                            <div
                                className="lazyTableRow"
                                ref={ref}
                                style={{ height: props.rowHeight }}
                            >
                                {inView &&
                                    columns?.map(
                                        (column) =>
                                            column.children?.map((child) => {
                                                return (
                                                    <BodyCell
                                                        key={child.dataIndex}
                                                        record={record}
                                                        column={child}
                                                        shadowPosition={
                                                            shadowPosition
                                                        }
                                                        rowIndex={index}
                                                    />
                                                );
                                            }) || (
                                                <BodyCell
                                                    key={column.dataIndex}
                                                    record={record}
                                                    column={column}
                                                    shadowPosition={
                                                        shadowPosition
                                                    }
                                                    rowIndex={index}
                                                />
                                            )
                                    )}
                            </div>
                        )}
                    </InView>
                ))}
            </div>
        </div>
    );
};

export default LazyTable;
