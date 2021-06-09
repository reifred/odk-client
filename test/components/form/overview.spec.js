import FormVersionSummaryItem from '../../../src/components/form-version/summary-item.vue';
import FormVersionViewXml from '../../../src/components/form-version/view-xml.vue';
import testData from '../../data';
import { load } from '../../util/http';
import { mockLogin } from '../../util/session';

describe('FormOverview', () => {
  beforeEach(mockLogin);

  describe('draft section', () => {
    describe('draft exists', () => {
      beforeEach(() => {
        testData.extendedForms.createPast(1);
        testData.extendedFormVersions.createPast(1, {
          version: 'v2',
          draft: true
        });
      });

      it('shows the correct title', () =>
        load('/projects/1/forms/f').then(app => {
          const section = app.first('#form-overview-draft');
          const text = section.first('.page-section-heading span').text().trim();
          text.should.equal('Your Current Draft');
        }));

      it('renders FormVersionSummaryItem for the draft', () =>
        load('/projects/1/forms/f').then(app => {
          const components = app.find(FormVersionSummaryItem);
          components.length.should.equal(2);
          components[1].getProp('version').version.should.equal('v2');
        }));

      it('toggles the "View XML" modal', () =>
        load('/projects/1/forms/f').testModalToggles({
          modal: FormVersionViewXml,
          show: '#form-overview-draft .form-version-def-dropdown a',
          hide: '.btn-primary',
          respond: (series) => series.respondWithData(() => '<x/>')
        }));
    });

    it('shows the correct title if there is no draft', () => {
      testData.extendedForms.createPast(1);
      return load('/projects/1/forms/f').then(app => {
        const section = app.first('#form-overview-draft');
        const text = section.first('.page-section-heading span').text().trim();
        text.should.equal('No Current Draft');
      });
    });
  });
});
