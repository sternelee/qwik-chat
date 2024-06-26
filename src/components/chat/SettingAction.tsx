import {
  $,
  component$,
  Slot,
  useContext,
  useSignal,
  useVisibleTask$,
  useComputed$,
} from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { toBlob, toJpeg } from "html-to-image";
import { defaultEnv } from "~/env";
import ProviderMap, { PROVIDER_LIST, type IProvider } from "~/providers";
import {
  type FakeRoleUnion,
  imgIcons,
  ChatContext,
  SUPPORT_VISION,
} from "~/store";
import type { ChatMessage, SimpleModel } from "~/types";
import {
  copyToClipboard,
  blobToBase64,
  dateFormat,
  delSession,
  generateId,
  getSession,
  isMobile,
  setSession,
} from "~/utils";
import { Selector, Switch as SwitchButton } from "./Common";

const roleIcons: Record<FakeRoleUnion, string> = {
  system: "i-ri:robot-2-fill bg-gradient-to-r from-yellow-300 to-red-700 ",
  assistant: "i-ri:android-fill bg-gradient-to-r from-yellow-300 to-red-700 ",
  normal: "i-ri:user-3-line",
  user: "i-ri:user-3-fill bg-gradient-to-r from-red-300 to-blue-700 ",
};

export default component$(() => {
  const store = useContext(ChatContext);
  const currentModel = useComputed$(() => store.sessionSettings.model);
  const isFirst = useSignal(true);
  const inputImageRef = useSignal<HTMLImageElement>();
  const models = useComputed$(
    () => ProviderMap[store.sessionSettings.provider].models
  );

  const navigator = useNavigate();

  const clearSession = $(() => {
    store.messageList = store.messageList.filter((k) => k.type === "locked");
    store.validContent = "";
    store.contextToken = 0;
  });

  useVisibleTask$(({ track }) => {
    track(() => store.showSetting);
    if (store.showSetting === "none" && !isFirst.value) {
      localStorage.setItem("gpt-APIKeys", JSON.stringify(store.globalSettings));
    }
    isFirst.value = false;
  });

  useVisibleTask$(({ cleanup }) => {
    const container = document.getElementById("setting-action");
    const listener = (e: any) => {
      if (container?.contains(e.target)) return;
      store.showSetting = "none";
    };
    document.addEventListener("click", listener);
    cleanup(() => document.removeEventListener("click", listener));
  });

  const handleSession = $(() => {
    let sessionID: string;
    do {
      sessionID = generateId();
    } while (getSession(sessionID));
    // @ts-ignore
    setSession(sessionID, {
      id: sessionID,
      lastVisit: Date.now(),
      settings: {
        ...defaultEnv.CLIENT_SESSION_SETTINGS,
        title: "新的对话",
      },
      messages: [],
    });
    navigator(`/?session=${sessionID}`);
    store.loadSession(sessionID);
  });

  return (
    <div class="text-sm my-2" id="setting-action">
      {store.showSetting === "global" && (
        <>
          <div class="<sm:max-h-10em max-h-14em overflow-y-auto">
            <SettingItem icon="i-carbon:machine-learning-model" label="AI服务">
              <Selector
                class="max-w-150px"
                value={store.sessionSettings.provider}
                onChange={$((e: any) => {
                  store.sessionSettings.provider = (
                    e.target as HTMLSelectElement
                  ).value as IProvider;
                  store.sessionSettings.model =
                    ProviderMap[store.sessionSettings.provider].defaultModel;
                })}
                options={PROVIDER_LIST.map((v) => ({
                  value: v,
                  label: v,
                }))}
              />
            </SettingItem>
            <SettingItem icon="i-carbon:machine-learning-model" label="模型">
              <Selector
                class="max-w-150px"
                value={
                  store.sessionSettings.model ||
                  ProviderMap[store.sessionSettings.provider].defaultModel
                }
                onChange={$((e: any) => {
                  store.sessionSettings.model = (e.target as HTMLSelectElement)
                    .value as SimpleModel;
                })}
                options={models.value}
              />
            </SettingItem>
            {!store.globalSettings.password && (
              <SettingItem
                icon="i-carbon:api"
                label={`${
                  ProviderMap[store.sessionSettings.provider].name
                } APIKey`}
              >
                <input
                  type="password"
                  value={
                    store.globalSettings.APIKeys[store.sessionSettings.provider]
                  }
                  class="input-box"
                  placeholder={`请输入 ${ProviderMap[store.sessionSettings.provider].placeholder}`}
                  onInput$={(e) => {
                    store.globalSettings.APIKeys[
                      store.sessionSettings.provider
                    ] = (e.target as HTMLInputElement).value;
                  }}
                />
              </SettingItem>
            )}
            <SettingItem icon="i-carbon:flow-modeler" label="请求后端转发">
              <SwitchButton
                checked={store.globalSettings.requestWithBackend}
                onChange={$((e: any) => {
                  store.globalSettings.requestWithBackend = (
                    e.target as HTMLInputElement
                  ).checked;
                })}
              />
            </SettingItem>
            {store.globalSettings.requestWithBackend && (
              <SettingItem icon="i-ri:lock-password-line" label="网站访问密码">
                <input
                  type="password"
                  value={store.globalSettings.password}
                  class="input-box"
                  onInput$={(e) => {
                    store.globalSettings.password = (
                      e.target as HTMLInputElement
                    ).value;
                  }}
                />
              </SettingItem>
            )}
            <SettingItem icon="i-carbon:keyboard" label="Enter 键发送消息">
              <SwitchButton
                checked={store.globalSettings.enterToSend}
                onChange={$((e: any) => {
                  store.globalSettings.enterToSend = (
                    e.target as HTMLInputElement
                  ).checked;
                })}
              />
            </SettingItem>
          </div>
          <hr class="my-1 bg-slate-5 bg-op-15 border-none h-1px"></hr>
        </>
      )}
      {store.showSetting === "session" && (
        <>
          <div class="<sm:max-h-10em max-h-14em overflow-y-auto">
            {store.sessionId !== "index" && (
              <SettingItem
                icon="i-carbon:text-annotation-toggle"
                label="对话标题"
              >
                <input
                  type="text"
                  value={store.sessionSettings.title}
                  class="input-box text-ellipsis"
                  onInput$={(e) => {
                    store.sessionSettings.title = (
                      e.target as HTMLInputElement
                    ).value;
                  }}
                />
              </SettingItem>
            )}
            <SettingItem icon="i-carbon:data-enrichment" label="思维发散程度">
              <div class="flex items-center justify-between w-150px">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={String(store.sessionSettings.APITemperature * 50)}
                  class="bg-slate max-w-100px w-full h-2 bg-op-15 rounded-lg appearance-none cursor-pointer accent-slate"
                  onInput$={(e) => {
                    store.sessionSettings.APITemperature =
                      Number(e.target as HTMLInputElement) / 50;
                  }}
                />
                <span class="bg-slate bg-op-15 rounded-sm px-1 text-10px">
                  {store.sessionSettings.APITemperature.toFixed(2)}
                </span>
              </div>
            </SettingItem>
            <SettingItem icon="i-carbon:save-image" label="记录对话内容">
              <SwitchButton
                checked={store.sessionSettings.saveSession}
                onChange={$((e: any) => {
                  store.sessionSettings.saveSession = (
                    e.target as HTMLInputElement
                  ).checked;
                })}
              />
            </SettingItem>
            <SettingItem
              icon="i-carbon:3d-curve-auto-colon"
              label="开启连续对话"
            >
              <SwitchButton
                checked={store.sessionSettings.continuousDialogue}
                onChange={$((e: any) => {
                  store.sessionSettings.continuousDialogue = (
                    e.target as HTMLInputElement
                  ).checked;
                })}
              />
            </SettingItem>
          </div>
          <hr class="my-1 bg-slate-5 bg-op-15 border-none h-1px"></hr>
        </>
      )}
      <div class="flex items-center justify-between">
        <div class="flex">
          <ActionItem
            onClick={$(() => {
              store.showSetting =
                store.showSetting !== "global" ? "global" : "none";
            })}
            icon="i-carbon:settings"
            label="全局设置"
          />
          <ActionItem
            onClick={$(() => {
              store.showSetting =
                store.showSetting !== "session" ? "session" : "none";
            })}
            icon="i-carbon:settings-services"
            label="对话设置"
          />
        </div>
        {store.showSetting === "global" && (
          <div class="flex">
            <ActionItem
              label="导出"
              onClick={exportData}
              icon="i-carbon:export"
            />
            <ActionItem
              label="导入"
              onClick={importData}
              icon="i-carbon:download"
            />
          </div>
        )}
        {store.showSetting === "session" && (
          <div class="flex">
            <ActionItem
              onClick={handleSession}
              icon="i-carbon:add-alt"
              label="新的对话"
            />
            {store.sessionId !== "index" && (
              <>
                <ActionItem
                  onClick={$(async () => {
                    await copyToClipboard(
                      window.location.origin + window.location.pathname
                    );
                    store.success = "link";
                    setTimeout(() => {
                      store.success = false;
                    }, 1000);
                  })}
                  icon={
                    store.success === "link"
                      ? "i-carbon:status-resolved dark:text-yellow text-yellow-6"
                      : "i-carbon:link"
                  }
                  label="复制链接"
                />
                <ActionItem
                  onClick={$(() => {
                    if (store.deleteSessionConfirm) {
                      store.deleteSessionConfirm = false;
                      delSession(store.sessionId);
                      // navigator("/", { replace: true });
                      // store.loadSession("index");
                      store.loadSession("index");
                      navigator("/");
                    } else {
                      store.deleteSessionConfirm = true;
                      setTimeout(() => {
                        store.deleteSessionConfirm = false;
                      }, 3000);
                    }
                  })}
                  icon={
                    store.deleteSessionConfirm
                      ? "i-carbon:checkmark animate-bounce text-red-6 dark:text-red"
                      : "i-carbon:trash-can"
                  }
                  label={store.deleteSessionConfirm ? "确定" : "删除对话"}
                />
              </>
            )}
          </div>
        )}
        {store.showSetting === "none" && (
          <div class="flex ml-auto">
            <input
              type="file"
              accept="image/*"
              ref={inputImageRef}
              style={{ width: 0, visibility: "hidden" }}
              onChange$={$(async (e: any) => {
                if (e.target.files?.length === 0) return;
                const file = e.target.files![0];
                const url = await blobToBase64(file);
                store.inputImage = url;
              })}
            />
            {SUPPORT_VISION.includes(currentModel.value) && (
              <ActionItem
                onClick={$(() => {
                  inputImageRef.value!.click();
                })}
                icon="i-carbon-image-search"
                label="图片识别"
              />
            )}
            <ActionItem
              onClick={$(() => {
                // TODO
                const _ = [
                  "normal",
                  "user",
                  "system",
                  "assistant",
                ] as FakeRoleUnion[];
                store.fakeRole = _[(_.indexOf(store.fakeRole) + 1) % _.length];
              })}
              icon={roleIcons[store.fakeRole]}
              label={
                {
                  system: "系统角色",
                  assistant: "智能AI",
                  user: "普通用户",
                  normal: "伪装角色",
                }[store.fakeRole]
              }
            />
            <ActionItem
              onClick={$(async () => {
                store.genImg = "loading";
                await exportJpg();
                setTimeout(() => {
                  store.genImg = "normal";
                }, 1000);
              })}
              icon={imgIcons[store.genImg]}
              label="导出图片"
            />
            <ActionItem
              label="导出MD"
              onClick={$(async () => {
                await exportMD(store.messageList);
                store.success = "markdown";
                setTimeout(() => {
                  store.success = false;
                }, 1000);
              })}
              icon={
                store.success === "markdown"
                  ? "i-carbon:status-resolved dark:text-yellow text-yellow-6"
                  : "i-ri:markdown-line"
              }
            />
            <ActionItem
              onClick={$(() => {
                if (store.clearSessionConfirm) {
                  clearSession();
                  store.clearSessionConfirm = false;
                } else {
                  store.clearSessionConfirm = true;
                  setTimeout(() => {
                    store.clearSessionConfirm = false;
                  }, 3000);
                }
              })}
              icon={
                store.clearSessionConfirm
                  ? "i-carbon:checkmark animate-bounce text-red-6 dark:text-red"
                  : "i-carbon:clean"
              }
              label={store.clearSessionConfirm ? "确定" : "清空对话"}
            />
          </div>
        )}
      </div>
    </div>
  );
});

const SettingItem = component$<{
  icon: string;
  label: string;
}>((props) => {
  return (
    <div class="flex items-center p-1 justify-between rounded">
      <div class="flex items-center">
        <button class={props.icon} />
        <span class="ml-1">{props.label}</span>
      </div>
      <Slot />
    </div>
  );
});

export const ActionItem = component$<{
  onClick: any;
  icon: string;
  label?: string;
}>((props) => {
  return (
    <div
      class="btn btn-ghost flex items-center cursor-pointer mx-1 p-2 rounded text-1.2em"
      onClick$={props.onClick}
      // @ts-ignore
      data-tooltip={props.label}
    >
      <button class={`${props.icon}`} title={props.label} />
    </div>
  );
});

async function exportJpg() {
  try {
    const messageContainer = document.querySelector(
      "#message-container-img"
    ) as HTMLElement;
    // eslint-disable-next-line no-inner-declarations
    async function downloadIMG() {
      const url = await toJpeg(messageContainer, { skipFonts: true });
      const a = document.createElement("a");
      a.href = url;
      a.download = `ChatGPT-${dateFormat(new Date(), "HH-MM-SS")}.jpg`;
      a.click();
    }
    if (!isMobile() && navigator.clipboard) {
      try {
        const blob = await toBlob(messageContainer, { skipFonts: true });
        console.log("1", blob);
        blob &&
          (await navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob,
            }),
          ]));
      } catch (err) {
        console.log("2", err);
        await downloadIMG();
      }
    } else {
      await downloadIMG();
    }
    // store.genImg = "success"
  } catch (err) {
    // TODO: not work
    // store.genImg = "error"
    console.log("3", err);
  }
}

async function exportMD(messages: ChatMessage[]) {
  const _ = messages.reduce((acc, k) => {
    if (k.role === "assistant" || k.role === "user") {
      if (k.role === "user") {
        acc.push([k]);
      } else {
        acc[acc.length - 1].push(k);
      }
    }
    return acc;
  }, [] as ChatMessage[][]);
  await copyToClipboard(
    _.filter((k) => k.length === 2)
      .map((k) => {
        return `> ${k[0].content}\n\n${k[1].content}`;
      })
      .join("\n\n---\n\n")
  );
}

const exportData = $(() => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([JSON.stringify(localStorage)], { type: "application/json" })
  );
  a.download = `ChatGPT-${dateFormat(new Date(), "HH-MM-SS")}.json`;
  a.click();
});

const importData = $(() => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.click();
  input.onchange = async () => {
    const file = input.files?.[0];
    if (file) {
      const text = await file.text();
      const data = JSON.parse(text);
      localStorage.clear();
      Object.keys(data).forEach((k) => {
        localStorage.setItem(k, data[k]);
      });
      window.location.href = "/";
    }
  };
});
