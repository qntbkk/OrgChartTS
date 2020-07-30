import { Component, ReactNode, createElement } from "react";
import { OrgAssistantChartTSPreviewProps } from "../typings/OrgAssistantChartTSProps";
import App from "./components/App";


declare function require(name: string): string;

export class preview extends Component<OrgAssistantChartTSPreviewProps> {
    render(): ReactNode {
        return(
            createElement(App)
        )
    }
}

export function getPreviewCss(): string {
    return require("./ui/OrgAssistantChartTS.css");
}
