import { Component, ReactNode, createElement } from "react";
import { OrgAssistantChartTSContainerProps } from "../typings/OrgAssistantChartTSProps";
import App from './components/App';

import "./ui/OrgAssistantChartTS.css";

class OrgAssistantChartTS extends Component<OrgAssistantChartTSContainerProps> {
    render(): ReactNode {
        return(
            createElement(App)
        )
    }
}

export default OrgAssistantChartTS;
