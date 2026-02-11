import { LOG_LEVEL, LogLevel } from "@ubiquity-os/ubiquity-os-logger";
import { createPlugin } from "@ubiquity-os/plugin-sdk";
import { Manifest } from "@ubiquity-os/plugin-sdk/manifest";
import manifest from "../manifest.json";
import { runPlugin } from "./index";
import { Env, envSchema, PluginSettings, pluginSettingsSchema, SupportedEvents } from "./types";

function createApp(env: Env) {
  return createPlugin<PluginSettings, Env, null, SupportedEvents>(
    (context) => {
      return runPlugin(context);
    },
    manifest as Manifest,
    {
      envSchema: envSchema,
      postCommentOnError: true,
      settingsSchema: pluginSettingsSchema,
      logLevel: (env.LOG_LEVEL as LogLevel) || LOG_LEVEL.INFO,
      kernelPublicKey: env.KERNEL_PUBLIC_KEY,
      bypassSignatureVerification: process.env.NODE_ENV === "local",
    }
  );
}

type PluginExecutionContext = Parameters<ReturnType<typeof createApp>["fetch"]>[2];

export default {
  async fetch(request: Request, env: Env, executionCtx?: PluginExecutionContext) {
    return createApp(env).fetch(request, env, executionCtx);
  },
};
