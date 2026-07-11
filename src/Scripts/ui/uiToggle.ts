import "@fluentui/web-components/button/define.js";
import "@fluentui/web-components/checkbox/define.js";
import "@fluentui/web-components/dialog/define.js";
import "@fluentui/web-components/radio/define.js";
import "@fluentui/web-components/radio-group/define.js";
import "../../Content/fluentCommon.css";
import "../../Content/uiToggle.css";

import { ParentFrame } from "../ParentFrame";

Office.onReady(async (info) => {
    if (info.host === Office.HostType.Outlook) {
        await ParentFrame.initUI();
    }
});