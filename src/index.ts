/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(req, env, ctx): Promise<Response> {
		if (req.method === "OPTIONS") {
			return new Response('', {
				headers: {
					'content-type': 'application/json;charset=UTF-8',
					'Access-Control-Allow-Origin': req.headers.get("Origin")!,
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
					'Access-Control-Allow-Headers': '*',
				}
			});
		}

		const RECAPTCHA_TOKEN = env.RECAPTCHA_TOKEN;
		const MAILGUN_USER = env.MAILGUN_USER;
		const MAILGUN_KEY = env.MAILGUN_KEY;
		const MAILGUN_DOMAIN = env.MAILGUN_DOMAIN;
		const SMTP_TO = env.SMTP_TO;

		const body = await req.json();
		
		const data = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_TOKEN}&response=${body.token}`, {
			method: 'POST'
		}).then(res => res.json());

		if (data.success) {
			const form = new FormData();
			form.append('from', body.email);
			form.append('to', SMTP_TO);
			form.append('subject', `Contact Form Submission: ${body.name}`);
			form.append('text', `Phone: ${body.phone}, Message: ${body.message}`);

			const resp = await fetch(
				`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`,
				{
					method: 'POST',
					headers: {
						Authorization: 'Basic ' + btoa(`${MAILGUN_USER}:${MAILGUN_KEY}`)
					},
					body: form
				}
			);
			return new Response(JSON.stringify(resp), {
				headers: {
					'content-type': 'application/json;charset=UTF-8',
					'Access-Control-Allow-Origin': req.headers.get("Origin")!,
				}
			});
		}
		return new Response(JSON.stringify(data), {
			headers: {
				'content-type': 'application/json;charset=UTF-8',
					'Access-Control-Allow-Origin': req.headers.get("Origin")!,
			}
		});
	},
} satisfies ExportedHandler<Env>;
