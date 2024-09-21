import { useEffect, useState } from "react";
import BasicTooltip from "@/basics-components/basic-tooltip";
import BasicSelect from "@/basics-components/basic-select";
import styles from "./index.less";
import { getWorkFieldsByCode } from "@/api/work-list/"

/** 分组组件属性 */
type GroupingPropsType = {
    value?: string;
    workItemCode: string;
    onChange: (grouping?: string) => void;
};

/** 分组组件属性 */
type Columns = {
        title: React.ReactNode;
        dataIndex: string;
    }[];

/** 获取展示内容 */
const getShowContent = (
    columns: Columns,
    grouping?: string
) => {
    let text = "分组";
    const column = columns.find((item) => item.dataIndex === grouping);
    if (column) text += " · " + column.title;
    return text;
};

/** 分组组件 */
const Grouping = (props: GroupingPropsType) => {
    const { value, workItemCode, onChange } = props;

    // 是否显示筛选弹窗
    const [columns, setColumns] = useState<Columns>([]);

    const getFilterColumns = async ()=>{
        const res = await getWorkFieldsByCode({
            workItemCode: workItemCode,
            type: 1
        })
        const data = res.data.map((item: any) => {
            return {
                title: item.fieldName,
                dataIndex: item.fieldCode
            }
        })
        setColumns(data)
    }
    useEffect(()=>{
        getFilterColumns()
    }, [workItemCode])

    // 是否显示筛选弹窗
    const [open, setOpen] = useState(false);
    // 分组的字段
    const [grouping, setGrouping] = useState<string>();

    // 清空分组
    const clearGrouping = () => {
        setGrouping(undefined);
        onChange();
    };

    // 筛选弹窗
    const showFilterModalContent = (
        <div className={styles.groupingWrap}>
            {/* 头部 */}
            <div className={styles.title}>
                设置分组条件
                <div className={styles.infoIcon} />
            </div>
            <div className={`${styles.contentWrap} input-border-radius`}>
                <BasicSelect
                    value={grouping}
                    placeholder="请选择分组字段"
                    style={{ width: 200 }}
                    dropdownStyle={{ zIndex: 9999 }}
                    onChange={(value) => {
                        setGrouping(value);
                        onChange(value);
                    }}
                    options={columns.map((item) => ({
                        label: item.title,
                        value: item.dataIndex,
                    }))}
                />
                <div className={styles.deleteIcon} onClick={clearGrouping} />
            </div>
            <div className={styles.clearAll} onClick={clearGrouping}>
                清空全部条件
            </div>
        </div>
    );

    // 打开弹窗
    const showGroupingModal = () => {
        setOpen(true);
    };

    useEffect(() => {
        setGrouping(value);
    }, [value]);

    return (
        <BasicTooltip
            open={open}
            placement="bottomLeft"
            color="#fff"
            title={showFilterModalContent}
            trigger={["click"]}
            onOpenChange={(state) => setOpen(state)}
            getPopupContainer={(triggerNode) => triggerNode}
            overlayStyle={{
                zIndex: 9998,
                maxWidth: "max-content",
                cursor: "default",
            }}
        >
            <div
                onClick={showGroupingModal}
                className={`${styles.btn} ${grouping ? styles.active : ""}`}
            >
                <div className={styles.groupingIcon} />
                <div className={styles.text}>
                    {getShowContent(columns, grouping)}
                </div>
            </div>
        </BasicTooltip>
    );
};

export default Grouping;
