import { ColProps, FormInstance, FormItemProps, FormProps, RowProps } from "antd";
import { ReactElement } from "react";

export interface itemAttr {
    colSpan?: number | string;
    colProps?: ColProps;

    label?: string; // * FromItem  label
    name?: string; // * fromItem name 字段名称key
    rules?: any[];
    formItemProps?: FormItemProps;
    value?: any;  // fromItem value 会自动下发
    onChange?: any; // fromItem onChange 会自动下发
    

    hidden?: boolean; // 是否不显示
    domNode?: () => ReactElement; // 自定义内容

    type?: FromItemType; // * 组件类型 
    comProps?: any;  // 单元组件的自带属性 比如 input 的inputProps
    options?: any; // radio select 的

    otherProps?: {  // 特殊的属性集合
        radioOptionNodeFn?: () => ReactElement; // options radioOptionNode二选一 优先radioOptionNodeFn
        [key: string]: any;
    }
}
export interface PropsType {
    form?: FormInstance;
    layout?: "horizontal" | "vertical" | "inline";
    // 比较常用单独拎出来
    onValuesChange?: (changedValues: any, allValues: any) => void;
    formProps?: FormProps; // form表单的属性集合

    configList: itemAttr[];

    rowProps?: RowProps;
}

export type FromItemType =
    | "input"
    | "inputNumber"
    | "textArea"
    | "select"
    | 'rangePicker'
    | 'datePicker'
    | "radioGroup"
    | "checkbox"
    | "cascader"

    | 'editor'
    | 'treeSelect'
    | 'image'
    | 'upload'
