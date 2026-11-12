# Connect the itinerary email

The website prepares Yen's email directly from `src/data/anniversary.ts`, including every itinerary stop, the date, and the planning note. No times or venues are invented. The full itinerary appears **inside the email**, so no attachment or paid attachment feature is needed.

The template matches the website's burgundy, blush, ivory, and champagne palette. It opens with a personal greeting and thank-you, then shows the celebration date, one dinner card with the venue photo and requested dress code, and Maki's signature. Text, date, and itinerary content stay synchronized with the central configuration. After updating the template file, paste its updated HTML into EmailJS to include the new photo and dress-code fields in live messages.

Delivery requires your own connected email service. Until the setup below is complete, accepting the invitation still works, but the website must not claim an email was sent.

## 1. Connect your sender in EmailJS

Create an [EmailJS account](https://www.emailjs.com/), then add an Email Service and connect the sender account you want to use, such as Gmail. Keep passwords, provider credentials, and private keys out of the website and out of chat.

EmailJS supports a browser-based integration without a separate backend; it keeps the connected sender's authentication details on its service. See [how EmailJS works](https://www.emailjs.com/docs/introduction/how-does-emailjs-work/).

## 2. Create the fixed-recipient template

Create an Email Template, open its HTML/content editor, and paste the contents of [`email/emailjs-template.html`](./email/emailjs-template.html).

Use the template file with `{{variables}}` for EmailJS. The filled [`email/email-preview.html`](./email/email-preview.html) and PNG previews are for reviewing the design. Regenerate them after editing the central data by running `npm run email:preview`; this checks the content and narrow layouts without sending any email. Preview screenshots use the same installed Chrome setup as the browser tests.

Configure its fields:

| Template field | Value |
| --- | --- |
| To Email | Enter Yen's real address directly in the dashboard. Keep this field fixed. |
| Subject | `{{email_subject}}` |
| From Name | `{{from_name}}` |
| From Email | Use the default address belonging to your connected Email Service. |
| Reply-To | Optionally enter the sender's real address directly in the dashboard. |
| CC / BCC | Leave blank unless you intentionally want additional recipients. |

Do **not** use a visitor-controlled `{{to_email}}` parameter for the recipient. The client sends no recipient address: the private dashboard setting determines where the itinerary goes. This prevents the normal website flow from choosing arbitrary recipients, while keeping Yen's address out of the public website source.

The template uses escaped double-brace variables and a loop over the `itinerary` array. Keep the double braces; do not change them to triple-brace HTML. [EmailJS template variables](https://www.emailjs.com/docs/user-guide/dynamic-variables-templates/) support this syntax and escape ordinary values.

## 3. Add the public configuration

Find the Service ID under Email Services, the Template ID under Email Templates, and the Public Key in your EmailJS account. Create an ignored **`.env.local`** file in the project folder and fill these values:

```dotenv
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

These are the browser integration's **public identifiers**, not private credentials. Vite includes `VITE_` values in the public JavaScript bundle. Never put a Gmail password, app password, SMTP password, or EmailJS private key in these variables. EmailJS explains the distinction in its [public-key guidance](https://www.emailjs.com/docs/faq/is-it-okay-to-expose-my-public-key/).

Restart `npm run dev` after changing environment values. The email service uses the [EmailJS send endpoint](https://www.emailjs.com/docs/rest-api/send/); it does not need another client package.

## 4. Keep rehearsal safe

Local development defaults to **preview mode**, which does not send email when you test Yes or restart the invitation. The browser tests mock email responses and do not send messages.

Only when you intentionally want a real development send, add this to `.env.local`, then restart Vite:

```dotenv
VITE_EMAIL_SEND_IN_PREVIEW=true
```

Keep the template's recipient set to an address you control while checking the real sender connection. Change it to Yen's intended address in the dashboard when the invitation is ready. Then remove the preview-send setting if you want future rehearsals to remain silent.

The browser records its email request state to reduce repeat sends. Refreshing an accepted invitation does not itself request another email. This is **browser-only duplicate prevention**, not a global guarantee across devices, cleared storage, or separate browsers. If a network interruption leaves the delivery result uncertain, check the inbox and EmailJS history before choosing to retry. An accepted request is not a guarantee that a mailbox delivered it to the inbox.

## 5. Deploy

In Vercel or Netlify, add the same three public configuration variables to the project's environment settings. Do not add the development preview-send override for a normal production build. Rebuild/redeploy after environment or itinerary changes; Vite embeds both at build time.

Set `siteUrl` in `src/data/anniversary.ts` to the real deployed HTTPS address. If it is empty or a local/testing URL, the email omits the invitation link. Maps links are included only when they pass the same Google Maps URL validation used by the website.

Before sharing, review `email` and `itinerary` in the data file. The email preserves placeholders and the planning note, so replace those when your day is finalized.

## Free-plan limits and privacy

At the time of setup, EmailJS lists a free plan with **200 monthly requests**, **two templates**, and **no attachments**. Domain allowlisting is a paid-plan feature and is not required by this integration. Check the current [EmailJS pricing page](https://www.emailjs.com/pricing/) before choosing a plan.

Keep the recipient fixed, use only the supplied template, and monitor your provider's quota. Client-side duplicate prevention does not stop someone from calling a public API directly.

Once sending is enabled, EmailJS and the connected email provider handle the recipient and itinerary to deliver the message. The site does not ask Yen to enter personal information or expose her email address in its client code. This integration emails the itinerary to Yen; it does not add an RSVP notification to Maki or another recipient.
