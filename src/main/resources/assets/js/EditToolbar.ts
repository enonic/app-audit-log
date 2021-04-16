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
import { ResponsiveManager } from 'lib-admin-ui/ui/responsive/ResponsiveManager';
import { ModalDialog } from 'lib-admin-ui/ui/dialog/ModalDialog';
import { ConfirmationDialog } from 'lib-admin-ui/ui/dialog/ConfirmationDialog';
import { NotificationDialog } from 'lib-admin-ui/ui/dialog/NotificationDialog';

export class EditToolbar extends Toolbar {

    selectionPanel: SelectionPanel;
    responsiveRender: Boolean = false;
    filterEls: Element[] = [];

    filters: {
        from: DatePickerClear;
        to: DatePickerClear;
        project: Dropdown<string>;
        user: Dropdown<string>;
        type: Dropdown<string>;
        fulltext: FormInputEl;
    };

    // Possible to refacor each event into a setable state.
    // So the selectionpanel could just set the different events.
    constructor(selectionPanel: SelectionPanel) {
        super('tools');
        this.selectionPanel = selectionPanel;
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
            if (date != null) {
                addUrlParam('from', formatDate(date, true));
            } else {
                removeUrlParam('from');
            }
            fromDatePicker.setSelectedDate(inDate);
            fromDatePicker.popupHide();
        });

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

        const project = this.createDropdown('project', 'Project', this.setProjectOptions);
        if (loadParams.project === undefined) {
            if (project.getOptionByValue('default')) {
                project.setValue('default', true);
            }
        }
        const user = this.createDropdown('user', 'User', this.setUserOptions);
        const type = this.createDropdown('type', 'Type', this.setTypeOptions);

        const searchInput = new FormInputEl('input', 'xp-admin-common-text-input form-input');
        searchInput.setId('free-text');
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

        // const searchAction = new Action();
        // searchAction.setIconClass('icon-search');
        // searchAction.onExecuted(() => {
        //     this.selectionPanel.createNewSelectionList();
        // });

        // const searchButton = new ActionButton(searchAction);

        this.filters = {
            to: toDatePicker,
            from: fromDatePicker,
            project,
            user,
            type,
            fulltext: searchInput,
        };

        this.filterEls.push(
            this.labelAndWrapElement(fromDatePicker, 'From'),
            this.labelAndWrapElement(toDatePicker, 'To'),
            this.labelAndWrapElement(project, 'Project'),
            this.labelAndWrapElement(user, 'User'),
            this.labelAndWrapElement(type, 'Type'),
            this.labelAndWrapElement(searchInput, 'Free text'),
        );

        this.appendChildren(...this.filterEls);

        ResponsiveManager.onAvailableSizeChanged(this, () => setTimeout(this.checkResponsiveSize.bind(this)));

        this.onShown(() => this.checkResponsiveSize());
    }

    checkResponsiveSize() {
        const toolBarWidth = this.getEl().getWidth();
        let filterWidth = 0;
        this.filterEls.forEach(element => {
            if (element.isVisible()) {
                filterWidth += element.getEl().getWidthWithMargin();
            }
        });

        if (toolBarWidth < filterWidth) {
            this.modalFilters();
        }
    }

    modalFilters() {
        if (this.responsiveRender === false) {
            const modal = new FilterDiag();
            const modalAction = new Action('Filters');
            const button = new ActionButton(modalAction);
            const iconFilter = new ActionButton(new Action().setIconClass('icon-cog2'));
            button.addClass('filter-button');
            button.appendChild(iconFilter);
            this.filterEls.forEach(filter => {
                this.removeChild(filter);
                modal.appendChildToContentPanel(filter);
            });
            modalAction.onExecuted(action => {
                modal.open();
            });

            this.appendChildren(button);
            this.responsiveRender = true;
        }
    }

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


class FilterDiag extends ModalDialog {
    constructor() {
        super();
        this.addCancelButtonToBottom('Apply');
    }
}
