/*
 * If you log in as an agency user and select 'Go to Software Provider
 * Services', you will be presented with this component. It is a thin
 * component over the business-select component - adding registration
 * of company in RAM and routing to the next page.
 */
import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute, Params} from '@angular/router';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderAgencyComponent} from '../../components/page-header/page-header-agency.component';
import {RAMServices} from '../../services/ram-services';
import { BusinessSelectComponent } from '../../components/business-select/business-select.component';
import {ABRentry} from '../../../../commons/abr';
import {RAMRestService} from '../../services/ram-rest.service';

@Component({
    selector: 'agency-select-business',
    templateUrl: 'agency-select-business.component.html',
    directives: [
        ROUTER_DIRECTIVES,
        PageHeaderAgencyComponent,
        BusinessSelectComponent
    ]
})

export class AgencySelectBusinessComponent extends AbstractPageComponent {

    private dashboard: string;
    public falsy:boolean = false;

    /*
     * Capture the business entry returned by the business-select component.
     * Also used to only enable the "next" button when a business has been
     * selected. This is why it defaults to null.
     */
    public business:ABRentry = null;

    constructor(route: ActivatedRoute,
                router: Router,
                services: RAMServices,
                private rest: RAMRestService) {
        super(route, router, services);
    }

    /* tslint:disable:max-func-body-length */
    public onInit(params: {path: Params, query: Params}) {

        this.dashboard = params.path['dashboard'];

        // set banner title
        if (this.dashboard === 'auth') {
            this.setBannerTitle('Authorisations');
        } else {
            this.setBannerTitle('Software Provider Services');
        }
    }
    /*
     * Called by an event from the business-select component when the
     * operator hase found a business they like. This is not the same
     * as accepting the choice and moving on.
     */
    public selectBusiness(business: ABRentry) {
        this.business = business;
        // remove this if you want a next button
        this.acceptBusiness();
    }

    /*
     * This is called by a button local to this component and triggers the
     * move to the next screen.
     */
    public acceptBusiness() {
        this.rest.registerABRCompany(this.business).subscribe((data) => {
            this.whereToNext(data.idValue);
        },(err:any) => {
            this.displayErrors(this.rest.extractErrorMessages(err));
        });
    }

    /*
     * This is called when all is well and we are ready to move in. The next
     * page is dependent on the operator permissions.
     */
    public whereToNext(id:string) {
        if (this.dashboard === 'auth') {
            this.services.route.goToRelationshipsPage(id);
        } else {
            this.services.route.goToNotificationsPage(id);
        }
    }

    /*
     * On error this method is called - both by the local componentn and the
     * inner business-select component.
     */
    public displayErrors(errors:string[]) {
        this.addGlobalMessages(errors);
    }
}
