import { Tabs } from "antd";
import { useState } from "react";
import VirtualTableTest from "./virtual-table-test";
import styles from "./index.less";

/** 测试组件列表 */
const ComponentItems = [{ label: "性能表格测试", key: "table" }];

const IndexPage = () => {
    /** 当前选择的页面 */
    const [currentTab, setCurrentTab] = useState("table");

    return (
        <div className={styles.wrap}>
            <Tabs items={ComponentItems} onChange={setCurrentTab} />
            {currentTab == "table" && <VirtualTableTest />}
        </div>
    );
};

export default IndexPage;
