import { createContextId, type QRL, type NoSerialize } from "@builder.io/qwik";

export interface IPile {
  name: string;
  path: string;
  createdAt: string | null; // 创建日期
  updatedAt: string | null; // 更新日期
}

export interface IPost {
  title: string; // 标题
  content: string; // 内容
  createdAt: string | null; // 创建日期
  updatedAt: string | null; // 更新日期
  attachments: string[]; // 附件
  color: string | null; // background 背景色
  area: string | null;
  tags: string[];
  replies: IPost[];
  isReply: boolean;
  isAI: boolean;
}

interface IPileStore {
  piles: IPile[]
}

export const PileContext = createContextId<IPileStore>("pileContext");
