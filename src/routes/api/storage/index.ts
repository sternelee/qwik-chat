import { v4 } from "uuid";
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import type { RequestHandler } from "@builder.io/qwik-city";
import type { IChatSession } from "~/types";

const client = new DynamoDBClient({});

export const onGet: RequestHandler = async ({ sharedMap, json, env }) => {
  const session: IChatSession | null = sharedMap.get("session");
  const { Item } = await client.send(
    new GetItemCommand({
      TableName: env.get("TABLE_NAME"),
      Key: {
        user_id: { S: session?.user?.email || "" },
      },
    }),
  );
  json(200, Item);
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
  const res = await client.send(
    new PutItemCommand({
      TableName: env.get("TABLE_NAME"),
      Item,
    }),
  );
  json(200, res);
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
  const { Attributes } = await client.send(
    new UpdateItemCommand({
      TableName: env.get("TABLE_NAME"),
      Key: {
        id: { S: id },
      },
      UpdateExpression: "set content = :c",
      ExpressionAttributeValues: {
        ":c": { S: body },
      },
      ReturnValues: "ALL_NEW",
    }),
  );
  json(200, Attributes);
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
  await client.send(
    new DeleteItemCommand({
      TableName: env.get("TABLE_NAME"),
      Key: {
        id: { S: id },
      },
    }),
  );

  json(204, {});
};
