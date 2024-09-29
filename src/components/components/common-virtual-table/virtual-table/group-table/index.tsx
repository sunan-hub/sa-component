import { useMemo, useRef, useState } from "react";
import type {
    ShadowPositionType,
    VirtualColumnsType,
    VirtualTablePropsType,
} from "../const";
import {
    addOffset,
    calcFixedPosition,
    calcTableWidth,
    sortColumns,
} from "../const";
import TableHeader from "../table-header";
import TableCheckbox from "../table-checkbox";
import TableRow from "../table-row";
import lodash from "lodash";
import useScrollOffset from "@/hooks/use-scroll-offset";
import styles from "./index.less";

/** 表头默认高度 */
const DefaultHeaderHeight = 60;
/** 默认分组高度 */
const DefaultGroupHeight = 42 + 12; // 12是间隔

/** 获取随机背景颜色和对应文案颜色，背景颜色比字体要浅*/
const getRandomColor = () => {
    const color = Math.floor(Math.random() * 0xffffff).toString(16);
    return {
        bgColor: `#${color}cc`,
        fontColor: `#${color}`,
    };
};

/** 判断一个容器要不要隐藏 */
const isHide = (pa: {
    scrollTop: number;
    top: number;
    height: number;
    viewHeight: number;
}) => {
    const { scrollTop, top, height, viewHeight } = pa;
    // 预留的高度
    const reserveHeight = 100;
    return (
        top > scrollTop + viewHeight + reserveHeight ||
        top + height < scrollTop - reserveHeight
    );
};

/** 分组虚拟表格属性 */
type GroupVirtualTableProps = VirtualTablePropsType & {
    /** 分组的字段 */
    groupField: string;
};

/** 获取内容包装高度 */
const getContentHeight = (pa: {
    rowHeight: number; // 行高
    expandGroup: string[]; // 展开的分组
    groupData: { key: string; data: any[] }[]; // 分组后的数据
}) => {
    const { rowHeight, expandGroup, groupData } = pa;
    const height = groupData.reduce((total, item) => {
        return (
            total +
            DefaultGroupHeight +
            (expandGroup.includes(item.key) ? item.data.length * rowHeight : 0)
        );
    }, 0);
    return height;
};

/** 分组表格 */
const GroupVirtualTable = (props: GroupVirtualTableProps) => {
    /** 表格的ref */
    const tableRef = useRef<HTMLDivElement>(null);
    /** 表头的ref */
    const headerRef = useRef<HTMLDivElement>(null);
    /** 虚拟滚动条的ref */
    const scrollBarRef = useRef<HTMLDivElement>(null);
    /** 阴影位置 */
    const [shadowPosition, setShadowPosition] = useState<ShadowPositionType[]>(
        []
    );
    /** 每个分组的ref */
    const groupRef = useRef<Record<string, HTMLDivElement | undefined>>({});
    /** 对应的列，的偏移量 */
    const [columnOffset, setColumnOffset] = useState<Record<string, number>>(
        {}
    );
    /** 展开的分组 */
    const [expandGroup, setExpandGroup] = useState<string[]>([]);
    /** 当前表格滚动的scrollTop */
    const [tableScrollTop, setTableScrollTop] = useState(0);
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
    /** 分组后的数据 */
    const groupData = useMemo(() => {
        const newDroupData = lodash.groupBy(props.dataSource, props.groupField);
        return Object.keys(newDroupData).map((key) => {
            return {
                key,
                data: newDroupData[key],
            };
        });
    }, [props.dataSource, props.groupField]);
    /** 分组对应的top */
    const groupTop = useMemo(() => {
        // 分组对应的top
        const newGroupIndexTop = {
            index: [] as number[],
            key: {} as Record<string, number>,
        };
        groupData.forEach((item, index) => {
            if (!index) {
                newGroupIndexTop.index[index] = DefaultHeaderHeight + 12;
                newGroupIndexTop.key[item.key] = 0;
            } else {
                // 判断前一个分组是否展开
                if (expandGroup.includes(groupData[index - 1].key)) {
                    const top =
                        newGroupIndexTop.index[index - 1] +
                        groupData[index - 1].data.length * props.rowHeight +
                        DefaultGroupHeight;
                    newGroupIndexTop.index[index] = top;
                    newGroupIndexTop.key[item.key] =
                        top - newGroupIndexTop.index[0];
                } else {
                    const top =
                        newGroupIndexTop.index[index - 1] + DefaultGroupHeight;
                    newGroupIndexTop.index[index] = top;
                    newGroupIndexTop.key[item.key] =
                        top - newGroupIndexTop.index[0];
                }
            }
        });
        return newGroupIndexTop;
    }, [expandGroup, groupData]);

    /** 点击分组头部 */
    const handleGroupHeaderClick = (key: string) => {
        setExpandGroup((pre) => {
            if (pre.includes(key)) return pre.filter((item) => item !== key);
            return [...pre, key];
        });
    };

    useScrollOffset({
        setEventTarget: (eventTarget) => {
            if (!eventTarget) return;
            // 判断是否有阴影
            const shadow: ShadowPositionType[] = [];
            if (
                eventTarget?.scrollLeft <
                eventTarget.scrollWidth - eventTarget.clientWidth
            )
                shadow.push("right");
            if (eventTarget?.scrollLeft > 0) shadow.push("left");
            if (JSON.stringify(shadow) != JSON.stringify(shadowPosition))
                setShadowPosition(shadow);

            // 所有分跟着滚动
            Object.keys(groupRef.current).map((key) => {
                if (groupRef.current[key])
                    groupRef.current[key]!.scrollLeft = eventTarget.scrollLeft;
            });
            if (scrollBarRef.current)
                scrollBarRef.current.scrollLeft = eventTarget.scrollLeft;
        },
        ref: headerRef,
    });

    /** 分组滚动时，表头跟着滚动 */
    const groupScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const target = event.target as HTMLDivElement;
        if (headerRef.current) headerRef.current.scrollLeft = target.scrollLeft;
    };

    /** table滚动，判断哪些分组需要隐藏 */
    const handleTableScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const eventTarget = event.target as HTMLDivElement;
        setTableScrollTop(eventTarget.scrollTop);
    };

    return (
        <div
            ref={props.tableRef || tableRef}
            onScroll={handleTableScroll}
            className={styles["group-table-wrap"]}
            style={{
                maxWidth: props.scroll.x,
                maxHeight: props.scroll?.y,
                overflow: "auto",
            }}
        >
            <div className={styles["group-table-content-wrap"]}>
                {/* 表头 */}
                <div
                    className={`${styles["group-table-header-wrap"]} ${
                        props.fixedHeader ? styles.fixed : ""
                    } ${tableScrollTop ? styles.shadow : ""}`}
                >
                    <TableHeader
                        headerRef={headerRef}
                        columns={columns}
                        className={styles["group-table-header"]}
                        shadowPosition={shadowPosition}
                        fixedHeader={props.fixedHeader}
                        setColumnOffset={setColumnOffset}
                        style={{
                            height: props.headerHeight || DefaultHeaderHeight,
                            width: "100%",
                            overflow: "auto",
                            flexShrink: 0,
                        }}
                    />
                </div>

                {/* 表格内容 */}
                <div
                    className={styles["group-table-content"]}
                    style={{
                        height: getContentHeight({
                            rowHeight: props.rowHeight,
                            expandGroup,
                            groupData,
                        }),
                    }}
                >
                    {groupData.map((item) => {
                        if (
                            isHide({
                                scrollTop: tableScrollTop,
                                top: groupTop.key[item.key],
                                height: expandGroup.includes(item.key)
                                    ? DefaultGroupHeight +
                                      item.data.length * props.rowHeight
                                    : DefaultGroupHeight,
                                viewHeight: props.scroll?.y || 0,
                            })
                        )
                            return null;
                        return (
                            <div
                                key={item.key}
                                className={`${styles["group-box-wrap"]} ${
                                    expandGroup.includes(item.key)
                                        ? styles.open
                                        : ""
                                }`}
                                style={{ top: groupTop.key[item.key] }}
                            >
                                <div
                                    className={styles["group-wrap-header"]}
                                    onClick={() => {
                                        handleGroupHeaderClick(item.key);
                                    }}
                                >
                                    <div className={styles["arrow-icon"]} />
                                    <div
                                        className={styles.tag}
                                        style={{
                                            backgroundColor:
                                                getRandomColor().bgColor,
                                            color: getRandomColor().fontColor,
                                        }}
                                    >
                                        {item.key}
                                    </div>
                                    <div className={styles.total}>
                                        共{item.data?.length}个
                                    </div>
                                </div>
                                <div
                                    onScroll={groupScroll}
                                    className={styles["group-wrap-body"]}
                                    ref={(ref) => {
                                        groupRef.current[item.key] =
                                            ref || undefined;
                                    }}
                                    style={{
                                        height: expandGroup.includes(item.key)
                                            ? item.data.length *
                                                  props.rowHeight +
                                              6
                                            : 0,
                                    }}
                                >
                                    <div
                                        className={styles.placeholder}
                                        style={{
                                            width: tableWidth,
                                            height: 1,
                                        }}
                                    />
                                    {item.data.map((record, index) => {
                                        if (
                                            isHide({
                                                scrollTop: tableScrollTop,
                                                top:
                                                    groupTop.key[item.key] +
                                                    index * props.rowHeight,
                                                height: props.rowHeight,
                                                viewHeight:
                                                    props.scroll?.y || 0,
                                            })
                                        )
                                            return null;
                                        return (
                                            <TableRow
                                                key={
                                                    props.rowKey?.(record) ||
                                                    record.id ||
                                                    index
                                                }
                                                columns={columns}
                                                record={record}
                                                shadowPosition={shadowPosition}
                                                rowIndex={index}
                                                style={{
                                                    height: props.rowHeight,
                                                    position: "absolute",
                                                    top:
                                                        index * props.rowHeight,
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div
                ref={scrollBarRef}
                onScroll={groupScroll}
                className={styles["group-table-content-scroll-y"]}
            >
                <div className={styles.inner} style={{ width: tableWidth }} />
            </div>
        </div>
    );
};

export default GroupVirtualTable;
