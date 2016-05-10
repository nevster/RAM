import {Router, Request, Response} from 'express';
import {processRequest} from './helpers';
import {IPartyModel} from '../models/party.model';

export class PartyController {

  constructor(private partyModel: IPartyModel) {
  }
  /* given identity type and value, retrieve identity and party documents */
  private getParty = (req: Request, res: Response) => {
    processRequest( res, ()=> this.partyModel.getPartyByIdentity(
        req.params.type, req.params.value));
  };

  /*
   * Add a Party. It must have one identity to be valid.
   */
  private addParty = (req: Request, res: Response) => {
    processRequest( res, ()=> this.partyModel.create(req.body));
  };

  public assignRoutes = (router: Router) => {
    router.get('/identity/:value/:type', this.getParty);
    router.post('/', this.addParty);
    return router;
  };
}