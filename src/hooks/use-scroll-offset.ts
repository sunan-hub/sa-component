import { useEffect, useRef } from 'react';
import lodash from 'lodash';

/** 监听DOM滚动 返回滚动距离和ref */
const useScrollOffset = (
  pa: {
    setEventTarget: (eventTarget: HTMLDivElement) => void;
    wait?: number;
    ref?: React.RefObject<HTMLDivElement>;
  },
  depend?: any[],
) => {
  const { setEventTarget, wait } = pa;
  const ref = useRef<HTMLDivElement>(null);

  const onScroll = (event: Event) => {
    const target = event.target as HTMLDivElement;
    setEventTarget(target);
  };

  const debounceScroll = lodash.debounce(onScroll, wait || 0);

  useEffect(() => {
    // 将 ref.current 复制到 currentRef 变量中
    const currentRef = pa.ref?.current || ref.current;
    const scroll = wait ? debounceScroll : onScroll;
    currentRef?.addEventListener('scroll', scroll);
    scroll({ target: currentRef } as Event);
    return () => {
      currentRef?.removeEventListener('scroll', scroll);
    };
  }, [setEventTarget, wait, ...(depend || [])]);

  return pa.ref || ref;
};

export { useScrollOffset as default, useScrollOffset };
