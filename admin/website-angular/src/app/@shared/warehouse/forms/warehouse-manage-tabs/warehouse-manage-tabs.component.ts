import { Input, Component, ViewChild, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { IWarehouseCreateObject } from '@modules/server.common/interfaces/IWarehouse';
import { WarehouseManageTabsDetailsComponent } from './details/warehouse-manage-tabs-details.component';
import { WarehouseManageTabsAccountComponent } from './account/warehouse-manage-tabs-account.component';
import { ContactInfoFormComponent } from '../contact-info';
import Warehouse from '@modules/server.common/entities/Warehouse';
import ForwardOrdersMethod from '@modules/server.common/enums/ForwardOrdersMethod';
import { LocationFormComponent } from '../../../forms/location';
import IGeoLocation from '@modules/server.common/interfaces/IGeoLocation';

export type WarehouseManageTabs = Pick<
	IWarehouseCreateObject,
	| 'name'
	| 'logo'
	| 'isActive'
	| 'username'
	| 'hasRestrictedCarriers'
	| 'carriersIds'
	| 'isManufacturing'
	| 'isCarrierRequired'
>;

@Component({
	selector: 'ea-warehouse-manage-tabs',
	styleUrls: ['./warehouse-manage-tabs.component.scss'],
	templateUrl: './warehouse-manage-tabs.component.html'
})
export class WarehouseManageTabsComponent {
	static buildForm(formBuilder: FormBuilder): FormGroup {
		return formBuilder.group({
			details: WarehouseManageTabsDetailsComponent.buildForm(formBuilder),
			account: WarehouseManageTabsAccountComponent.buildForm(formBuilder),
			contactInfo: ContactInfoFormComponent.buildForm(formBuilder),
			location: LocationFormComponent.buildForm(formBuilder)
		});
	}

	@Input()
	readonly form: FormGroup;

	@ViewChild('detailsComponent', { static: false })
	readonly detailsComponent: WarehouseManageTabsDetailsComponent;

	@ViewChild('accountComponent', { static: false })
	readonly accountComponent: WarehouseManageTabsAccountComponent;

	@ViewChild('contactInfoForm', { static: false })
	readonly contactInfoForm: ContactInfoFormComponent;

	@ViewChild('locationForm', { static: false })
	readonly locationForm: LocationFormComponent;

	@ViewChild('tabSet', { static: false })
	readonly tabSet;

	mapCoordEmitter = new EventEmitter<number[]>();
	mapGeometryEmitter = new EventEmitter<any>();

	get details() {
		return this.form.get('details');
	}
	get account() {
		return this.form.get('account');
	}
	get contactInfo() {
		return this.form.get('contactInfo');
	}
	get location() {
		return this.form.get('location');
	}

	get validForm() {
		return this.form.valid && this.contactInfoForm.validForm;
	}

	onCoordinatesChanges(coords: number[]) {
		this.mapCoordEmitter.emit(coords);
	}

	onGeometrySend(geometry: any) {
		this.mapGeometryEmitter.emit(geometry);
	}

	getValue() {
		// GeoJSON use reversed order for coordinates from our implementation.
		// we use lat => lng but GeoJSON use lng => lat.
		const geoLocationInput = this.locationForm.getValue();
		geoLocationInput.loc.coordinates.reverse();

		const detailsRaw = this.detailsComponent.getValue();
		const accountRaw = this.accountComponent.getValue();
		const contactRaw = this.contactInfoForm.getValue();
		const locationRaw = geoLocationInput;

		const inputResult: {
			basicInfo: WarehouseManageTabs;
			password: {
				current: string;
				new: string;
			};
			contactInfo: {
				contactEmail: string;
				contactPhone: string;
				forwardOrdersUsing: ForwardOrdersMethod[];
				ordersEmail: string;
				ordersPhone: string;
			};
			location: IGeoLocation;
		} = {
			basicInfo: { ...detailsRaw, username: accountRaw.username },
			password: accountRaw.password,
			contactInfo: contactRaw,
			location: locationRaw as IGeoLocation
		};

		return inputResult;
	}

	setValue(warehouse: Warehouse) {
		// GeoJSON use reversed order of lat => lng
		const geoLocationInput = warehouse.geoLocation;
		geoLocationInput.loc.coordinates.reverse();

		this.detailsComponent.setValue(warehouse);
		this.accountComponent.setValue(warehouse.username);
		this.contactInfoForm.setValue(warehouse);
		this.locationForm.setValue(geoLocationInput);
	}

	warehouseUpdateFinish() {
		this.tabSet.tabs._results[0].activeValue = true;
		this.tabSet.tabs._results[1].activeValue = false;
		this.tabSet.tabs._results[2].activeValue = false;
		this.tabSet.tabs._results[3].activeValue = false;
		this.tabSet.tabs._results[4].activeValue = false;
	}
}
