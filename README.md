# Contact Form Backend

A simple Cloudflare worker that uses MailGun's free tier API and ReCaptcha to provide a contact form backend.  Fork, deploy, and customize to your heart's content.

# Deployment

1. Sign up for [Google's ReCaptcha](https://www.google.com/recaptcha/about/).
2. Add a new site.  Copy the `Site Key` and `Site Secret` somewhere safe.  Make sure to add the url of your contact us form.
3. Sign up for [MailGun](https://mailgun.com).  For less than 100 form submissions per day, the free tier should be sufficient.  For more submissions, you'll need to upgrade to a paid plan.
4. If using a custom domain, add your domain and setup MX records.
5. For your sending domain, setup an API sending key.
6. Fork this repository.
7. Update the vars in `wrangler.toml` to have your sending domain, your mailgun username, and your contact form submission receipt email.
8. Add a secret `npx wrangler secret put MAILGUN_KEY`.  The value will be your API sending key for mailgun.
9. Add another secret `npx wrangler secret put RECAPTCHA_TOKEN`.  The value will be your ReCaptcha domain secret.
10. Deploy the worker and copy the deployed url.
11. Set the deployed url as a domain on your ReCaptcha site.

# Usage

Create a form and link it up!

```html
<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script is:inline src="https://www.google.com/recaptcha/api.js?render=SITE_KEY"></script>
</head>
<body>
  <div class="h-5/6 grid grid-cols-1">
    <form id="contact-form" class="mx-auto mt-16 max-w-xl sm:mt-20">
      <div class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
        <div>
          <label for="first_name" class="block text-sm font-semibold leading-6 text-gray-900">First name</label>
          <div class="mt-2.5">
            <input required type="text" name="first_name" id="first_name" autocomplete="given-name" class="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
          </div>
        </div>
        <div>
          <label for="last_name" class="block text-sm font-semibold leading-6 text-gray-900">Last name</label>
          <div class="mt-2.5">
            <input required type="text" name="last_name" id="last_name" autocomplete="family-name" class="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
          </div>
        </div>
        <div class="sm:col-span-2">
          <label for="email" class="block text-sm font-semibold leading-6 text-gray-900">Email</label>
          <div class="mt-2.5">
            <input required type="email" name="email" id="email" autocomplete="email" class="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
          </div>
        </div>
        <div class="sm:col-span-2">
          <label for="message" class="block text-sm font-semibold leading-6 text-gray-900">Message</label>
          <div class="mt-2.5">
            <textarea required name="message" id="message" rows="4" class="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"></textarea>
          </div>
        </div>
      </div>
      <div class="mt-10">
        <button type="submit" class="block w-full rounded-md bg-green-500 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-green-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Let's talk</button>
      </div>
    </form>
  </div>
  <script>
    const form = document.getElementById('contact-form');
    if (form) {
      form.onsubmit = function(e) {
        e.preventDefault();
        grecaptcha.ready(function() {
          grecaptcha.execute('SITE_KEY', {action: 'submit'}).then(function(token) {
            fetch('WORKER_URL', {
              method: 'POST',
              body: JSON.stringify({
                token,
                first_name: document.getElementById('first_name')?.value,
                last_name: document.getElementById('last_name')?.value,
                email: document.getElementById('email')?.value,
                message: document.getElementById('message')?.value,
              })
            })
            .then(res => res.json())
            .then(res => {
              alert('Thanks!');
            })
          })
        })
      };
    }
  </script>
</body>
</html>
```

> Note: You will need to replace `SITE_KEY` twice in the above sample with your Google ReCaptcha site key.  You will need to replace `WORKER_URL` once with your deployed CloudFlare worker url.

# LICENSE

This repository and its contents are license under a MIT license. For more details, see [LICENSE.md](LICENSE.md).
