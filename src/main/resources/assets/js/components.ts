import { DatePicker, DatePickerBuilder } from 'lib-admin-ui/ui/time/DatePicker';

export function createDatePicker(id: string = null): DatePicker {
    const time: Date = new Date();
    const builder: DatePickerBuilder = new DatePickerBuilder();
    builder.setDate(time);
    const datePicker: DatePicker = builder.build();
    if (id) {
        datePicker.getEl().setId(id);
    }

    return datePicker;
}
