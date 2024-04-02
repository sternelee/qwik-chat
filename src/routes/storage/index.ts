import { v4 } from "uuid";
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import type { RequestHandler } from "@builder.io/qwik-city";

const client = new DynamoDBClient({});

export const onGet: RequestHandler = async ({ query, json, env }) => {
  const { Item } = await client.send(
    new GetItemCommand({
      TableName: env.get("TABLE_NAME"),
      Key: {
        user_id: { S: query.get("user_id") || "" },
      },
    }),
  );
  json(200, Item);
};

export const onPost: RequestHandler = async ({ env, json, parseBody }) => {
  const body = (await parseBody()) as any;
  const Item = {
    id: { S: v4() },
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

export const onPut: RequestHandler = async ({ env, json, parseBody }) => {
  const { id, ...body } = (await parseBody()) as any;
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

export const onDelete: RequestHandler = async ({ env, json, parseBody }) => {
  const { id } = (await parseBody()) as any;
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
