import { Form, Row, Col } from "@/basics-components";

import { itemAttr, PropsType } from "./types";
import FormItemCom from "./form-item-com";

const PnForm = (props: PropsType) => {
    const { form, onValuesChange, rowProps, configList, layout, formProps } = props;

    return (
        <Form
            form={form}
            layout={layout}
            onValuesChange={(changedValues, allValues) => {
                if (onValuesChange) {
                    onValuesChange(changedValues, allValues);
                }
            }}
            {...formProps}
        >
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} {...rowProps}>
                {configList.map((item: itemAttr, index: number) => {
                    if (item.hidden) return "";
                    if (item.domNode) {
                        return (
                            <Col
                                key={index}
                                span={item.colSpan ?? 24}
                                {...item.colProps}
                            >
                                {item.domNode()}
                            </Col>
                        );
                    }

                    return (
                        <Col
                            key={index}
                            span={item.colSpan ?? 24}
                            {...item.colProps}
                        >
                            <Form.Item
                                labelAlign="right"
                                key={item.name}
                                label={item.label}
                                name={item.name}
                                rules={item.rules}
                                {...item.formItemProps}
                            >
                                <FormItemCom {...item} />
                            </Form.Item>
                        </Col>
                    );
                })}
            </Row>
        </Form>
    );
};

export default PnForm;
