import { countries } from '#app/countries.js';
import { HTTPRequest } from 'puppeteer';

export const requestInterceptor = (interceptedRequest: HTTPRequest) => {
  if (interceptedRequest.isInterceptResolutionHandled()) {
    return;
  }

  if (
    interceptedRequest.url().startsWith('http://localhost:8080/api/bundles')
  ) {
    interceptedRequest.respond({
      body: JSON.stringify({
        data: [],
        links: {
          first: 'http://localhost:8080/api/bundles?page=1',
          last: 'http://localhost:8080/api/bundles?page=1',
          prev: null,
          next: null,
        },
        meta: {
          current_page: 1,
          from: 1,
          last_page: 1,
          links: [
            {
              url: null,
              label: '&laquo; Previous',
              active: false,
            },
            {
              url: 'http://localhost:8080/api/bundles?page=1',
              label: '1',
              active: true,
            },
            {
              url: null,
              label: 'Next &raquo;',
              active: false,
            },
          ],
          path: 'http://localhost:8080/api/bundles',
          per_page: 250,
          to: 198,
          total: 198,
        },
      }),
    });
  } else if (
    interceptedRequest.url().startsWith('http://localhost:8080/api/coupons')
  ) {
    interceptedRequest.respond({
      body: JSON.stringify({
        data: [],
        links: {
          first: 'http://localhost:8080/api/coupons?page=1',
          last: 'http://localhost:8080/api/coupons?page=1',
          prev: null,
          next: null,
        },
        meta: {
          current_page: 1,
          from: 1,
          last_page: 1,
          links: [
            {
              url: null,
              label: '&laquo; Previous',
              active: false,
            },
            {
              url: 'http://localhost:8080/api/coupons?page=1',
              label: '1',
              active: true,
            },
            {
              url: null,
              label: 'Next &raquo;',
              active: false,
            },
          ],
          path: 'http://localhost:8080/api/coupons',
          per_page: 500,
          to: 170,
          total: 170,
        },
      }),
    });
  } else if (
    interceptedRequest.url().startsWith('http://localhost:8080/api/offers')
  ) {
    interceptedRequest.respond({
      body: JSON.stringify({
        data: [],
        links: {
          first: 'http://localhost:8080/api/offers?page=1',
          last: 'http://localhost:8080/api/offers?page=3',
          prev: null,
          next: 'http://localhost:8080/api/offers?page=2',
        },
        meta: {
          current_page: 1,
          from: 1,
          last_page: 3,
          links: [
            {
              url: null,
              label: '&laquo; Previous',
              active: false,
            },
            {
              url: 'http://localhost:8080/api/offers?page=1',
              label: '1',
              active: true,
            },
            {
              url: 'http://localhost:8080/api/offers?page=2',
              label: '2',
              active: false,
            },
            {
              url: 'http://localhost:8080/api/offers?page=3',
              label: '3',
              active: false,
            },
            {
              url: 'http://localhost:8080/api/offers?page=2',
              label: 'Next &raquo;',
              active: false,
            },
          ],
          path: 'http://localhost:8080/api/offers',
          per_page: 250,
          to: 250,
          total: 590,
        },
      }),
    });
  } else if (
    interceptedRequest.url().startsWith('http://localhost:8080/api/plans')
  ) {
    interceptedRequest.respond({
      body: JSON.stringify({
        data: [],
        links: {
          first: 'http://localhost:8080/api/plans?page=1',
          last: 'http://localhost:8080/api/plans?page=1',
          prev: null,
          next: null,
        },
        meta: {
          current_page: 1,
          from: 1,
          last_page: 1,
          links: [
            {
              url: null,
              label: '&laquo; Previous',
              active: false,
            },
            {
              url: 'http://localhost:8080/api/plans?page=1',
              label: '1',
              active: true,
            },
            {
              url: null,
              label: 'Next &raquo;',
              active: false,
            },
          ],
          path: 'http://localhost:8080/api/plans',
          per_page: 500,
          to: 100,
          total: 100,
        },
      }),
    });
  } else if (
    interceptedRequest.url().startsWith('http://localhost:8080/api/countries')
  ) {
    interceptedRequest.respond({
      body: JSON.stringify(countries),
    });
  } else {
    interceptedRequest.continue();
  }
};
