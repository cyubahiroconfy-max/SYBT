import type { Plugin } from "vite";

export function adminSetupPlugin(): Plugin {
  return {
    name: "admin-setup-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== "/api/admin-setup" || req.method !== "POST") {
          return next();
        }

        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = process.env.VITE_SUPABASE_URL;

        if (!serviceKey || !supabaseUrl) {
          res.statusCode = 503;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "SUPABASE_SERVICE_ROLE_KEY not configured in Replit Secrets" }));
          return;
        }

        let body = "";
        req.on("data", (chunk) => { body += chunk; });
        req.on("end", async () => {
          try {
            const { username, email, password } = JSON.parse(body);

            if (!username || !email || !password) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "username, email, and password are required" }));
              return;
            }

            const checkRes = await fetch(
              `${supabaseUrl}/rest/v1/user_roles?role=eq.admin&select=id&limit=1`,
              {
                headers: {
                  apikey: serviceKey,
                  Authorization: `Bearer ${serviceKey}`,
                },
              }
            );
            const existingAdmins = await checkRes.json();

            if (Array.isArray(existingAdmins) && existingAdmins.length > 0) {
              res.statusCode = 409;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "An admin account already exists" }));
              return;
            }

            const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: serviceKey,
                Authorization: `Bearer ${serviceKey}`,
              },
              body: JSON.stringify({
                email,
                password,
                email_confirm: true,
                user_metadata: { username },
              }),
            });

            const user = await createRes.json();

            if (!createRes.ok) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: user.msg || user.message || "Failed to create user" }));
              return;
            }

            await fetch(`${supabaseUrl}/rest/v1/profiles`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: serviceKey,
                Authorization: `Bearer ${serviceKey}`,
                Prefer: "return=minimal",
              },
              body: JSON.stringify({ id: user.id, username, full_name: "Administrator" }),
            });

            await fetch(`${supabaseUrl}/rest/v1/user_roles`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: serviceKey,
                Authorization: `Bearer ${serviceKey}`,
                Prefer: "return=minimal",
              },
              body: JSON.stringify({ user_id: user.id, role: "admin" }),
            });

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true, message: "Admin account created successfully" }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Internal server error" }));
          }
        });
      });
    },
  };
}
