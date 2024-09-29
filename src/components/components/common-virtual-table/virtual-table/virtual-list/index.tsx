import useScrollOffset from "@/hooks/use-scroll-offset";
import { useMemo, useRef, useState } from "react";
import styles from "./index.less";

export type RenderVirtualWrapParamsType = {
    /** 滚动区域的ref */
    scrollAreaRef: React.RefObject<HTMLDivElement>;
    /** 最终展示的数据 */
    showDataList: any[];
    /** 上缓冲区起始索引 */
    finialStartIndex: number;
};

type VirtualListProps = {
    /** 滚动区域的ref */
    scrollAreaRef?: React.RefObject<HTMLDivElement>;
    /** 单项高度 */
    itemHeight: number;
    /** 可视区域高度 */
    visibleHeight: number;
    /** 数据源 */
    dataList: any[];
    /** 外包装类名 */
    wrapClassName?: string;
    /** 填充区域类名 */
    fillClassName?: string;
    /** 可视区域类名 */
    viewportClassName?: string;
    /** 单项渲染函数 */
    children?: (item: any, index: number) => React.ReactNode;
    /** 自定义渲染wrap */
    renderWrap?: (pa: RenderVirtualWrapParamsType) => JSX.Element;
};

/** 虚拟滚动列表 */
const VirtualList = (props: VirtualListProps) => {
    const { children, renderWrap } = props;
    /** 滚动区域的ref */
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    /** 记录滚动掉的高度 */
    const [scrollOffset, setScrollOffset] = useState(0);
    /** 可视区能展示的元素的最大个数 */
    const numVisible = Math.ceil(props.visibleHeight / props.itemHeight);

    /** 可视区起始索引 */
    const startIndex = useMemo(() => {
        return Math.floor(scrollOffset / props.itemHeight);
    }, [scrollOffset]);

    /** 上缓冲区起始索引 */
    const finialStartIndex = useMemo(() => {
        return Math.max(0, startIndex - 2);
    }, [startIndex]);

    /** 下缓冲区结束索引 */
    const endIndex = useMemo(() => {
        return Math.min(props.dataList.length, startIndex + numVisible + 2);
    }, [props.dataList.length, startIndex, numVisible]);

    /** 最终展示的数据 */
    const showDataList = useMemo(() => {
        return props.dataList.slice(finialStartIndex, endIndex);
    }, [props.dataList, finialStartIndex, endIndex]);

    // 监听滚动
    useScrollOffset({
        setEventTarget: (eventTarget) => {
            // 记录滚动掉的高度
            setScrollOffset(eventTarget.scrollTop);
        },
        ref: props.scrollAreaRef || scrollAreaRef,
    });

    if (renderWrap)
        return renderWrap({
            scrollAreaRef: props.scrollAreaRef || scrollAreaRef,
            showDataList,
            finialStartIndex,
        });

    return (
        <div
            className={`${styles["virtual-list-wrap"]} ${props.wrapClassName}`}
            ref={props.scrollAreaRef || scrollAreaRef}
            style={{ maxHeight: props.visibleHeight }}
        >
            {/* 填充区域 */}
            <div
                className={`${styles["fill-area"]} ${props.fillClassName}`}
                style={{ height: props.dataList.length * props.itemHeight }}
            >
                {/* 可视区域 */}
                <div
                    className={`${styles.viewport} ${props.viewportClassName}`}
                    style={{
                        transform: `translateY(${
                            finialStartIndex * props.itemHeight
                        }px)`,
                    }}
                >
                    {showDataList.map((item, index) => children?.(item, index))}
                </div>
            </div>
        </div>
    );
};

export default VirtualList;
