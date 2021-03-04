import { Dropdown } from 'lib-admin-ui/ui/selector/dropdown/Dropdown';
import { Option } from 'lib-admin-ui/ui/selector/Option';

export function setDropdownTypes(dropdown: Dropdown<any>): void {
    CONFIG.allTypes.forEach((value) => {
        // Option interface is missing methods? and the optionBuilder?
        dropdown.addOption(Option.create()
            .setValue(value.key.toString())
            .setDisplayValue(value.key.toString())
            .build());
    });
}

export function setDropDownUsers(dropdown: Dropdown<any>): void {
    CONFIG.allUsers.forEach((value) => {
        // Option interface is missing methods? and the optionBuilder?
        dropdown.addOption(Option.create()
            .setValue(value)
            .setDisplayValue(value)
            .build());
    });
}
