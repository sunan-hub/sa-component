import type { VirtualTablePropsType } from "./virtual-table/const";
import Grouping from "./grouping";
import VirtualTable from "./virtual-table";
import GroupVirtualTable from "./virtual-table/group-table";
import styles from "./index.less";

/** 通用表格属性 */
export type CommonTablePropsType = VirtualTablePropsType & {
    grouping?: {
        /** 分组值 */
        value?: string;
        /** 分组字段发生变化回调 */
        onChange?: (grouping?: string) => void;
    };
};

/** 通用表格 */
const CommonVirtualTable = (props: CommonTablePropsType) => {
    return (
        <div className={styles["xpd-table-wrap"]}>
            <div className={styles.header}>
                {props.grouping && (
                    <Grouping
                        columns={props.columns}
                        value={props.grouping.value}
                        onChange={props.grouping.onChange || (() => {})}
                    />
                )}
            </div>
            {(props.grouping?.value && (
                <GroupVirtualTable
                    {...props}
                    groupField={props.grouping.value}
                />
            )) || <VirtualTable {...props} />}
        </div>
    );
};

export default CommonVirtualTable;
