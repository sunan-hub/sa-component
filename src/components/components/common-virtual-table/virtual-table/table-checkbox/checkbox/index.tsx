import { useEffect, useState } from "react";
import styles from "./index.less";

/** 选择状态：选中、半选、未选 */
export type CheckedType = "checked" | "half" | "unchecked";

/** 复选框组件属性 */
type CheckboxProps = {
    /** 类名 */
    className?: string;
    /** 状态：选中、半选、未选 */
    value?: CheckedType;
    /** 状态改变事件 */
    onChange?: (checked: CheckedType) => void;
    /** 自定义渲染 */
    children?: (checked: CheckedType) => React.ReactNode;
};

/** 复选框 */
const Checkbox = (props: CheckboxProps) => {
    const { className, value, children, onChange } = props;
    /** 选中状态 */
    const [checked, setChecked] = useState<CheckedType>("unchecked");

    // 点击事件
    const handleClick = () => {
        switch (checked) {
            case "checked":
                setChecked("unchecked");
                onChange?.("unchecked");
                break;
            case "half":
                setChecked("checked");
                onChange?.("checked");
                break;
            case "unchecked":
                setChecked("checked");
                onChange?.("checked");
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        if (value) setChecked(value);
    }, [value]);

    return (
        <div className={styles["checkbox-wrap"]} onClick={handleClick}>
            {children?.(value || checked) || (
                <div
                    className={`${styles.checkbox} ${className} ${
                        styles[value || ""] || styles[checked]
                    }`}
                />
            )}
        </div>
    );
};

export default Checkbox;
