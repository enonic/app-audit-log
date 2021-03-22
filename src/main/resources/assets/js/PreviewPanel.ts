import { DivEl } from 'lib-admin-ui/dom/DivEl';
import { ImgEl } from 'lib-admin-ui/dom/ImgEl';
import { H1El } from 'lib-admin-ui/dom/H1El';
import { Element, NewElementBuilder } from 'lib-admin-ui/dom/Element';
import { Panel } from 'lib-admin-ui/ui/panel/Panel';
import { formatDate } from './util';
import { SpanEl } from 'lib-admin-ui/dom/SpanEl';
import { Exception } from 'lib-admin-ui/Exception';


export interface AuditlogData {
    type: string;
    time: Date;
    props: any;
    data: any;
}

export class PreviewPanel extends Panel {
    constructor() {
        super('Preview');
        this.createHelpText();
    }

    createHelpText() {
        this.appendChild(SpanEl.fromText(
            'Free space, select something on the left',
            'placeholder',
        ));
    }

    public createPreview(id: string) {
        this.fetchAuditLog(id).then(data => {
            this.removeChildren();

            const previewLog = new DivEl('preview-log');
            const top = new DivEl('heading');
            const icon = new ImgEl();
            icon.getEl().setAttribute('src', CONFIG.icon);

            const title: Element = new H1El();
            title.getEl().setText(`${data.type}`);

            const time = formatDate(new Date(`${data.time}`));

            const timeBuilder = new NewElementBuilder();
            timeBuilder.setTagName('Time');

            const timeEl = new Element(timeBuilder);
            timeEl.getEl().setText(time);

            top.appendChildren(
                icon,
                title,
                timeEl,
            );

            previewLog.appendChild(top);

            this.appendChild(previewLog);
        });
    }

    private fetchAuditLog(key: string) {
        return fetch(CONFIG.auditServiceUrl,
            {
                method: 'POST',
                headers: new Headers({ 'content-type': 'application/json' }),
                body: JSON.stringify({
                    id: key,
                }),
            },
        )
            .then((res) => res.json())
            .catch(error => {
                throw new Exception(`Preview fetch error:\n ${error}`);
            });
    }
}
