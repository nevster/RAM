import {Observable} from 'rxjs/Observable';
import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, ActivatedRoute, Router, Params} from '@angular/router';
import {DatePipe} from '@angular/common';

import {AbstractPageComponent} from '../abstract-page/abstract-page.component';
import {PageHeaderAuthComponent} from '../../components/page-header/page-header-auth.component';
import {MarkdownComponent} from '../../components/ng2-markdown/ng2-markdown.component';
import {RAMServices} from '../../services/ram-services';

import {
    IIdentity,
    IRelationship,
    IRelationshipType,
    IRelationshipAttribute,
    IRelationshipAttributeNameUsage
} from '../../../../commons/RamAPI';

@Component({
    selector: 'accept-authorisation',
    templateUrl: 'accept-authorisation.component.html',
    directives: [ROUTER_DIRECTIVES, PageHeaderAuthComponent, MarkdownComponent]
})

export class AcceptAuthorisationComponent extends AbstractPageComponent {

    public idValue: string;
    public code: string;

    public relationship$: Observable<IRelationship>;
    public relationshipType$: Observable<IRelationshipType>;

    public giveAuthorisationsEnabled: boolean = true; // todo need to set this
    public identity: IIdentity;
    public relationship: IRelationship;
    public delegateManageAuthorisationAllowedIndAttribute: IRelationshipAttribute;
    public delegateRelationshipTypeDeclarationAttributeUsage: IRelationshipAttributeNameUsage;

    constructor(route: ActivatedRoute,
                router: Router,
                services: RAMServices) {
        super(route, router, services);
        this.setBannerTitle('Authorisations');
    }

    /* tslint:disable:max-func-body-length */
    public onInit(params: {path: Params, query: Params}) {

        // extract path and query parameters
        this.idValue = decodeURIComponent(params.path['idValue']);
        this.code = decodeURIComponent(params.path['invitationCode']);

        // identity in focus
        this.services.rest.findIdentityByValue(this.idValue).subscribe((identity) => {
            this.identity = identity;
        });

        // relationship
        this.relationship$ = this.services.rest.findPendingRelationshipByInvitationCode(this.code);
        this.relationship$.subscribe((relationship) => {
            this.relationship = relationship;
            for (let attribute of relationship.attributes) {
                if (attribute.attributeName.value.code === 'DELEGATE_MANAGE_AUTHORISATION_ALLOWED_IND') {
                    this.delegateManageAuthorisationAllowedIndAttribute = attribute;
                }
            }
            this.relationshipType$ = this.services.rest.findRelationshipTypeByHref(relationship.relationshipType.href);
            this.relationshipType$.subscribe((relationshipType) => {
                for (let attributeUsage of relationshipType.relationshipAttributeNames) {
                    if (attributeUsage.attributeNameDef.value.code === 'DELEGATE_RELATIONSHIP_TYPE_DECLARATION') {
                        this.delegateRelationshipTypeDeclarationAttributeUsage = attributeUsage;
                    }
                }
            });
        }, (err) => {
            if (err.status === 404) {
                this.goToEnterAuthorisationPage();
            } else {
                this.addGlobalMessages(this.services.rest.extractErrorMessages(err));
            }
        });

    }

    public declineAuthorisation = () => {
        this.services.rest.rejectPendingRelationshipByInvitationCode(this.relationship).subscribe(() => {
            this.services.route.goToRelationshipsPage(this.idValue, null, 1, 'DECLINED_RELATIONSHIP');
        }, (err) => {
            this.addGlobalMessages(this.services.rest.extractErrorMessages(err));
        });
    };

    public acceptAuthorisation = () => {
        this.services.rest.acceptPendingRelationshipByInvitationCode(this.relationship).subscribe(() => {
            this.services.route.goToRelationshipsPage(this.idValue, null, 1, 'ACCEPTED_RELATIONSHIP');
        }, (err) => {
            this.addGlobalMessages(this.services.rest.extractErrorMessages(err));
        });
    };

    public goToEnterAuthorisationPage = () => {
        this.services.route.goToRelationshipEnterCodePage(this.idValue, 'INVALID_CODE');
    };

    public goToRelationshipsPage = () => {
        this.services.route.goToRelationshipsPage(this.idValue, null, 1, 'CANCEL_ACCEPT_RELATIONSHIP');
    };

    // TODO: not sure how to set the locale, Implement as a pipe
    public displayDate(dateString: string) {
        if (dateString) {
            const date = new Date(dateString);
            const datePipe = new DatePipe();
            return datePipe.transform(date, 'd') + ' ' +
                datePipe.transform(date, 'MMMM') + ' ' +
                datePipe.transform(date, 'yyyy');
        }
        return 'Not specified';
    }

}