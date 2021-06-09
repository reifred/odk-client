import i18n from '../../src/i18n';
import { flatpickrLocales, loadLocale } from '../../src/util/i18n';
import { i18nProps } from '../util/i18n';

describe('util/i18n', () => {
  describe('loadLocale()', () => {
    afterEach(() => {
      i18n.locale = 'en';
      document.querySelector('html').setAttribute('lang', 'en');
    });

    it('changes the locale', () =>
      loadLocale('es').then(() => {
        i18n.locale.should.equal('es');
        i18n.t('field.password').should.equal('Contraseña');
      }));

    it('changes the lang attribute', () =>
      loadLocale('es').then(() => {
        document.querySelector('html').getAttribute('lang').should.equal('es');
      }));

    it('loads the flatpickr locale', () =>
      loadLocale('es').then(() => {
        flatpickrLocales.es.weekdays.longhand[0].should.equal('Domingo');
      }));

    it('throws an error for a locale that is not defined', () => {
      let thrown = false;
      return loadLocale('la')
        .catch(() => {
          thrown = true;
        })
        .finally(() => {
          thrown.should.be.true();
        });
    });
  });

  describe('pluralization rules', () => {
    afterEach(() => {
      i18n.locale = 'en';
    });

    // Array of test cases by locale
    const cases = {
      cs: ['plural.webUser', [
        [0, 'Webových uživatelů'],
        [1, 'Webový uživatel'],
        [2, 'Weboví uživatelé'],
        [3, 'Weboví uživatelé'],
        [4, 'Weboví uživatelé'],
        [5, 'Webových uživatelů'],
        [100, 'Webových uživatelů']
      ]]
    };
    for (const [locale, [path, casesForLocale]] of Object.entries(cases)) {
      describe(locale, () => {
        before(() => loadLocale(locale));

        for (const [count, form] of casesForLocale) {
          it(`uses the correct form for ${count}`, () => {
            i18n.locale = locale;
            i18n.tc(path, count).should.equal(form);
          });
        }
      });
    }
  });

  describe('pluralization utilities', () => {
    beforeEach(() => {
      i18n.setLocaleMessage('la', {
        forms: '{count} Forma | {count} Formae',
        parts: '{name} est omnis divisa in partes {count}.',
        interpolation: {
          full: {
            0: 'Singular',
            1: 'Plural'
          }
        }
      });
      i18n.locale = 'la';
    });
    afterEach(() => {
      i18n.locale = 'en';
      i18n.setLocaleMessage('la', {});
    });

    describe('$tcn()', () => {
      it('returns the singular', () => {
        i18nProps.$tcn('forms', 1).should.equal('1 Forma');
      });

      it('returns the plural', () => {
        i18nProps.$tcn('forms', 1234).should.equal('1,234 Formae');
      });

      it('uses values', () => {
        const message = i18nProps.$tcn('parts', 3, { name: 'Gallia' });
        message.should.equal('Gallia est omnis divisa in partes 3.');
      });
    });

    describe('$tcPath()', () => {
      it('returns the correct path for the singular', () => {
        const path = i18nProps.$tcPath('interpolation.full', 1);
        path.should.equal('interpolation.full[0]');
      });

      it('returns the correct path for the plural', () => {
        const path = i18nProps.$tcPath('interpolation.full', 10);
        path.should.equal('interpolation.full[1]');
      });
    });
  });
});
