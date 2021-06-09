import FormDraftStatus from '../../../src/components/form-draft/status.vue';
import FormHead from '../../../src/components/form/head.vue';
import FormOverview from '../../../src/components/form/overview.vue';
import Loading from '../../../src/components/loading.vue';
import testData from '../../data';
import { load } from '../../util/http';
import { mockLogin } from '../../util/session';
import { trigger } from '../../util/event';

describe('FormHead', () => {
  describe('names and links', () => {
    beforeEach(mockLogin);

    it("shows the project's name", () => {
      testData.extendedProjects.createPast(1, { name: 'My Project', forms: 1 });
      testData.extendedForms.createPast(1);
      return load('/projects/1/forms/f').then(app => {
        const text = app.first('#form-head-project-nav span').text().trim();
        text.should.equal('My Project');
      });
    });

    it("appends (archived) to an archived project's name", () => {
      testData.extendedProjects.createPast(1, {
        name: 'My Project',
        archived: true,
        forms: 1
      });
      testData.extendedForms.createPast(1);
      return load('/projects/1/forms/f').then(app => {
        const text = app.first('#form-head-project-nav span').text().trim();
        text.should.equal('My Project (archived)');
      });
    });

    it("renders the project's name as a link", () => {
      testData.extendedForms.createPast(1);
      return load('/projects/1/forms/f').then(app => {
        const a = app.first('#form-head-project-nav span a');
        a.getAttribute('href').should.equal('#/projects/1');
      });
    });

    it('shows a link back to the project overview', () => {
      testData.extendedForms.createPast(1);
      return load('/projects/1/forms/f').then(app => {
        const a = app.find('#form-head-project-nav a');
        a.length.should.equal(2);
        a[1].getAttribute('href').should.equal('#/projects/1');
      });
    });

    it("shows the form's name", () => {
      testData.extendedForms.createPast(1, { name: 'My Form' });
      return load('/projects/1/forms/f').then(app => {
        const h1 = app.first('#form-head-form-nav .h1');
        h1.text().trim().should.equal('My Form');
        h1.getAttribute('title').should.equal('My Form');
      });
    });

    it("shows the form's xmlFormId if the form does not have a name", () => {
      testData.extendedForms.createPast(1, { name: null });
      return load('/projects/1/forms/f').then(app => {
        const h1 = app.first('#form-head-form-nav .h1');
        h1.text().trim().should.equal('f');
        h1.getAttribute('title').should.equal('f');
      });
    });
  });

  describe('tabs', () => {
    it('shows all tabs to an administrator', () => {
      mockLogin();
      testData.extendedForms.createPast(1, { draft: true });
      testData.standardFormAttachments.createPast(1, { exists: false });
      return load('/projects/1/forms/f/draft').then(app => {
        const tabs = app.find('#form-head-form-nav .nav-tabs a');
        const text = tabs.map(tab => tab.text().trim().iTrim());
        text.should.eql([
          'Overview',
          'Versions',
          'Submissions',
          'Public Access',
          'Settings',
          'Status',
          'Media Files 1',
          'Testing'
        ]);
      });
    });

    it('shows only select tabs to a project viewer', () => {
      mockLogin({ role: 'none' });
      testData.extendedProjects.createPast(1, { role: 'viewer', forms: 1 });
      testData.extendedForms.createPast(1, { draft: true });
      testData.standardFormAttachments.createPast(1);
      return load('/projects/1/forms/f/draft/testing').then(app => {
        const tabs = app.find('#form-head-form-nav .nav-tabs a');
        const text = tabs.map(tab => tab.text().trim());
        text.should.eql(['Versions', 'Submissions', 'Testing']);
      });
    });

    it('disables tabs for a form without a published version', () => {
      mockLogin();
      testData.extendedForms.createPast(1, { draft: true });
      return load('/projects/1/forms/f/draft').then(app => {
        const tabs = app.find('#form-head-form-tabs li');
        tabs.length.should.equal(5);
        for (const tab of tabs) {
          tab.hasClass('disabled').should.be.true();
          tab.getAttribute('title').should.equal('These functions will become available once you publish your Draft Form');
        }
      });
    });

    it('does not disable tabs for a form with a published version', () => {
      mockLogin();
      testData.extendedForms.createPast(1);
      testData.extendedFormVersions.createPast(1, { draft: true });
      return load('/projects/1/forms/f/draft').then(app => {
        const tabs = app.find('#form-head-form-tabs li');
        tabs.length.should.equal(5);
        for (const tab of tabs) {
          tab.hasClass('disabled').should.be.false();
          tab.hasAttribute('title').should.be.false();
        }
      });
    });
  });

  describe('Media Files tab', () => {
    beforeEach(() => {
      mockLogin();
      testData.extendedForms.createPast(1, { draft: true });
    });

    it('is not shown if there are no form attachments', () =>
      load('/projects/1/forms/f/draft').then(app => {
        const tabs = app.find('#form-head-draft-nav .nav-tabs a');
        tabs.map(a => a.text().trim()).should.eql(['Status', 'Testing']);
      }));

    it('is shown if there are form attachments', () => {
      testData.standardFormAttachments.createPast(2, { exists: false });
      return load('/projects/1/forms/f/draft').then(app => {
        const tabs = app.find('#form-head-draft-nav .nav-tabs a');
        const text = tabs.map(a => a.text().trim().iTrim());
        text.should.eql(['Status', 'Media Files 2', 'Testing']);
      });
    });

    describe('badge', () => {
      it('shows the correct count if all files are missing', () => {
        testData.standardFormAttachments.createPast(2, { exists: false });
        return load('/projects/1/forms/f/draft/attachments').then(app => {
          const badge = app.first('#form-head-draft-nav .nav-tabs .badge');
          badge.text().trim().should.equal('2');
        });
      });

      it('shows the correct count if only some files are missing', () => {
        testData.standardFormAttachments
          .createPast(1, { exists: true })
          .createPast(2, { exists: false });
        return load('/projects/1/forms/f/draft/attachments').then(app => {
          const badge = app.first('#form-head-draft-nav .nav-tabs .badge');
          badge.text().trim().should.equal('2');
        });
      });

      it('is not shown if all files exist', () => {
        testData.standardFormAttachments.createPast(2, { exists: true });
        return load('/projects/1/forms/f/draft/attachments').then(app => {
          const badge = app.first('#form-head-draft-nav .nav-tabs .badge');
          badge.should.be.hidden();
        });
      });
    });
  });

  describe('no draft', () => {
    it('does not render the draft nav for a project viewer', () => {
      mockLogin({ role: 'none' });
      testData.extendedProjects.createPast(1, { role: 'viewer', forms: 1 });
      testData.extendedForms.createPast(1);
      return load('/projects/1/forms/f/submissions').then(app => {
        app.find('#form-head-draft-nav').length.should.equal(0);
      });
    });

    it('does not show the tabs for the form draft to an administrator', () => {
      mockLogin();
      testData.extendedForms.createPast(1);
      return load('/projects/1/forms/f').then(app => {
        app.first('#form-head-draft-nav .nav-tabs').should.be.hidden();
      });
    });

    describe('create draft button', () => {
      beforeEach(() => {
        mockLogin();
        testData.extendedForms.createPast(1);
      });

      it('shows the button to an administrator', () =>
        load('/projects/1/forms/f').then(app => {
          app.first('#form-head-create-draft-button').should.be.visible();
        }));

      it('posts to the correct endpoint', () =>
        load('/projects/1/forms/f')
          .complete()
          .request(app => trigger.click(app, '#form-head-create-draft-button'))
          .beforeEachResponse((app, { method, url }) => {
            method.should.equal('POST');
            url.should.equal('/v1/projects/1/forms/f/draft');
          })
          .respondWithProblem());

      it('redirects to .../draft after a successful response', () =>
        load('/projects/1/forms/f')
          .complete()
          .request(app => trigger.click(app, '#form-head-create-draft-button'))
          .respondWithSuccess()
          .respondFor('/projects/1/forms/f/draft', {
            project: false,
            form: false,
            formDraft: () =>
              testData.extendedFormDrafts.createNew({ draft: true })
          })
          .afterResponses(app => {
            app.vm.$route.path.should.equal('/projects/1/forms/f/draft');
          }));

      it('shows a danger alert after a Problem response', () =>
        load('/projects/1/forms/f')
          .complete()
          .request(app => trigger.click(app, '#form-head-create-draft-button'))
          .beforeAnyResponse(app => {
            app.should.not.alert();
          })
          .respondWithProblem()
          .afterResponse(app => {
            app.should.alert('danger');
          }));

      it('shows a loading message during the request', () =>
        load('/projects/1/forms/f')
          .complete()
          .request(trigger.click('#form-head-create-draft-button'))
          .beforeAnyResponse(app => {
            app.first(Loading).should.be.visible();
            app.first(FormHead).should.be.hidden();
            app.first(FormOverview).vm.$el.parentNode.should.be.hidden();
          })
          .respondWithSuccess()
          .respondFor('/projects/1/forms/f/draft', {
            project: false,
            form: false,
            formDraft: () =>
              testData.extendedFormDrafts.createNew({ draft: true })
          })
          .afterResponses(app => {
            app.first(Loading).should.be.hidden();
            app.first(FormHead).should.be.visible();
            app.first(FormDraftStatus).should.be.visible();
          }));
    });
  });
});
