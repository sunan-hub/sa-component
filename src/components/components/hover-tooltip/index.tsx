import React, { useRef, useState, useEffect, type CSSProperties } from 'react';
import type { TooltipProps } from 'antd/lib/tooltip';
import BasicTooltip from '@/basics-components/basic-tooltip';

const HoverTooltip = (
    props: TooltipProps & { childrenStyle?: CSSProperties; childrenClassName?: string },
) => {
    const { title, children, childrenClassName, childrenStyle, ...rest } = props;
    const ref = useRef(null);
    // 是否显示tooltip
    const [show, setShow] = useState(false);
    // 显示省略号的样式
    const ellipsisStyle: React.CSSProperties = {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'inline-block',
        verticalAlign: 'middle',
        maxWidth: '100%',
        flex: 1,
    };

    // 判断是否需要显示省略号
    const isEllipsis = () => {
        const parentDom = ref.current;
        if (!parentDom) return false;
        const { offsetWidth, scrollWidth } = parentDom;
        return offsetWidth < scrollWidth;
    };

    useEffect(() => {
        setShow(isEllipsis());
    }, [children]);

    return (
        <BasicTooltip title={show ? title : null} {...rest}>
            <div
                ref={ref}
                style={{ ...ellipsisStyle, ...childrenStyle }}
                className={childrenClassName}
            >
                {children}
            </div>
        </BasicTooltip>
    );
};

export default HoverTooltip;
