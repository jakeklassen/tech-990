import { requestInterceptor } from '#app/interceptor.js';
import { randEmail, randFullName } from '@ngneat/falso';
import axios from 'axios';
import { $ } from 'execa';
import { writeFile } from 'fs/promises';
import puppeteer from 'puppeteer';

const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const $$ = $({ cwd: '/home/jake/workspace/work/vehikl/vshred/vshred' });

const refunds = [
  [
    'platform',
    'order id',
    'order item sku',
    'braintree transaction id',
    'refund amount',
    'refund reason',
  ],
];

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      // '--disable-web-security',
      // '--disable-features=IsolateOrigins,site-per-process',
    ],
  });
  const page = await browser.newPage();

  await page.setRequestInterception(true);

  // Setup interceptors
  page.on('request', requestInterceptor);

  await page.goto('http://localhost:8080/login');

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  // Type into search box
  await page.type('input#email', 'super@example.com');
  await page.type('input#password', '123456');
  await waitFor(1000);
  await page.click('button[type="submit"]');

  for (let i = 0; i < 1; ++i) {
    try {
      await page.goto('http://localhost:8080/admin/users');

      await page.evaluate(async () => {
        const createUserButton = document.querySelector<HTMLButtonElement>(
          'button[title="Create user"]',
        );

        createUserButton?.click();
      });

      await page.waitForSelector('input#user-name');
      await page.type('input#user-name', randFullName());
      await page.type(
        'input#user-email',
        randEmail({ provider: 'example', suffix: 'com' }),
      );
      await page.type('input#user-password', '1234567');
      await page.type('input#user-confirm', '1234567');
      await page.click('button.btn.btn-primary');

      await page.waitForNavigation();

      const userId = page.url().split('/').at(-2);
      console.log({ userId });

      await page.waitForSelector('button#new-order');
      await page.click('button#new-order');

      await page.waitForNavigation();

      const orderId = page.url().split('/').pop();
      console.log(
        `Order found at: http://localhost:8080/admin/sales-agent/process-order/${orderId}`,
      );

      if (orderId == null) {
        console.error('Order ID not found');
        await browser.close();

        return;
      }

      await page.evaluate(
        async ({ orderId, userId }) => {
          const payload = {
            name: 'Home',
            street1: '3001 Las Vegas Blvd S',
            street2: '',
            city: 'Las Vegas',
            state: 'NV',
            postal_code: '89109',
            phone: '702-562-6104',
            country: 'US',
            type: 'shipping',
            user_id: userId,
          };

          const address = await axios
            .post('/api/addresses', payload)
            .then((res) => res.data.data);

          console.log(address);

          await axios.patch(
            `/api/orders/${orderId}/address/${address.id}/shipping`,
          );

          await axios.patch(
            `/api/orders/${orderId}/address/${address.id}/billing`,
          );

          const attachOfferResponse = await axios
            .post(
              `/api/orders/${orderId}/offers/bun_total_testosterone_optimization_program_otp/1`,
            )
            .then((res) => res.data);

          console.log(attachOfferResponse);
        },
        { orderId, userId },
      );

      // await page.evaluate(async () => {
      //   const placeOrderButton = document.querySelector<HTMLButtonElement>(
      //     '#place-order-button',
      //   );

      //   placeOrderButton?.click();
      // });

      // We need to reload the page to see the new offer since we went through the API
      await page.reload();

      await page.waitForSelector('button#place-order-button');
      await page.click('button#place-order-button');

      await page.waitForSelector('div.braintree-cc');

      const creditCardNumberFrameHandle = await page.waitForSelector(
        'iframe[id="braintree-hosted-field-number"]',
        { visible: true },
      );

      const creditCardNumberFrame =
        await creditCardNumberFrameHandle?.contentFrame();

      await creditCardNumberFrame?.type(
        'input[name="credit-card-number"]',
        '4242424242424242',
      );

      const creditCardExpirationFrameHandle = await page.waitForSelector(
        'iframe[id="braintree-hosted-field-expirationDate"]',
        { visible: true },
      );

      const creditCardExpirationFrame =
        await creditCardExpirationFrameHandle?.contentFrame();

      await creditCardExpirationFrame?.type(
        'input[name="expiration"]',
        '12/25',
      );

      const creditCardCvvFrameHandle = await page.waitForSelector(
        'iframe[id="braintree-hosted-field-cvv"]',
        { visible: true },
      );

      const creditCardCvvFrame = await creditCardCvvFrameHandle?.contentFrame();

      await creditCardCvvFrame?.type('input[name="cvv"]', '123');

      const creditCardPostalCodeFrameHandle = await page.waitForSelector(
        'iframe[id="braintree-hosted-field-postalCode"]',
        { visible: true },
      );

      const creditCardPostalCodeFrame =
        await creditCardPostalCodeFrameHandle?.contentFrame();

      await creditCardPostalCodeFrame?.type(
        'input[name="postal-code"]',
        '89101',
      );

      // The first one always fails
      await page.click('button#submitTransaction');
      await waitFor(1000);
      await page.click('button#submitTransaction');

      await page.waitForSelector(
        'a[href*="https://sandbox.braintreegateway.com"]',
      );

      // get a tag with partial url match on https://sandbox.braintreegateway.com
      const paymentId = await page.evaluate(() => {
        const a = document.querySelector<HTMLAnchorElement>(
          'a[href*="https://sandbox.braintreegateway.com"]',
        );

        return a?.text?.trim();
      });

      if (paymentId == null) {
        console.error('Payment ID not found');
        await browser.close();

        return;
      }

      console.log(
        await $$`./vendor/bin/sail artisan transaction:settle ${paymentId}`.then(
          (res) => res.stdout,
        ),
      );

      await page.reload();

      await page.waitForSelector('button ::-p-text(Refund)');

      await page.evaluate(
        async ({ orderId }) => {
          const order = await axios
            .get(
              `http://localhost:8080/api/orders/${orderId}?include=user,created-by,billing-address,shipping-address,subscription,notes.author,discount.coupon,payments,successful-payment,payment,owned-by-agents.user,sales-agents.user,items.cost_of_goods`,
            )
            .then((res) => res.data.data);

          const orderItem = order.items.find(
            (item: any) =>
              item.itemable_id ===
              'bun_total_testosterone_optimization_program_otp',
          );

          console.log({
            items: [
              {
                id: orderItem.id,
                amount: 66.74,
                revoke: true,
              },
            ],
            reason: 'mbg_money_back_guarantee',
          });

          await axios.patch(`/api/orders/${orderId}/refund`, {
            items: [
              {
                id: orderItem.id,
                amount: 66.74,
                revoke: true,
              },
            ],
            reason: 'mbg_money_back_guarantee',
          });
        },
        { orderId, userId },
      );

      refunds.push([
        'v shred',
        orderId,
        'bun_total_testosterone_optimization_program_otp',
        paymentId,
        '230.26',
        'ordered_in_error',
      ]);

      await page.reload();
    } catch (error) {
      console.error(error);
    }
  }

  await writeFile(
    './refunds.csv',
    refunds.map((row) => row.join(',')).join('\n'),
  );

  await browser.close();
})();
