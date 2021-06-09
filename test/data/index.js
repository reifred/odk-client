import * as Actors from './actors';
import * as Assignments from './assignments';
import * as Audits from './audits';
import * as BackupsConfigs from './backups-configs';
import * as FieldKeys from './field-keys';
import * as Fields from './fields';
import * as FormAttachments from './form-attachments';
import * as Forms from './forms';
import * as Keys from './keys';
import * as Projects from './projects';
import * as PublicLinks from './public-links';
import * as Roles from './roles';
import * as Sessions from './sessions';
import * as Submissions from './submissions';
import * as Users from './users';
import seed from './seed';
import { resetDataStores } from './data-store';

const testData = Object.assign(
  {},
  Actors,
  Assignments,
  Audits,
  BackupsConfigs,
  FieldKeys,
  Fields,
  FormAttachments,
  Forms,
  Keys,
  Projects,
  PublicLinks,
  Roles,
  Sessions,
  Submissions,
  Users
);

testData.seed = seed;
testData.reset = resetDataStores;

export default testData;
