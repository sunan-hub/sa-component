import { VirtualTablePropsType } from "../const";
import Checkbox, { type CheckedType } from "./checkbox";

/** 封装表格Checkbox */
const TableCheckbox = (props: {
    record?: Record<string, any>; // 行数据（传了表示是行选择，没传表示全选）
    checkedList: React.Key[]; // 已选中的项
    dataSource: Record<string, any>[]; // 数据源
    rowSelection?: VirtualTablePropsType["rowSelection"]; // 行选择配置
    rowKey?: (record: Record<string, any>) => string; // 行的主键
}) => {
    const { record, checkedList, dataSource, rowSelection } = props;

    if (record) {
        // 当前行的主键
        const rowKey = props.rowKey?.(record) || record.id;
        return (
            <Checkbox
                value={checkedList.includes(rowKey) ? "checked" : "unchecked"}
                onChange={(checked) => {
                    if (checked === "checked") {
                        rowSelection?.onChange?.([
                            ...checkedList.filter((key) => key != rowKey),
                            rowKey,
                        ]);
                    } else {
                        props.rowSelection?.onChange?.(
                            checkedList.filter((key) => key !== rowKey)
                        );
                    }
                }}
            >
                {(checked: CheckedType) => {
                    return rowSelection?.render?.({ checked, record });
                }}
            </Checkbox>
        );
    } else {
        // 全选状态
        let allChecked: CheckedType = "unchecked";
        if (dataSource.length > 0) {
            if (checkedList.length === dataSource.length)
                allChecked = "checked";
            else if (checkedList.length > 0) allChecked = "half";
        }
        return (
            <Checkbox
                value={allChecked}
                onChange={(value) => {
                    if (value === "checked") {
                        rowSelection?.onChange?.(
                            dataSource.map(
                                (record) => props.rowKey?.(record) || record.id
                            )
                        );
                    } else {
                        props.rowSelection?.onChange?.([]);
                    }
                }}
            >
                {(checked: CheckedType) => {
                    return rowSelection?.render?.({ checked, record });
                }}
            </Checkbox>
        );
    }
};

export default TableCheckbox;
