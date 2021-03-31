import { DivEl } from 'lib-admin-ui/dom/DivEl';
import { LabelEl } from 'lib-admin-ui/dom/LabelEl';
import { Action } from 'lib-admin-ui/ui/Action';
import { Toolbar } from 'lib-admin-ui/ui/toolbar/Toolbar';
import { DatePickerClear } from './DatePickerClear';
import { SelectionPanel } from './SelectionPanel';
import { addUrlParam, getUrlParams, removeUrlParam } from './Urlparam';
import { Option } from 'lib-admin-ui/ui/selector/Option';
import { Element } from 'lib-admin-ui/dom/Element';
import { dateFromFormatDate, formatDate } from './util';
import { Dropdown } from 'lib-admin-ui/ui/selector/dropdown/Dropdown';
import { FormInputEl } from 'lib-admin-ui/dom/FormInputEl';
import { ActionButton } from 'lib-admin-ui/ui/button/ActionButton';

export class SelectionToolbar extends Toolbar {

    selectionPanel: SelectionPanel;

    filters: {
        from: DatePickerClear;
        to: DatePickerClear;
        project: Dropdown<string>;
        user: Dropdown<string>;
        type: Dropdown<string>;
        fulltext: FormInputEl;
    };

    constructor(selectionPanel: SelectionPanel) {
        super('tools');
        this.selectionPanel = selectionPanel;
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered) => {
            this.appendChildren();
            return rendered;
        });
    }

    setup() {
        const loadParams = getUrlParams();
        const fromDatePicker = new DatePickerClear('select-from');
        let inDate = new Date();
        if (loadParams.from) {
            inDate = dateFromFormatDate(loadParams.from);
            fromDatePicker.setSelectedDate(inDate);
        }
        if (loadParams.from === undefined &&
            loadParams.to === undefined &&
            loadParams.user === undefined &&
            loadParams.type === undefined &&
            loadParams.q === undefined) {
            addUrlParam('from', formatDate(inDate, true));
            fromDatePicker.setSelectedDate(inDate);
        }
        fromDatePicker.getPopupClearButton().onClicked(() => {
            fromDatePicker.resetInput();
            removeUrlParam('from');
            this.selectionPanel.createNewSelectionList();
            fromDatePicker.popupHide();
        });
        fromDatePicker.onSelectedDateTimeChanged(event => {
            this.selectionPanel.createNewSelectionList();
            const date = event.getDate();
            if (date) {
                addUrlParam('from', formatDate(date, true));
            } else {
                removeUrlParam('from');
            }
            fromDatePicker.popupHide();
        });

        const toWrapper = new DivEl('wrapper');
        const toDatePicker = new DatePickerClear('select-to');
        if (loadParams.to) {
            const toDate = dateFromFormatDate(loadParams.to);
            toDatePicker.setSelectedDate(toDate);
        }

        toDatePicker.getPopupClearButton().onClicked(() => {
            toDatePicker.resetInput();
            removeUrlParam('to');
            this.selectionPanel.createNewSelectionList();
            toDatePicker.popupHide();
        });
        toDatePicker.onSelectedDateTimeChanged(event => {
            this.selectionPanel.createNewSelectionList();
            const date = event.getDate();
            if (date) {
                addUrlParam('to', formatDate(date, true));
            } else {
                removeUrlParam('to');
            }
            toDatePicker.popupHide();
        });
        const toLabel: Element = new LabelEl('To', toDatePicker.getTextInput());
        toWrapper.appendChildren(
            toLabel,
            toDatePicker,
        );

        const project = this.createDropdown('project', 'Project', this.setProjectOptions);
        if (loadParams.project === undefined) {
            if (project.getOptionByValue('default')) {
                project.setValue('default', true);
            }
        }
        const user = this.createDropdown('user', 'User', this.setUserOptions);
        const type = this.createDropdown('type', 'Type', this.setTypeOptions);

        const searchInput = new FormInputEl('input', 'xp-admin-common-text-input form-input');
        searchInput.setId('fulltext');
        searchInput.onValueChanged(event => {
            this.selectionPanel.createNewSelectionList();
            const query = event.getNewValue();
            if (query !== '') {
                addUrlParam('q', event.getNewValue());
            } else {
                removeUrlParam('q');
            }
        });

        if (loadParams.q) {
            searchInput.setValue(loadParams.q, true);
        }

        const searchAction = new Action();
        searchAction.setIconClass('icon-search');
        searchAction.onExecuted(() => {
            this.selectionPanel.createNewSelectionList();
        });

        const searchButton = new ActionButton(searchAction);

        this.filters = {
            to: toDatePicker,
            from : fromDatePicker,
            project,
            user,
            type,
            fulltext: searchInput,
        };

        this.appendChildren(
            this.labelAndWrapElement(fromDatePicker, 'From'),
            this.labelAndWrapElement(toDatePicker, 'To'),
            this.labelAndWrapElement(project, 'Project'),
            this.labelAndWrapElement(user, 'user'),
            this.labelAndWrapElement(type, 'type'),
            this.labelAndWrapElement(searchInput, 'Fulltext'),
            searchButton,
        );
    }

    // createDatePicker() {

    // }

    createDropdown(name: string, placeholder: string, setOptions: CallableFunction): Dropdown<string> {
        const dropdown: Dropdown<string> = new Dropdown(name.toLowerCase(), { inputPlaceholderText: placeholder });
        dropdown.setId(`select-${name}`);
        dropdown.onOptionSelected(event => {
            if (event.getOption().getValue() === 'empty') {
                dropdown.reset();
                removeUrlParam(name);
            } else {
                addUrlParam(name, event.getOption().getValue());
            }
            if (this.selectionPanel.isRendered) {
                this.selectionPanel.createNewSelectionList();
            }
        });

        const loadParams = getUrlParams();

        setOptions(dropdown);

        if (loadParams[name]) {
            dropdown.setValue(loadParams[name], true);
        }

        return dropdown;
    }

    labelAndWrapElement(element: Element, labelText: string) {
        const wrapper = new DivEl('wrapper');
        const labelEl: Element = new LabelEl(labelText, element);

        wrapper.appendChildren(
            labelEl,
            element
        );

        return wrapper;
    }

    setTypeOptions(dropdown: Dropdown<any>): void {
        dropdown.addOption(
            Option.create()
                .setValue('empty')
                .setDisplayValue('<Clear selection>')
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

    setUserOptions(dropdown: Dropdown<any>): void {
        dropdown.addOption(
            Option.create()
                .setValue('empty')
                .setDisplayValue('<Clear selection>')
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

    setProjectOptions(dropdown: Dropdown<any>): void {
        dropdown.addOption(
            Option.create()
                .setValue('empty')
                .setDisplayValue('<Clear selection>')
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
