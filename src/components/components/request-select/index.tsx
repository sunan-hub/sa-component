
import type { SelectProps } from "antd";
import { useEffect, useState } from "react";
import BasicSelect from "@/basics-components/basic-select";

type PropsType = {
    requestOptionsApi?: (pa?: any) => Promise<any> | false;
    handleOptions?: (options: any) => any[];
    requestParams?: any;
};

/** 下拉选项需要接口获取的Select */
const RequestSelect = (props: PropsType & SelectProps) => {
    const { requestOptionsApi, handleOptions, requestParams, ...rest } = props;
    // 下拉列表
    const [options, setOptions] = useState<any[]>([]);

    // 请求下拉
    const requestOptionsFn = async (pa?: any) => {
        if (!requestOptionsApi) return false;
        try {
            const res: any = await requestOptionsApi(pa);
            if (res.code == 200 && res.data) {
                setOptions(res.data);
            }
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        if (requestOptionsApi) requestOptionsFn(requestParams);
    }, [requestOptionsApi, requestParams]);

    return (
        <BasicSelect
            options={handleOptions ? handleOptions(options) : options}
            placeholder="请选择"
            {...rest}
        />
    );
};

export default RequestSelect;
