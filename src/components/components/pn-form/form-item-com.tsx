import React from "react";
import { itemAttr } from "./types";
import {
    Form,
    Row,
    Col,
    Input,
    InputNumber,
    Radio,
    Select,
    Upload,
    message,
    DatePicker,
    Checkbox,
    Cascader
} from "@/basics-components";
import _ from "lodash";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

function getPlaceholder(type: string = '', label: string = '') {
    let tip;
    if (["select","checkbox"].includes(type)) {
        tip = "请选择";
    } else if (["input", "textArea"].includes(type)) {
        tip = "请输入";
    } else {
        return;
    }
    return `${tip}${label}`;
}

const FormItemCom = (props: itemAttr) => {
    const { label, type, value, onChange, comProps } = props;
    const { radioOptionNodeFn } = props.otherProps || {};

    const baseProps = {
        placeholder: getPlaceholder(type, label),
        ...props.comProps,
        value: props.value,
        onChange: props.onChange,
    };

    // 过滤
    const filter = (inputValue: string, option: any) => {
        return (option?.label ?? '').toLowerCase().includes(inputValue.toLowerCase());
    };

    switch (type) {
        case "input":
            return <Input {...baseProps} />;
        case "select":
            return <Select allowClear filterOption={filter} options={props?.options} {...baseProps} />;
        case "rangePicker":
            return <RangePicker {...baseProps} />;
        case "datePicker":
            return <DatePicker {...baseProps} />;
        case "textArea":
            return <TextArea {...baseProps} />;
        case "inputNumber":
            return <InputNumber {...baseProps} />;
        case "radioGroup":
            if (typeof radioOptionNodeFn === "function") {
                return (
                    <Radio.Group {...baseProps}>
                        {radioOptionNodeFn()}
                    </Radio.Group>
                );
            }
            return (
                <Radio.Group
                    {...baseProps}
                    options={props?.options}
                ></Radio.Group>
            );
        case "checkbox":
             return <Checkbox.Group   options={props?.options} {...baseProps} />;

        case "cascader":
            return <Cascader options={props?.options} {...baseProps} />;
        case "upload":

        default:
            return <div></div>;
    }
};

export default React.memo(FormItemCom, (prevProps, nextProps) => {
    return _.isEqual(prevProps, nextProps);
});
