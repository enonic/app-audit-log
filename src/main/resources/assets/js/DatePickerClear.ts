import { DivEl } from 'lib-admin-ui/dom/DivEl';
import { Element } from 'lib-admin-ui/dom/Element';
import { Button } from 'lib-admin-ui/ui/button/Button';
import { DatePicker, DatePickerBuilder } from 'lib-admin-ui/ui/time/DatePicker';
import { DateTimePickerPopup, DateTimePickerPopupBuilder } from 'lib-admin-ui/ui/time/DateTimePickerPopup';

export class DatePickerClear extends DatePicker {
    constructor(id?: string) {
        super(new DatePickerBuilder());
        if (id) {
            this.getEl().setId(id);
        }
    }

    /**
     * Shamlessly overriding a parent with the same function (ish)
     */
    protected createPopup(): DateTimePickerPopup {
        const popupBuilder: DateTimePickerPopupBuilder = new DateTimePickerPopupBuilder()
            .setDate(this.selectedDateTime)
            .setManageDate(this.builder.manageDate)
            .setManageTime(this.builder.manageTime);


        if (this.builder.timezone) {
            popupBuilder.setTimezone(this.builder.timezone);
        }

        if (this.builder.useLocalTimezoneIfNotPresent) {
            popupBuilder.setUseLocalTimezoneIfNotPresent(true);
        }

        if (this.builder.defaultValue) {
            popupBuilder.setDefaultValue(this.builder.defaultValue);
        }

        const clearButton = new Button('Clear');
        clearButton.addClass('clear-button');

        clearButton.onClicked(() => {
            this.onClear();
        });

        return new DatePickerClearPopup(popupBuilder, clearButton);
    }

    public popupHide() {
        this.hidePopup();
    }

    public onClear() {
        throw ('Should be overriden');
    }
}

class DatePickerClearPopup extends DateTimePickerPopup {
    private clearButton: Button;

    constructor(builder: DateTimePickerPopupBuilder, clearButton: Button) {
        super(builder);
        this.clearButton = clearButton;
    }

    protected getChildElements(): Element[] {
        const popUpElements: Element[] = super.getChildElements();

        const wrapper = new DivEl('picker-buttons');
        wrapper.appendChild(this.clearButton);
        popUpElements.push(wrapper);
        return popUpElements;
    }
}
