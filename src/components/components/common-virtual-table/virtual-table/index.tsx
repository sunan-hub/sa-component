import { useMemo, useRef, useState } from "react";
import type {
    VirtualTablePropsType,
    VirtualColumnsType,
    ShadowPositionType,
} from "./const";
import {
    addOffset,
    calcFixedPosition,
    calcTableWidth,
    sortColumns,
} from "./const";
import useScrollOffset from "@/hooks/use-scroll-offset";
import TableHeader from "./table-header";
import TableCheckbox from "./table-checkbox";
import TableRow from "./table-row";
import VirtualList, { type RenderVirtualWrapParamsType } from "./virtual-list";
import lodash from "lodash";
import styles from "./index.less";

/** 虚拟表格 */
export const VirtualTable = (props: VirtualTablePropsType) => {
    /** 对应的列，的偏移量 */
    const [columnOffset, setColumnOffset] = useState<Record<string, number>>(
        {}
    );
    /** 阴影位置 */
    const [shadowPosition, setShadowPosition] = useState<ShadowPositionType[]>(
        []
    );
    /** 表格的ref */
    const tableRef = useRef<HTMLDivElement>(null);

    /** 用于渲染的列 */
    const columns = useMemo(() => {
        const cols = addOffset(lodash.cloneDeep(props.columns), columnOffset);
        if (props.rowSelection) {
            const checkbox: VirtualColumnsType = {
                title: (
                    <TableCheckbox
                        checkedList={props.rowSelection?.selectedRowKeys || []}
                        dataSource={props.dataSource}
                        rowSelection={props.rowSelection}
                    />
                ),
                dataIndex: "rowSelection",
                width: props.rowSelection.width || 52,
                fixed: props.rowSelection.fixed,
                align: "center",
                render: (text, record) => (
                    <TableCheckbox
                        record={record}
                        rowKey={props.rowKey}
                        checkedList={props.rowSelection?.selectedRowKeys || []}
                        dataSource={props.dataSource}
                        rowSelection={props.rowSelection}
                    />
                ),
            };
            if (props.rowSelection.fixed === "right") {
                cols.push(checkbox);
            } else cols.unshift(checkbox);
        }
        return calcFixedPosition(sortColumns(cols));
    }, [
        columnOffset,
        props.columns,
        props.rowSelection,
        props.dataSource,
        props.rowKey,
    ]);

    /** 表格宽度 */
    const tableWidth = useMemo(() => {
        return calcTableWidth(columns);
    }, [columns]);

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

    /** 自定义外包装 */
    const renderWrap = (pa: RenderVirtualWrapParamsType) => {
        const { showDataList, finialStartIndex, scrollAreaRef } = pa;

        return (
            <div
                className={`${styles["virtual-table-wrap"]} ${props.className}`}
                ref={scrollAreaRef}
                style={{
                    maxWidth: props.scroll.x,
                    maxHeight: props.scroll.y,
                    overflow: (props.scroll && "auto") || "visible",
                }}
            >
                {/* 表头 */}
                <TableHeader
                    columns={columns}
                    shadowPosition={shadowPosition}
                    fixedHeader={props.fixedHeader}
                    style={{ height: props.headerHeight || "max-content" }}
                    setColumnOffset={setColumnOffset}
                />

                {/* 表体 */}
                <div
                    className={styles["virtual-table-body"]}
                    style={{
                        width: tableWidth,
                        height: props.dataSource.length * props.rowHeight,
                    }}
                >
                    <div
                        className={styles.viewport}
                        style={{
                            position: "relative",
                            transform: `translateY(${
                                finialStartIndex * props.rowHeight
                            }px)`,
                        }}
                    >
                        {showDataList.map((record, index) => (
                            <TableRow
                                key={
                                    props.rowKey?.(record) || record.id || index
                                }
                                columns={columns}
                                record={record}
                                shadowPosition={shadowPosition}
                                rowIndex={index}
                                style={{ height: props.rowHeight }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <VirtualList
            visibleHeight={props.scroll.y}
            itemHeight={props.rowHeight}
            dataList={props.dataSource}
            scrollAreaRef={props.tableRef || tableRef}
            renderWrap={renderWrap}
        />
    );
};

export default VirtualTable;
