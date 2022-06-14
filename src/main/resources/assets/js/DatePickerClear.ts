import { DivEl } from '@enonic/lib-admin-ui/dom/DivEl';
import { Element } from '@enonic/lib-admin-ui/dom/Element';
import { Button } from '@enonic/lib-admin-ui/ui/button/Button';
import { DatePicker, DatePickerBuilder } from '@enonic/lib-admin-ui/ui/time/DatePicker';
import { DateTimePickerPopup, DateTimePickerPopupBuilder } from '@enonic/lib-admin-ui/ui/time/DateTimePickerPopup';

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
        const popup: DateTimePickerPopup = new DatePickerClearPopup(new DateTimePickerPopupBuilder().setManageDate(true));
        popup.onSubmit(this.onClear);

        return popup;
    }


    public onClear() {
        throw ('Should be overriden');
    }
}

class DatePickerClearPopup extends DateTimePickerPopup {
    protected createSubmitButton(): Button {
        const clearButton = new Button('Clear');
        clearButton.addClass('clear-button');
        return clearButton;
    }
}
