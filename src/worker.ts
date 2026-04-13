import { LOG_LEVEL, LogLevel } from "@ubiquity-os/ubiquity-os-logger";
import { createPlugin } from "@ubiquity-os/plugin-sdk";
import { Manifest } from "@ubiquity-os/plugin-sdk/manifest";
import { ExecutionContext } from "hono";
import { env } from "hono/adapter";
import manifest from "../manifest.json";
import { runPlugin } from "./index";
import { Env, envSchema, PluginSettings, pluginSettingsSchema, SupportedEvents } from "./types";

export default {
  async fetch(request: Request, serverInfo: Record<string, unknown>, executionCtx?: ExecutionContext) {
    const environment = env<Env>(request as never) as Env & {
      KERNEL_PUBLIC_KEY?: string;
      LOG_LEVEL?: string;
      NODE_ENV?: string;
    };
    return createPlugin<PluginSettings, Env, null, SupportedEvents>(
      (context) => {
        return runPlugin(context);
      },
      manifest as Manifest,
      {
        envSchema: envSchema,
        postCommentOnError: true,
        settingsSchema: pluginSettingsSchema,
        logLevel: (environment.LOG_LEVEL as LogLevel) || LOG_LEVEL.INFO,
        kernelPublicKey: environment.KERNEL_PUBLIC_KEY,
        bypassSignatureVerification: (environment as Env & { NODE_ENV?: string }).NODE_ENV === "local",
      }
    ).fetch(request, serverInfo, executionCtx);
  },
};
