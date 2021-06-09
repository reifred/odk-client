import DateTime from '../../../src/components/date-time.vue';
import ProjectRow from '../../../src/components/project/row.vue';
import testData from '../../data';
import { load } from '../../util/http';
import { mockLogin } from '../../util/session';

describe('ProjectRow', () => {
  beforeEach(mockLogin);

  it('renders the project name correctly', () => {
    testData.extendedProjects.createPast(1, { name: 'My Project' });
    return load('/').then(app => {
      const a = app.first(ProjectRow).first('.name a');
      a.text().trim().should.equal('My Project');
      a.getAttribute('href').should.equal('#/projects/1');
    });
  });

  describe('link to show projects introduction', () => {
    it('shows the link in a fresh install', async () => {
      testData.extendedProjects.createPast(1, { name: 'Default Project' });
      const app = await load('/');
      app.first('.project-row td').first('a[href="#"]').should.be.visible();
    });

    it('does not render the link if there are multiple projects', async () => {
      testData.extendedProjects
        .createPast(1, { name: 'Default Project' })
        .createPast(1, { name: 'Second Project' });
      const app = await load('/');
      app.first('.project-row td').find('a[href="#"]').length.should.equal(0);
    });
  });

  it('shows the form count', () => {
    testData.extendedProjects.createPast(1, { forms: 2 });
    return load('/').then(app => {
      const text = app.first(ProjectRow).find('td')[1].text().trim();
      text.should.equal('2 Forms');
    });
  });

  describe('last submission date', () => {
    it('shows the date', () => {
      const now = new Date().toISOString();
      testData.extendedProjects.createPast(1, { lastSubmission: now });
      return load('/').then(app => {
        app.first(ProjectRow).first(DateTime).getProp('iso').should.equal(now);
      });
    });

    it('shows (none) if there has been no submission', () => {
      testData.extendedProjects.createPast(1, { lastSubmission: null });
      return load('/').then(app => {
        const text = app.first(ProjectRow).find('td')[2].text().trim();
        text.should.equal('(none)');
      });
    });
  });

  describe('archived project', () => {
    it('adds an HTML class to the row', () => {
      testData.extendedProjects.createPast(1, { archived: true });
      return load('/').then(app => {
        app.first(ProjectRow).hasClass('archived').should.be.true();
      });
    });

    it("appends (archived) to the project's name", () => {
      testData.extendedProjects.createPast(1, {
        name: 'My Project',
        archived: true
      });
      return load('/').then(app => {
        const text = app.first('.project-row .name a').text().trim();
        text.should.equal('My Project (archived)');
      });
    });
  });
});
