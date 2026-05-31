import { Hono } from "hono";

const profilesRoute = new Hono();

profilesRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  return c.json({ profile: { id } });
});

export default profilesRoute;
