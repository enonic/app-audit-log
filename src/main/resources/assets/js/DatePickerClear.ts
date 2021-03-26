import { Button } from 'lib-admin-ui/ui/button/Button';
import { DatePicker, DatePickerBuilder, DatePickerShownEvent } from 'lib-admin-ui/ui/time/DatePicker';
import { DatePickerPopupBuilder } from 'lib-admin-ui/ui/time/DatePickerPopup';

export class DatePickerClear extends DatePicker {
    private popupClearButton: Button;

    constructor(id?: string) {
        super(new DatePickerBuilder());
        if (id) {
            this.getEl().setId(id);
        }

        this.popupClearButton = new Button('Clear');
        this.popupClearButton.addClass('clear-button');
    }

    /**
     * Shamlessly overriding a parent with the same function (ish)
     */
    protected initPopup() {
        this.popup = new DatePickerPopupBuilder().setDate(this.selectedDate).build();

        this.popup.onShown(() => {
            new DatePickerShownEvent(this).fire();
        });

        this.initClearButton();
    }

    private initClearButton() {
        this.popup.appendChild(this.popupClearButton);
    }

    public resetInput() {
        this.getTextInput().reset();
    }

    public getPopupClearButton() {
        return this.popupClearButton;
    }
}


