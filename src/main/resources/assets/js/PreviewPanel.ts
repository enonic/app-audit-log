import { DivEl } from '@enonic/lib-admin-ui/dom/DivEl';
import { ImgEl } from '@enonic/lib-admin-ui/dom/ImgEl';
import { H1El } from '@enonic/lib-admin-ui/dom/H1El';
import { Element, NewElementBuilder } from '@enonic/lib-admin-ui/dom/Element';
import { formatDate } from './util';
import { SpanEl } from '@enonic/lib-admin-ui/dom/SpanEl';
import { Exception } from '@enonic/lib-admin-ui/Exception';
import { Panel } from '@enonic/lib-admin-ui/ui/panel/Panel';
import { ImageLoader } from '@enonic/lib-admin-ui/util/loader/ImageLoader';
import { ItemDataGroup } from '@enonic/lib-admin-ui/app/view/ItemDataGroup';
import { Action } from '@enonic/lib-admin-ui/ui/Action';
import { ActionButton } from '@enonic/lib-admin-ui/ui/button/ActionButton';


export interface AuditlogData {
    type: string;
    time: Date;
    props: any;
    data: any;
}

export class PreviewPanel extends Panel {

    private header: Element;
    private logDataContainer: Element;
    private backBtn: ActionButton;
    public showBackButton: boolean;

    constructor(className?: string) {
        super(className);
        this.setHelpText();
    }

    public clear() {
        this.removeChildren();
        this.setHelpText();
    }

    public setBackButton(handler: CallableFunction) {
        const action = new Action()
            .setIconClass('icon-close')
            .onExecuted(() => {
                handler();
            });
        const button = new ActionButton(action);
        button.addClass('close-button');
        this.backBtn = button;
    }

    public setPreview(id?: string) {
        this.removeChildren();

        if (id === '' || id === undefined) {
            this.setHelpText();
        } else {
            this.fetchAuditLog(id)
                .then(data => {
                    if (this.showBackButton) {
                        this.appendChild(this.backBtn);
                    }
                    this.setPreviewHeader(data);
                    this.setPreviewBody(data);
                });
        }
    }

    public setPreviewHeader(data: AuditlogData) {
        this.header = new DivEl('preview-header');

        //Future img update
        // let icon = ImageLoader.get(data.iconUrl);
        let icon = ImageLoader.get(CONFIG.icon, 64, 64);
        const iconEl = ImgEl.fromHtmlElement(icon);
        iconEl.getEl()
            .setAttribute('src', CONFIG.icon)
            .setClass('icon');

        const titleEl: Element = new H1El('title');
        titleEl.getEl().setText(`${data.type}`);

        const time = formatDate(new Date(`${data.time}`));
        const timeEl = new Element(new NewElementBuilder()
            .setTagName('Time')
            .setClassName('timestamp')
        );

        timeEl.getEl().setText(time);

        this.header.appendChildren(
            iconEl,
            titleEl,
            timeEl,
        );

        this.appendChild(this.header);
    }

    private setHelpText() {
        this.appendChild(SpanEl.fromText(
            'Free space, select something on the left',
            'placeholder',
        ));
    }

    private setPreviewBody(data: AuditlogData) {
        this.logDataContainer = new DivEl('log-data-container');

        const detailGroup = new ItemDataGroup('Log', 'detail');
        this.addToDataGroup(data, detailGroup, 'data');

        const dataGroup = new ItemDataGroup('Data', 'property-data');
        this.addToDataGroup(data.data, dataGroup);


        this.logDataContainer.appendChildren(detailGroup, dataGroup);

        this.appendChild(this.logDataContainer);
    }

    private addToDataGroup(data: Object, dataGroup: ItemDataGroup, ignore?: string) {
        for (const [key, value] of Object.entries(data)) {
            if (key !== ignore) {
                if (Array.isArray(value)) {
                    dataGroup.addDataArray(`${key}`, value);
                } else if (typeof value === 'object') {
                    this.addToDataGroup(value, dataGroup);
                } else {
                    if (RegExp(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(\.\d+)*Z/g).test(value)) {
                        dataGroup.addDataList(`${key}`, `${formatDate(new Date(value))}`);
                    } else {
                        dataGroup.addDataList(`${key}`, `${value}`);
                    }
                }
            }
        }
    }

    private fetchAuditLog(key: string) {
        return fetch(CONFIG.auditServiceUrl,
            {
                method: 'POST',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: new Headers({ 'Content-Type': 'application/json' }),
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
