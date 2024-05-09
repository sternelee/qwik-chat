import { v4 } from "uuid";
import type { RequestHandler } from "@builder.io/qwik-city";
import type { IChatSession } from "~/types";

export const onGet: RequestHandler = async ({ sharedMap, json, env }) => {
  const session: IChatSession | null = sharedMap.get("session");
  json(200, []);
};

export const onPost: RequestHandler = async ({
  env,
  sharedMap,
  json,
  parseBody,
}) => {
  const session: IChatSession | null = sharedMap.get("session");
  if (!session?.user) {
    json(403, null);
    return;
  }
  const body = (await parseBody()) as any;
  const Item = {
    id: { S: v4() },
    user_id: session.user?.email || "",
    ...body,
  };
  json(200, {});
};

export const onPut: RequestHandler = async ({
  env,
  sharedMap,
  json,
  parseBody,
}) => {
  const session: IChatSession | null = sharedMap.get("session");
  const { id, ...body } = (await parseBody()) as any;
  if (!session?.user) {
    json(403, null);
    return;
  }
  json(200, {});
};

export const onDelete: RequestHandler = async ({
  env,
  sharedMap,
  json,
  parseBody,
}) => {
  const session: IChatSession | null = sharedMap.get("session");
  const { id } = (await parseBody()) as any;
  if (!session?.user) {
    json(403, null);
    return;
  }
  json(204, {});
};
