import { Modal } from "antd";
import { ExclamationCircleTwoTone } from "@ant-design/icons";
import "./index.less";

type propsType = {
    visible: boolean;
    text: string;
    setVisible: (visible: boolean) => void;
    handleOk: () => void;
};

const title = (
    <span>
        <ExclamationCircleTwoTone
            twoToneColor="#FF9543"
            style={{ marginRight: 8 }}
        />
        提示
    </span>
);

/** 提醒框组件（删除二次提醒） */
const ConfirmBox = (props: propsType) => {
    return (
        <Modal
            className="confirm-box-wrapper"
            title={title}
            open={props.visible}
            onOk={props.handleOk}
            zIndex={1029}
            width={480}
            onCancel={() => {
                props.setVisible(false);
            }}
        >
            <div className="content">{props.text}</div>
        </Modal>
    );
};

export default ConfirmBox;

type ConfirmType = {
    confirmTitle?: string;
    confirmContent?: string;
    okText?: string;
    cancelText?: string;
    onOk: () => void;
};

export const confirm = ({
    confirmTitle,
    confirmContent,
    okText,
    cancelText,
    onOk,
}: ConfirmType) =>
    Modal.confirm({
        title: confirmTitle,
        content: confirmContent,
        okText: okText || "确定",
        cancelText: cancelText || "取消",
        onOk() {
            onOk();
        },
        onCancel() {},
    });
