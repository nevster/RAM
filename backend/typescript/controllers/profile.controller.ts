import {Router, Request, Response} from 'express';
import {sendResource, sendList, sendError, sendNotFoundError, validateReqSchema} from './helpers';
import {IProfileModel, ProfileProvider} from '../models/profile.model';

export class ProfileController {

    constructor(private profileModel:IProfileModel) {
    }

    private findProviderByCode = (req:Request, res:Response) => {
        const schema = {
            'code': {
                in: 'params',
                notEmpty: true,
                errorMessage: 'Code is not valid'
            }
        };
        validateReqSchema(req, schema)
            .then((req:Request) => ProfileProvider.valueOf(req.params.code) as ProfileProvider)
            .then((model) => model ? model.toDTO() : null)
            .then(sendResource(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    private listProviders = (req:Request, res:Response) => {
        const schema = {
        };
        validateReqSchema(req, schema)
            .then((req:Request) => ProfileProvider.values() as ProfileProvider[])
            .then((results) => results ? results.map((model) => model.toHrefValue(true)) : null)
            .then(sendList(res))
            .then(sendNotFoundError(res))
            .catch(sendError(res));
    };

    public assignRoutes = (router:Router) => {

        router.get('/v1/profileProvider/:code',
            this.findProviderByCode);

        router.get('/v1/profileProviders',
            this.listProviders);

        return router;

    };

}