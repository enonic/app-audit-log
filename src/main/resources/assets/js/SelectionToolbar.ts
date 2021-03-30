import { DivEl } from 'lib-admin-ui/dom/DivEl';
import { LabelEl } from 'lib-admin-ui/dom/LabelEl';
import { Action } from 'lib-admin-ui/ui/Action';
import { Toolbar } from 'lib-admin-ui/ui/toolbar/Toolbar';
import { DatePickerClear } from './DatePickerClear';
import { SelectionPanel } from './SelectionPanel';
import { addUrlParam, removeUrlParam } from './Urlparam';
import { Option } from 'lib-admin-ui/ui/selector/Option';
import { Element } from 'lib-admin-ui/dom/Element';
import { dateFromFormatDate, formatDate } from './util';
import { Dropdown } from 'lib-admin-ui/ui/selector/dropdown/Dropdown';
import { FormInputEl } from 'lib-admin-ui/dom/FormInputEl';

export class SelectionToolbar extends Toolbar {

    /**
     * Creates the top toolbar and all the filters
     *
     * @param selectionPanel - Note is not initialized when passed in
     * eg. only works in runtime not init.
     */
    constructor(selectionPanel: SelectionPanel, loadParams: any) {
        super('tools');
        const searchButton = new Action();
        searchButton.setIconClass('icon-search');
        searchButton.onExecuted(() => {
            selectionPanel.createNewSelectionList();
        });
        this.addAction(searchButton);

        const fromWrapper = new DivEl('wrapper');
        const fromDatePicker = new DatePickerClear('select-from');
        let inDate = new Date();
        if (loadParams.from) {
            inDate = dateFromFormatDate(loadParams.from);
        }
        fromDatePicker.setSelectedDate(inDate);
        if (loadParams.from === undefined) {
            addUrlParam('from', formatDate(inDate, true));
        }
        fromDatePicker.getPopupClearButton().onClicked(() => {
            fromDatePicker.resetInput();
            removeUrlParam('from');
            selectionPanel.createNewSelectionList();
        });
        fromDatePicker.onSelectedDateTimeChanged(event => {
            selectionPanel.createNewSelectionList();
            const date = event.getDate();
            if (date) {
                addUrlParam('from', formatDate(date, true));
            } else {
                removeUrlParam('from');
            }
        });
        const fromLabel: Element = new LabelEl('From', fromDatePicker.getTextInput());
        fromWrapper.appendChildren(
            fromLabel,
            fromDatePicker,
        );
        const toWrapper = new DivEl('wrapper');
        const toDatePicker = new DatePickerClear('select-to');
        if (loadParams.to) {
            const toDate = dateFromFormatDate(loadParams.to);
            toDatePicker.setSelectedDate(toDate);
        }

        toDatePicker.getPopupClearButton().onClicked(() => {
            toDatePicker.resetInput();
            removeUrlParam('to');
            selectionPanel.createNewSelectionList();
        });
        toDatePicker.onSelectedDateTimeChanged(event => {
            selectionPanel.createNewSelectionList();
            const date = event.getDate();
            if (date) {
                addUrlParam('to', formatDate(date, true));
            } else {
                removeUrlParam('to');
            }
        });
        const toLabel: Element = new LabelEl('To', toDatePicker.getTextInput());
        toWrapper.appendChildren(
            toLabel,
            toDatePicker,
        );

        const projectWrapper = new DivEl('wrapper');
        const projectDropdown = new Dropdown('project', { inputPlaceholderText: 'project' });
        projectDropdown.setId('select-project');
        projectDropdown.onOptionSelected(event => {
            if (event.getOption().getValue() === 'empty') {
                projectDropdown.reset();
                removeUrlParam('project');
            } else {
                addUrlParam('project', event.getOption().getValue());
            }
            if (selectionPanel.isRendered) {
                selectionPanel.createNewSelectionList();
            }
        });

        const projectLabel: Element = new LabelEl('Project', <Element>projectDropdown);
        this.setDropdownProject(projectDropdown);
        if (loadParams.project) {
            projectDropdown.setValue(loadParams.project, true);
        } else {
            const defaultOption = projectDropdown.getOptionByValue('default');
            if (defaultOption) {
                projectDropdown.setValue('default', true);
            }
        }

        projectWrapper.appendChildren(
            projectLabel,
            projectDropdown,
        );

        const userWrapepr = new DivEl('wrapper');
        const userDropdown = new Dropdown('User', { inputPlaceholderText: 'Select' });
        userDropdown.setId('select-user');
        if (loadParams.user) {
            userDropdown.setValue(loadParams.user, true);
        }
        userDropdown.onOptionSelected(event => {
            if (event.getOption().getValue() === 'empty') {
                userDropdown.reset();
                removeUrlParam('user');
            } else {
                addUrlParam('user', event.getOption().getValue());
            }
            selectionPanel.createNewSelectionList();
        });

        const userLabel: Element = new LabelEl('User', <Element>userDropdown);
        this.setDropDownUsers(userDropdown);
        userWrapepr.appendChildren(
            userLabel,
            userDropdown,
        );

        const typeWrapper = new DivEl('wrapper');
        const typeDropdown = new Dropdown('type', { inputPlaceholderText: 'Select' });
        typeDropdown.setId('select-type');
        if (loadParams.type) {
            typeDropdown.setValue(loadParams.type, true);
        }
        typeDropdown.onOptionSelected(event => {
            if (event.getOption().getValue() === 'empty') {
                typeDropdown.reset();
                removeUrlParam('type');
            } else {
                addUrlParam('type', event.getOption().getValue());
            }
            selectionPanel.createNewSelectionList();
        });
        const typeLabel: Element = new LabelEl('Type', <Element>typeDropdown);
        this.setDropdownTypes(typeDropdown);

        typeWrapper.appendChildren(
            typeLabel,
            typeDropdown,
        );

        const searchWrapper = new DivEl('wrapper');
        const searchInput = new FormInputEl('input', 'xp-admin-common-text-input form-input');
        searchInput.setId('fulltext');
        if (loadParams.q) {
            searchInput.setValue(loadParams.q, true);
        }
        searchInput.onValueChanged(event => {
            selectionPanel.createNewSelectionList();
            const query = event.getNewValue();
            if (query !== '') {
                addUrlParam('q', event.getNewValue());
            } else {
                removeUrlParam('q');
            }
        });
        const searchLabel: Element = new LabelEl('Search', searchInput);
        searchWrapper.appendChildren(
            searchLabel,
            searchInput,
        );

        this.appendChildren(
            fromWrapper,
            toWrapper,
            projectWrapper,
            userWrapepr,
            typeWrapper,
            searchWrapper,
        );
    }

    setDropdownTypes(dropdown: Dropdown<any>): void {
        dropdown.addOption(
            Option.create()
                .setValue('empty')
                .setDisplayValue('empty')
                .build()
        );
        CONFIG.allTypes.forEach((value) => {
            // Option interface is missing methods? and the optionBuilder?
            dropdown.addOption(
                Option.create()
                    .setValue(value.key.toString())
                    .setDisplayValue(value.key.toString())
                    .build()
            );
        });
    }

    setDropDownUsers(dropdown: Dropdown<any>): void {
        dropdown.addOption(
            Option.create()
                .setValue('empty')
                .setDisplayValue('empty')
                .build()
        );
        CONFIG.allUsers.forEach((value) => {
            // Option interface is missing methods? and the optionBuilder?
            dropdown.addOption(
                Option.create()
                    .setValue(value)
                    .setDisplayValue(value)
                    .build()
            );
        });
    }

    setDropdownProject(dropdown: Dropdown<any>): void {
        dropdown.addOption(
            Option.create()
                .setValue('empty')
                .setDisplayValue('empty')
                .build()
        );

        CONFIG.projects.forEach((project) => {
            dropdown.addOption(
                Option.create()
                    .setValue(project.id)
                    .setDisplayValue(project.name)
                    .build()
            );
        });

    }
}
